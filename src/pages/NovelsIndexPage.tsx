import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useContent } from '../context/ContentContext.js';
import { BookOpen, ArrowRight, Clock, AlertCircle } from 'lucide-react';

export const NovelsIndexPage: React.FC = () => {
  const { novels, isLoading, error } = useContent();
  const [selectedGenre, setSelectedGenre] = useState<string>('all');

  const genres = ['all', ...Array.from(new Set(novels.map((n) => n.genre.split('·')[0].trim())))];

  const filteredNovels =
    selectedGenre === 'all'
      ? novels
      : novels.filter((n) => n.genre.toLowerCase().includes(selectedGenre.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 space-y-12">
      {/* Editorial Header */}
      <div className="max-w-3xl space-y-4">
        <span className="text-xs uppercase tracking-[0.25em] text-[#6D293B] font-semibold">
          The Vault
        </span>
        <h1 className="font-serif-display text-4xl sm:text-6xl text-[#F0E8DC]">
          Serialized Novels
        </h1>
        <p className="text-sm sm:text-base text-[#A9A0A5] leading-relaxed font-light">
          Long-form dark fiction, gothic mysteries, and psychological narratives released chapter by chapter. Each work is accompanied by dedicated chapter discussions and reader notes.
        </p>

        {/* Functional Genre Filter Tabs (Allowed interactive filter controls per design guidelines) */}
        <div className="flex flex-wrap items-center gap-2 pt-4">
          <span className="text-xs uppercase tracking-wider text-[#A9A0A5] mr-2">Filter:</span>
          {genres.map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGenre(g)}
              className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors cursor-pointer ${
                selectedGenre === g
                  ? 'bg-[#F0E8DC] text-[#111013] font-semibold'
                  : 'bg-[#18131a] text-[#A9A0A5] border border-[#393039] hover:text-[#F0E8DC]'
              }`}
            >
              {g === 'all' ? 'All Works' : g}
            </button>
          ))}
        </div>
      </div>

      {/* Novels List */}
      {isLoading ? (
        <div className="py-20 text-center text-[#A9A0A5]">Loading manuscripts from the vault...</div>
      ) : error ? (
        <div className="py-20 text-center text-rose-400">{error}</div>
      ) : filteredNovels.length === 0 ? (
        <div className="py-20 text-center text-[#A9A0A5]">No novels found under this filter.</div>
      ) : (
        <div className="space-y-16">
          {filteredNovels.map((novel) => {
            const firstChapter = novel.chapters[0];
            const totalWords = novel.chapters.reduce((sum, c) => sum + c.wordCount, 0);

            return (
              <article
                key={novel.id}
                className="bg-[#161219] border border-[#393039] p-6 lg:p-10 rounded-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              >
                {/* Book Cover */}
                <div className="lg:col-span-4 flex justify-center">
                  <Link to={`/novels/${novel.slug}`} className="block group max-w-xs w-full">
                    <img
                      src={novel.coverImage}
                      alt={novel.title}
                      className="w-full aspect-[3/4] object-cover rounded-sm border border-[#393039] shadow-xl group-hover:border-[#6D293B] transition-all"
                      referrerPolicy="no-referrer"
                    />
                  </Link>
                </div>

                {/* Details */}
                <div className="lg:col-span-8 space-y-5">
                  {/* Unboxed Metadata */}
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#A9A0A5]">
                    <span>{novel.genre}</span>
                    <span aria-hidden="true">·</span>
                    <span>{novel.chapters.length} Chapters</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">{totalWords.toLocaleString()} words</span>
                    <span aria-hidden="true">·</span>
                    <span>Updated {novel.lastUpdated}</span>
                  </div>

                  <div>
                    <h2 className="font-serif-display text-3xl sm:text-4xl text-[#F0E8DC]">
                      <Link to={`/novels/${novel.slug}`} className="hover:text-white transition-colors">
                        {novel.title}
                      </Link>
                    </h2>
                    <p className="font-serif-display text-lg italic text-[#A9A0A5] mt-1.5">
                      “{novel.hook}”
                    </p>
                  </div>

                  <p className="text-sm text-[#A9A0A5] leading-relaxed line-clamp-3">
                    {novel.synopsis}
                  </p>

                  {/* Themes / Content Warnings */}
                  {novel.contentWarnings?.length > 0 && (
                    <div className="flex items-center gap-2 text-xs text-[#A9A0A5]/80">
                      <AlertCircle className="w-3.5 h-3.5 text-[#6D293B] shrink-0" />
                      <span>{novel.contentWarnings.join(' · ')}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-2 flex flex-wrap items-center gap-4">
                    {firstChapter ? (
                      <Link
                        to={`/novels/${novel.slug}/chapters/${firstChapter.slug}`}
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-xs uppercase tracking-wider font-semibold text-[#111013] bg-[#F0E8DC] hover:bg-white rounded-sm transition-all"
                      >
                        <span>Begin Reading</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    ) : null}

                    <Link
                      to={`/novels/${novel.slug}`}
                      className="inline-flex items-center gap-2 px-4 py-2.5 text-xs uppercase tracking-wider font-medium text-[#F0E8DC] bg-[#211722] border border-[#393039] hover:border-[#6D293B] rounded-sm transition-all"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-[#A9A0A5]" />
                      <span>View Chapters ({novel.chapters.length})</span>
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
