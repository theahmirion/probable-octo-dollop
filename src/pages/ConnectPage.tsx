import React, { useState } from 'react';
import { useContent } from '../context/ContentContext.js';
import { Mail, Send, Sparkles, Instagram, BookMarked, CheckCircle } from 'lucide-react';

export const ConnectPage: React.FC = () => {
  const { authorProfile } = useContent();
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [letterContent, setLetterContent] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleSendLetter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!letterContent.trim()) return;

    // Simulate sending letter to author's mailbox
    setSentSuccess(true);
    setSenderName('');
    setSenderEmail('');
    setLetterContent('');
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 md:py-20 space-y-16">
      <div className="max-w-2xl space-y-4">
        <span className="text-xs uppercase tracking-[0.25em] text-[#6D293B] font-semibold">
          Correspondence
        </span>
        <h1 className="font-serif-display text-4xl sm:text-6xl text-[#F0E8DC]">
          Connect & Dispatches
        </h1>
        <p className="text-sm sm:text-base text-[#A9A0A5] leading-relaxed font-light">
          Whether you have a quiet inquiry, a resonance with a chapter, or wish to follow the writing across literary outposts.
        </p>
      </div>

      {/* External Platforms Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Substack */}
        {authorProfile?.socials?.substack && (
          <a
            href={authorProfile.socials.substack}
            target="_blank"
            rel="noreferrer"
            className="bg-[#161219] border border-[#393039] hover:border-[#6D293B] p-6 rounded-sm space-y-3 transition-colors group block"
          >
            <div className="flex items-center justify-between">
              <Sparkles className="w-5 h-5 text-[#6D293B]" />
              <span className="text-[11px] uppercase tracking-wider text-[#A9A0A5]">Newsletter</span>
            </div>
            <h3 className="font-serif-display text-xl text-[#F0E8DC] group-hover:text-white">Substack</h3>
            <p className="text-xs text-[#A9A0A5] leading-relaxed">
              Long-form dispatches, release announcements, and author reflections delivered directly to your inbox.
            </p>
            <span className="text-xs text-[#F0E8DC] inline-block pt-1 group-hover:underline">Visit Dispatch ↗</span>
          </a>
        )}

        {/* Instagram */}
        {authorProfile?.socials?.instagram && (
          <a
            href={authorProfile.socials.instagram}
            target="_blank"
            rel="noreferrer"
            className="bg-[#161219] border border-[#393039] hover:border-[#6D293B] p-6 rounded-sm space-y-3 transition-colors group block"
          >
            <div className="flex items-center justify-between">
              <Instagram className="w-5 h-5 text-[#6D293B]" />
              <span className="text-[11px] uppercase tracking-wider text-[#A9A0A5]">Visuals</span>
            </div>
            <h3 className="font-serif-display text-xl text-[#F0E8DC] group-hover:text-white">Instagram</h3>
            <p className="text-xs text-[#A9A0A5] leading-relaxed">
              Excerpts, candlelit writing desk glimpses, aesthetic moods, and quotes from upcoming novels.
            </p>
            <span className="text-xs text-[#F0E8DC] inline-block pt-1 group-hover:underline">Follow Author ↗</span>
          </a>
        )}

        {/* Goodreads */}
        {authorProfile?.socials?.goodreads && (
          <a
            href={authorProfile.socials.goodreads}
            target="_blank"
            rel="noreferrer"
            className="bg-[#161219] border border-[#393039] hover:border-[#6D293B] p-6 rounded-sm space-y-3 transition-colors group block"
          >
            <div className="flex items-center justify-between">
              <BookMarked className="w-5 h-5 text-[#6D293B]" />
              <span className="text-[11px] uppercase tracking-wider text-[#A9A0A5]">Catalog</span>
            </div>
            <h3 className="font-serif-display text-xl text-[#F0E8DC] group-hover:text-white">Goodreads</h3>
            <p className="text-xs text-[#A9A0A5] leading-relaxed">
              Add serialized works to your reading shelves and track published releases.
            </p>
            <span className="text-xs text-[#F0E8DC] inline-block pt-1 group-hover:underline">View Profile ↗</span>
          </a>
        )}
      </div>

      {/* Direct Letter Form */}
      <section className="bg-[#161219] border border-[#393039] p-8 md:p-10 rounded-sm space-y-6">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] text-[#6D293B] font-semibold">
            Direct Post
          </span>
          <h2 className="font-serif-display text-2xl sm:text-3xl text-[#F0E8DC] mt-1">
            Send a Letter to the Writer's Desk
          </h2>
          <p className="text-xs text-[#A9A0A5] mt-1">
            All correspondence is delivered directly to Your Own Gloomy Writer.
          </p>
        </div>

        {sentSuccess ? (
          <div className="p-8 text-center bg-[#111013] border border-[#393039] rounded-sm space-y-2">
            <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
            <h3 className="font-serif-display text-xl text-[#F0E8DC]">Your Letter Has Been Sealed</h3>
            <p className="text-xs text-[#A9A0A5]">
              Thank you for writing. It has reached the study safely.
            </p>
            <button
              onClick={() => setSentSuccess(false)}
              className="text-xs text-[#F0E8DC] underline mt-3 inline-block"
            >
              Send another letter
            </button>
          </div>
        ) : (
          <form onSubmit={handleSendLetter} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="connect-name" className="block uppercase tracking-wider text-[#A9A0A5] mb-1">
                  Your Name or Pen Name
                </label>
                <input
                  id="connect-name"
                  type="text"
                  required
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="e.g. A Reader from the Coast"
                  className="w-full bg-[#111013] border border-[#393039] p-2.5 text-sm text-[#F0E8DC] rounded-sm focus:outline-none focus:border-[#6D293B]"
                />
              </div>

              <div>
                <label htmlFor="connect-email" className="block uppercase tracking-wider text-[#A9A0A5] mb-1">
                  Return Email Address
                </label>
                <input
                  id="connect-email"
                  type="email"
                  required
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  placeholder="reader@example.com"
                  className="w-full bg-[#111013] border border-[#393039] p-2.5 text-sm text-[#F0E8DC] rounded-sm focus:outline-none focus:border-[#6D293B]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="connect-message" className="block uppercase tracking-wider text-[#A9A0A5] mb-1">
                Your Letter
              </label>
              <textarea
                id="connect-message"
                required
                rows={5}
                value={letterContent}
                onChange={(e) => setLetterContent(e.target.value)}
                placeholder="Write your thoughts, questions, or reflections on the stories..."
                className="w-full bg-[#111013] border border-[#393039] p-3 text-sm text-[#F0E8DC] rounded-sm focus:outline-none focus:border-[#6D293B] font-sans"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-3 text-xs uppercase tracking-wider font-semibold text-[#111013] bg-[#F0E8DC] hover:bg-white rounded-sm transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Letter</span>
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
};
