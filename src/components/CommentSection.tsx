import React, { useState, useEffect, useCallback } from 'react';
import { Comment } from '../types/index.js';
import { api } from '../services/api.js';
import { useContent } from '../context/ContentContext.js';
import { MessageSquare, Heart, Flag, Eye, EyeOff, Send, ShieldAlert, CheckCircle, CornerDownRight } from 'lucide-react';

interface CommentSectionProps {
  chapterId: string;
  chapterTitle: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ chapterId, chapterTitle }) => {
  const { isAuthorLoggedIn, authorName } = useContent();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New comment state
  const [authorInput, setAuthorInput] = useState('');
  const [contentInput, setContentInput] = useState('');
  const [isSpoilerInput, setIsSpoilerInput] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Reply state
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyAuthorInput, setReplyAuthorInput] = useState('');
  const [replyContentInput, setReplyContentInput] = useState('');
  const [replyIsSpoiler, setReplyIsSpoiler] = useState(false);

  // Spoilers reveal state: set of revealed comment IDs
  const [revealedSpoilers, setRevealedSpoilers] = useState<Set<string>>(new Set());

  // Report modal state
  const [reportingCommentId, setReportingCommentId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('Contains unmarked spoilers');
  const [reportSuccess, setReportSuccess] = useState(false);

  // Liked comment IDs in current session
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());

  const [formError, setFormError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getComments(chapterId);
      setComments(data);
    } catch (err: any) {
      setError(err.message || 'Could not load chapter discussions.');
    } finally {
      setLoading(false);
    }
  }, [chapterId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contentInput.trim()) return;
    setFormError(null);

    try {
      setSubmitting(true);
      await api.postComment({
        chapterId,
        authorName: isAuthorLoggedIn ? authorName : (authorInput.trim() || 'Curious Reader'),
        content: contentInput.trim(),
        isSpoiler: isSpoilerInput,
      });

      setContentInput('');
      setIsSpoilerInput(false);
      await fetchComments();
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePostReply = async (parentId: string) => {
    if (!replyContentInput.trim()) return;
    setFormError(null);

    try {
      setSubmitting(true);
      await api.postComment({
        chapterId,
        parentId,
        authorName: isAuthorLoggedIn ? authorName : (replyAuthorInput.trim() || 'Curious Reader'),
        content: replyContentInput.trim(),
        isSpoiler: replyIsSpoiler,
      });

      setReplyingToId(null);
      setReplyContentInput('');
      setReplyIsSpoiler(false);
      await fetchComments();
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit reply');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (commentId: string) => {
    if (likedComments.has(commentId)) return;
    try {
      const updatedCount = await api.reactToComment(commentId);
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, likesCount: updatedCount } : c))
      );
      setLikedComments((prev) => new Set(prev).add(commentId));
    } catch (err) {
      console.error('Failed to react to comment:', err);
    }
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingCommentId) return;

    try {
      await api.reportComment(reportingCommentId, reportReason);
      setReportSuccess(true);
      setTimeout(() => {
        setReportingCommentId(null);
        setReportSuccess(false);
        fetchComments();
      }, 1500);
    } catch (err) {
      setFormError('Failed to report comment.');
    }
  };

  const toggleSpoiler = (id: string) => {
    setRevealedSpoilers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Group top-level comments and replies
  const rootComments = comments.filter((c) => !c.parentId);
  const repliesMap = new Map<string, Comment[]>();
  comments.forEach((c) => {
    if (c.parentId) {
      const existing = repliesMap.get(c.parentId) || [];
      existing.push(c);
      repliesMap.set(c.parentId, existing);
    }
  });

  return (
    <section className="mt-20 pt-12 border-t border-[#393039]/60 max-w-3xl mx-auto">
      {/* Section Header */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#A9A0A5]">
            <MessageSquare className="w-3.5 h-3.5 text-[#6D293B]" />
            <span>Chapter Discussion</span>
          </div>
          <h3 className="font-serif-display text-2xl md:text-3xl font-medium text-[#F0E8DC] mt-1">
            Echoes in the Belfry
          </h3>
          <p className="text-xs text-[#A9A0A5] mt-1">
            Perspectives, theories, and reflections on “{chapterTitle}”
          </p>
        </div>
        <div className="text-xs text-[#A9A0A5] tabular-nums">
          {comments.length} {comments.length === 1 ? 'thought' : 'thoughts'}
        </div>
      </div>

      {/* Main Comment Form */}
      <form onSubmit={handlePostComment} className="bg-[#18131a] border border-[#393039] p-5 rounded-sm mb-12 shadow-sm">
        {formError && (
          <div className="mb-3 p-2.5 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-sm">
            {formError}
          </div>
        )}
        <div className="mb-3">
          {isAuthorLoggedIn ? (
            <div className="flex items-center gap-2 text-xs text-[#F0E8DC]">
              <span className="w-2 h-2 rounded-full bg-[#6D293B]" />
              <span>Posting as verified author:</span>
              <strong className="text-[#F0E8DC] font-semibold">{authorName}</strong>
            </div>
          ) : (
            <div>
              <label htmlFor="reader-name" className="block text-xs uppercase tracking-wider text-[#A9A0A5] mb-1">
                Your Pen Name or Reader Alias
              </label>
              <input
                id="reader-name"
                type="text"
                value={authorInput}
                onChange={(e) => setAuthorInput(e.target.value)}
                placeholder="e.g. A Raven at Twilight"
                className="w-full bg-[#111013] border border-[#393039] px-3 py-2 text-sm text-[#F0E8DC] placeholder-[#A9A0A5]/40 rounded-sm focus:outline-none focus:border-[#6D293B]"
                maxLength={40}
              />
            </div>
          )}
        </div>

        <div className="mb-3">
          <label htmlFor="reader-thought" className="block text-xs uppercase tracking-wider text-[#A9A0A5] mb-1">
            Your Reflection
          </label>
          <textarea
            id="reader-thought"
            value={contentInput}
            onChange={(e) => setContentInput(e.target.value)}
            placeholder="Share an interpretation, observation, or what lingered with you..."
            rows={3}
            className="w-full bg-[#111013] border border-[#393039] p-3 text-sm text-[#F0E8DC] placeholder-[#A9A0A5]/40 rounded-sm focus:outline-none focus:border-[#6D293B] font-sans"
            required
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[#393039]/40">
          <label className="flex items-center gap-2 text-xs text-[#A9A0A5] cursor-pointer hover:text-[#F0E8DC]">
            <input
              type="checkbox"
              checked={isSpoilerInput}
              onChange={(e) => setIsSpoilerInput(e.target.checked)}
              className="accent-[#6D293B] rounded"
            />
            <span>This comment contains plot spoilers</span>
          </label>

          <button
            type="submit"
            disabled={submitting || !contentInput.trim()}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs uppercase tracking-wider font-semibold text-[#111013] bg-[#F0E8DC] hover:bg-white disabled:opacity-50 rounded-sm transition-colors cursor-pointer"
          >
            <Send className="w-3 h-3" />
            <span>{submitting ? 'Writing...' : 'Publish Reflection'}</span>
          </button>
        </div>
      </form>

      {/* Comments List */}
      {loading ? (
        <div className="text-center py-12 text-[#A9A0A5] text-sm">
          Summoning voices from the archive...
        </div>
      ) : error ? (
        <div className="text-center py-12 text-rose-400 text-sm">{error}</div>
      ) : rootComments.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-[#393039] p-8 rounded-sm">
          <p className="font-serif-display text-lg text-[#F0E8DC] mb-1">The chamber is currently silent.</p>
          <p className="text-xs text-[#A9A0A5]">
            Be the first reader to leave an echo in this chapter.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {rootComments.map((comment) => {
            const replies = repliesMap.get(comment.id) || [];
            const isRevealed = revealedSpoilers.has(comment.id);

            return (
              <div key={comment.id} className="bg-[#151117] border border-[#393039] p-5 rounded-sm">
                {/* Comment Header */}
                <div className="flex items-center justify-between gap-2 mb-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[#F0E8DC]">{comment.authorName}</span>
                    {comment.isAuthor && (
                      <span className="px-1.5 py-0.5 text-[10px] uppercase tracking-wider font-semibold bg-[#6D293B]/40 text-[#F0E8DC] border border-[#6D293B] rounded-xs">
                        Author
                      </span>
                    )}
                    <span className="text-[#393039]">·</span>
                    <span className="text-[#A9A0A5]">
                      {new Date(comment.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  {comment.isSpoiler && (
                    <span className="text-[11px] text-amber-300/80 uppercase tracking-wider">
                      Spoiler
                    </span>
                  )}
                </div>

                {/* Comment Body with Spoiler Conceal */}
                {comment.isSpoiler && !isRevealed ? (
                  <div className="my-3 p-3 bg-[#1c151e] border border-[#393039] rounded-sm text-xs flex items-center justify-between">
                    <span className="text-[#A9A0A5] italic">
                      This reflection contains spoiler information.
                    </span>
                    <button
                      onClick={() => toggleSpoiler(comment.id)}
                      className="inline-flex items-center gap-1 text-[#F0E8DC] hover:text-[#6D293B] font-medium"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Reveal</span>
                    </button>
                  </div>
                ) : (
                  <div className="text-sm text-[#F0E8DC]/90 leading-relaxed font-sans mb-4 whitespace-pre-wrap">
                    {comment.content}
                    {comment.isSpoiler && (
                      <button
                        onClick={() => toggleSpoiler(comment.id)}
                        className="inline-flex items-center gap-1 text-[11px] text-[#A9A0A5] hover:text-[#F0E8DC] ml-2"
                        title="Hide spoiler again"
                      >
                        <EyeOff className="w-3 h-3" />
                        <span>(Hide)</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Comment Actions: Like, Reply, Report */}
                <div className="flex items-center justify-between text-xs text-[#A9A0A5] pt-2 border-t border-[#393039]/40">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleLike(comment.id)}
                      className={`inline-flex items-center gap-1 transition-colors ${
                        likedComments.has(comment.id)
                          ? 'text-[#6D293B] font-medium'
                          : 'hover:text-[#F0E8DC]'
                      }`}
                      title="Resonate with this reflection"
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${
                          likedComments.has(comment.id) ? 'fill-[#6D293B]' : ''
                        }`}
                      />
                      <span className="tabular-nums">{comment.likesCount}</span>
                    </button>

                    <button
                      onClick={() =>
                        setReplyingToId(replyingToId === comment.id ? null : comment.id)
                      }
                      className="inline-flex items-center gap-1 hover:text-[#F0E8DC] transition-colors"
                    >
                      <CornerDownRight className="w-3.5 h-3.5" />
                      <span>Reply</span>
                    </button>
                  </div>

                  <button
                    onClick={() => setReportingCommentId(comment.id)}
                    className="hover:text-rose-400 transition-colors"
                    title="Report inappropriate content or unflagged spoilers"
                  >
                    <Flag className="w-3 h-3" />
                  </button>
                </div>

                {/* Inline Reply Form */}
                {replyingToId === comment.id && (
                  <div className="mt-4 pt-3 border-t border-[#393039]/60 pl-4 bg-[#111013]/60 p-3 rounded-sm">
                    <div className="flex items-center justify-between text-xs text-[#A9A0A5] mb-2">
                      <span>Replying to {comment.authorName}</span>
                      <button
                        onClick={() => setReplyingToId(null)}
                        className="hover:text-[#F0E8DC]"
                      >
                        Cancel
                      </button>
                    </div>

                    {!isAuthorLoggedIn && (
                      <input
                        type="text"
                        placeholder="Your pen name"
                        value={replyAuthorInput}
                        onChange={(e) => setReplyAuthorInput(e.target.value)}
                        className="w-full bg-[#18131a] border border-[#393039] px-2.5 py-1.5 text-xs text-[#F0E8DC] mb-2 rounded-sm"
                      />
                    )}

                    <textarea
                      placeholder="Write your response..."
                      rows={2}
                      value={replyContentInput}
                      onChange={(e) => setReplyContentInput(e.target.value)}
                      className="w-full bg-[#18131a] border border-[#393039] p-2 text-xs text-[#F0E8DC] rounded-sm focus:outline-none focus:border-[#6D293B] mb-2"
                    />

                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-1.5 text-[11px] text-[#A9A0A5]">
                        <input
                          type="checkbox"
                          checked={replyIsSpoiler}
                          onChange={(e) => setReplyIsSpoiler(e.target.checked)}
                          className="accent-[#6D293B]"
                        />
                        <span>Contains spoiler</span>
                      </label>
                      <button
                        onClick={() => handlePostReply(comment.id)}
                        disabled={submitting || !replyContentInput.trim()}
                        className="px-3 py-1 text-xs uppercase tracking-wider font-semibold text-[#111013] bg-[#F0E8DC] rounded-sm hover:bg-white disabled:opacity-50"
                      >
                        Send Reply
                      </button>
                    </div>
                  </div>
                )}

                {/* Threaded Replies */}
                {replies.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-[#393039]/40 space-y-3 pl-4 md:pl-6 border-l-2 border-[#393039]/70 ml-2">
                    {replies.map((reply) => {
                      const isReplyRevealed = revealedSpoilers.has(reply.id);
                      return (
                        <div key={reply.id} className="bg-[#1a141c]/70 p-3 rounded-sm border border-[#393039]/60">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium text-[#F0E8DC]">{reply.authorName}</span>
                              {reply.isAuthor && (
                                <span className="px-1.5 py-0.2 text-[9px] uppercase tracking-wider font-semibold bg-[#6D293B]/40 text-[#F0E8DC] border border-[#6D293B] rounded-xs">
                                  Author
                                </span>
                              )}
                              <span className="text-[#393039]">·</span>
                              <span className="text-[#A9A0A5] text-[11px]">
                                {new Date(reply.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <button
                              onClick={() => setReportingCommentId(reply.id)}
                              className="text-[#A9A0A5] hover:text-rose-400"
                              title="Report reply"
                            >
                              <Flag className="w-2.5 h-2.5" />
                            </button>
                          </div>

                          {reply.isSpoiler && !isReplyRevealed ? (
                            <div className="p-2 bg-[#211722] text-xs flex items-center justify-between rounded-sm">
                              <span className="text-[#A9A0A5] italic">Spoiler concealed</span>
                              <button
                                onClick={() => toggleSpoiler(reply.id)}
                                className="text-xs text-[#F0E8DC] underline"
                              >
                                Reveal
                              </button>
                            </div>
                          ) : (
                            <p className="text-xs text-[#F0E8DC]/90 leading-relaxed font-sans whitespace-pre-wrap">
                              {reply.content}
                            </p>
                          )}

                          <div className="flex items-center justify-end gap-3 mt-2 text-[11px] text-[#A9A0A5]">
                            <button
                              onClick={() => handleLike(reply.id)}
                              className={`inline-flex items-center gap-1 ${
                                likedComments.has(reply.id) ? 'text-[#6D293B]' : 'hover:text-[#F0E8DC]'
                              }`}
                            >
                              <Heart className="w-3 h-3" />
                              <span className="tabular-nums">{reply.likesCount}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Report Modal */}
      {reportingCommentId && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#18131a] border border-[#393039] p-6 max-w-md w-full rounded-sm text-[#F0E8DC]">
            <div className="flex items-center gap-2 mb-3 text-rose-400">
              <ShieldAlert className="w-5 h-5" />
              <h4 className="font-serif-display text-xl font-medium">Report Reflection</h4>
            </div>

            {reportSuccess ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="text-sm">Thank you. The report has been logged for author moderation.</p>
              </div>
            ) : (
              <form onSubmit={handleReport} className="space-y-4 text-xs">
                <p className="text-[#A9A0A5]">
                  Help maintain the sanctuary. Please select the issue with this contribution:
                </p>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full bg-[#111013] border border-[#393039] p-2.5 text-xs text-[#F0E8DC] rounded-sm focus:outline-none focus:border-[#6D293B]"
                >
                  <option value="Contains unmarked plot spoilers">Contains unmarked plot spoilers</option>
                  <option value="Harassment or aggressive language">Harassment or aggressive language</option>
                  <option value="Commercial spam or promotion">Commercial spam or promotion</option>
                  <option value="Irrelevant or disruptive content">Irrelevant or disruptive content</option>
                </select>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReportingCommentId(null)}
                    className="px-3 py-1.5 text-xs text-[#A9A0A5] hover:text-[#F0E8DC]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs uppercase tracking-wider font-semibold text-white bg-[#6D293B] hover:bg-[#853248] rounded-sm"
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
