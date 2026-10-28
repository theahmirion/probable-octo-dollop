import React from 'react';
import { Link } from 'react-router-dom';
import { useContent } from '../context/ContentContext.js';
import { Feather, ArrowRight } from 'lucide-react';

export const PoetryPage: React.FC = () => {
  const { poetry, isLoading, error } = useContent();

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 md:py-20 space-y-12">
      <div className="max-w-2xl space-y-4">
        <span className="text-xs uppercase tracking-[0.25em] text-[#6D293B] font-semibold">
          Nocturnes & Metres
        </span>
        <h1 className="font-serif-display text-4xl sm:text-6xl text-[#F0E8DC]">
          Melancholic Poetry
        </h1>
        <p className="text-sm sm:text-base text-[#A9A0A5] leading-relaxed font-light">
          Verses written in the hours between midnight and dawn. Brief meditations on silence, fading lights, and the quiet weight of memory.
        </p>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-[#A9A0A5]">Opening parchment...</div>
      ) : error ? (
        <div className="py-20 text-center text-rose-400">{error}</div>
      ) : poetry.length === 0 ? (
        <div className="py-20 text-center text-[#A9A0A5]">No poems currently published.</div>
      ) : (
        <div className="divide-y divide-[#393039]/60 border-y border-[#393039]/60">
          {poetry.map((poem) => (
            <article key={poem.id} className="py-12 space-y-6 group">
              <div className="flex items-center justify-between text-xs text-[#A9A0A5]">
                <span className="uppercase tracking-widest text-[#6D293B]">Poem</span>
                <span>{poem.publishedAt}</span>
              </div>

              <div>
                <h2 className="font-serif-display text-3xl sm:text-4xl text-[#F0E8DC] group-hover:text-white transition-colors">
                  <Link to={`/poetry/${poem.slug}`}>{poem.title}</Link>
                </h2>
                {poem.notes && (
                  <p className="text-xs italic text-[#A9A0A5] mt-1.5">{poem.notes}</p>
                )}
              </div>

              {/* Stanza preview */}
              <div className="font-serif-display text-lg sm:text-xl text-[#F0E8DC]/90 italic whitespace-pre-line leading-relaxed max-w-lg pl-4 border-l border-[#6D293B]/40">
                {poem.stanzas[0]}
              </div>

              <div>
                <Link
                  to={`/poetry/${poem.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#A9A0A5] group-hover:text-[#F0E8DC] transition-colors"
                >
                  <span>Read Complete Poem</span>
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
