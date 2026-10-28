import React from 'react';
import { Link } from 'react-router-dom';
import { useContent } from '../context/ContentContext.js';
import { Feather, ArrowRight, Tag } from 'lucide-react';

export const JournalPage: React.FC = () => {
  const { journal, isLoading, error } = useContent();

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 md:py-20 space-y-12">
      <div className="max-w-3xl space-y-4">
        <span className="text-xs uppercase tracking-[0.25em] text-[#6D293B] font-semibold">
          The Writer's Desk
        </span>
        <h1 className="font-serif-display text-4xl sm:text-6xl text-[#F0E8DC]">
          Author Journal
        </h1>
        <p className="text-sm sm:text-base text-[#A9A0A5] leading-relaxed font-light">
          Observations on the craft of dark fiction, reflections on solitary writing, and notes transcribed from late-night writing journals.
        </p>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-[#A9A0A5]">Opening journal entries...</div>
      ) : error ? (
        <div className="py-20 text-center text-rose-400">{error}</div>
      ) : journal.length === 0 ? (
        <div className="py-20 text-center text-[#A9A0A5]">No journal entries posted yet.</div>
      ) : (
        <div className="space-y-12 divide-y divide-[#393039]/50">
          {journal.map((post) => (
            <article key={post.id} className="pt-10 first:pt-0 space-y-4 group">
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#A9A0A5]">
                <span>{post.publishedAt}</span>
                {post.tags?.length > 0 && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{post.tags.join(' · ')}</span>
                  </>
                )}
              </div>

              <h2 className="font-serif-display text-3xl sm:text-4xl text-[#F0E8DC] group-hover:text-white transition-colors">
                <Link to={`/journal/${post.slug}`}>{post.title}</Link>
              </h2>

              <p className="text-sm text-[#A9A0A5] leading-relaxed line-clamp-3 font-light">
                {post.excerpt}
              </p>

              <div>
                <Link
                  to={`/journal/${post.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#F0E8DC] group-hover:text-[#6D293B] transition-colors"
                >
                  <span>Read Full Reflection</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
