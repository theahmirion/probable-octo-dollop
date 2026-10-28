import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useContent } from '../context/ContentContext.js';
import { BookOpen, ArrowRight, Clock, Bookmark, AlertCircle, ArrowLeft } from 'lucide-react';

export const NovelDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { novels, lastRead, isLoading } = useContent();

  const novel = novels.find((n) => n.slug === slug);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-24 text-center text-[#A9A0A5]">
        Consulting the archive...
      </div>
    );
  }

  if (!novel) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-24 text-center space-y-4">
        <h2 className="font-serif-display text-3xl text-[#F0E8DC]">Manuscript Not Found</h2>
        <p className="text-sm text-[#A9A0A5]">The novel you are seeking has been archived or does not exist.</p>
        <Link to="/novels" className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#F0E8DC] underline">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Novels</span>
        </Link>
      </div>
    );
  }

  const isCurrentNovelBookmarked = lastRead && lastRead.novelSlug === novel.slug;
  const firstChapter = novel.chapters[0];
  const totalWords = novel.chapters.reduce((sum, c) => sum + c.wordCount, 0);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 md:py-20 space-y-16">
      {/* Back link */}
      <div>
        <Link
          to="/novels"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#A9A0A5] hover:text-[#F0E8DC] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>The Novel Archive</span>
        </Link>
      </div>

      {/* Novel Header Hero */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start">
        {/* Cover */}
        <div className="md:col-span-4 flex justify-center">
          <img
            src={novel.coverImage}
            alt={novel.title}
            className="w-full max-w-sm aspect-[3/4] object-cover rounded-sm border border-[#393039] shadow-2xl"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Info */}
        <div className="md:col-span-8 space-y-6">
          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#A9A0A5]">
            <span>{novel.genre}</span>
            <span aria-hidden="true">·</span>
            <span>{novel.chapters.length} Published Chapters</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{totalWords.toLocaleString()} words</span>
            <span aria-hidden="true">·</span>
            <span>Updated {novel.lastUpdated}</span>
          </div>

          <div>
            <h1 className="font-serif-display text-4xl sm:text-5xl text-[#F0E8DC] tracking-tight">
              {novel.title}
            </h1>
            <p className="font-serif-display text-xl sm:text-2xl italic text-[#A9A0A5] mt-2">
              “{novel.hook}”
            </p>
          </div>

          <p className="text-sm sm:text-base text-[#A9A0A5] leading-relaxed font-light">
            {novel.synopsis}
          </p>

          {/* Content Warnings */}
          {novel.contentWarnings?.length > 0 && (
            <div className="p-3.5 bg-[#17121a] border border-[#393039] rounded-sm text-xs text-[#A9A0A5]">
              <span className="font-semibold text-[#F0E8DC] uppercase tracking-wider block mb-1">
                Content Notes & Themes
              </span>
              <p>{novel.contentWarnings.join(' · ')}</p>
            </div>
          )}

          {/* Action Row */}
          <div className="pt-2 flex flex-wrap items-center gap-4">
            {isCurrentNovelBookmarked ? (
              <Link
                to={`/novels/${novel.slug}/chapters/${lastRead.chapterSlug}`}
                className="inline-flex items-center gap-2 px-6 py-3 text-xs uppercase tracking-wider font-semibold text-[#111013] bg-[#F0E8DC] hover:bg-white rounded-sm transition-all"
              >
                <Bookmark className="w-3.5 h-3.5 text-[#6D293B]" />
                <span>Resume Reading ({lastRead.chapterTitle})</span>
              </Link>
            ) : firstChapter ? (
              <Link
                to={`/novels/${novel.slug}/chapters/${firstChapter.slug}`}
                className="inline-flex items-center gap-2 px-6 py-3 text-xs uppercase tracking-wider font-semibold text-[#111013] bg-[#F0E8DC] hover:bg-white rounded-sm transition-all"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Begin Reading (Chapter 1)</span>
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      {/* Table of Contents */}
      <section className="space-y-6 pt-8 border-t border-[#393039]/60">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-[#6D293B] font-semibold">
              Table of Contents
            </span>
            <h2 className="font-serif-display text-2xl sm:text-3xl text-[#F0E8DC] mt-1">
              Published Chapters
            </h2>
          </div>
          <span className="text-xs text-[#A9A0A5] tabular-nums">
            {novel.chapters.length} available
          </span>
        </div>

        {novel.chapters.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-[#393039] text-[#A9A0A5] text-sm rounded-sm">
            Chapters are currently being prepared in the writer's study.
          </div>
        ) : (
          <div className="divide-y divide-[#393039]/50 border-y border-[#393039]/60">
            {novel.chapters.map((chapter) => (
              <Link
                key={chapter.id}
                to={`/novels/${novel.slug}/chapters/${chapter.slug}`}
                className="group py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#18131a] px-4 -mx-4 transition-colors rounded-sm"
              >
                <div className="space-y-1">
                  <div className="text-xs uppercase tracking-widest text-[#6D293B] font-medium">
                    Chapter {chapter.chapterNumber}
                  </div>
                  <h3 className="font-serif-display text-xl sm:text-2xl text-[#F0E8DC] group-hover:text-white transition-colors">
                    {chapter.title}
                  </h3>
                  {chapter.epigraph && (
                    <p className="text-xs italic text-[#A9A0A5] line-clamp-1 max-w-xl">
                      {chapter.epigraph}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-6 text-xs text-[#A9A0A5] shrink-0">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{chapter.estimatedReadTime} min</span>
                  </span>
                  <span className="tabular-nums hidden sm:inline">
                    {chapter.wordCount.toLocaleString()} words
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#A9A0A5] group-hover:text-[#F0E8DC] group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
