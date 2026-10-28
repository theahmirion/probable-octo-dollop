import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useContent } from '../context/ContentContext.js';
import { ArrowLeft, Feather } from 'lucide-react';

export const PoemDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { poetry, readingTheme, fontSize, isLoading } = useContent();

  const poem = poetry.find((p) => p.slug === slug);

  if (isLoading) {
    return <div className="py-24 text-center text-[#A9A0A5]">Fetching poem...</div>;
  }

  if (!poem) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center space-y-4">
        <h2 className="font-serif-display text-3xl text-[#F0E8DC]">Poem Not Found</h2>
        <Link to="/poetry" className="text-xs uppercase tracking-wider text-[#F0E8DC] underline">
          Return to Poetry Collection
        </Link>
      </div>
    );
  }

  const themeClass =
    readingTheme === 'plum'
      ? 'theme-plum'
      : readingTheme === 'warm-parchment'
      ? 'theme-warm-parchment'
      : 'theme-obsidian';

  return (
    <div className={`min-h-screen transition-colors duration-200 ${themeClass}`}>
      <article className="max-w-2xl mx-auto px-6 py-12 md:py-24">
        <nav className="mb-10">
          <Link
            to="/poetry"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#A9A0A5] hover:text-[#F0E8DC] transition-colors reading-muted"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Poetry Collection</span>
          </Link>
        </nav>

        <header className="space-y-3 mb-14 text-center">
          <span className="text-[#6D293B] text-xl font-serif block">☾</span>
          <h1 className="font-serif-display text-4xl sm:text-5xl font-medium text-[#F0E8DC] reading-content">
            {poem.title}
          </h1>
          {poem.notes && (
            <p className="text-xs italic text-[#A9A0A5] reading-muted max-w-md mx-auto">
              {poem.notes}
            </p>
          )}
          <div className="text-[11px] uppercase tracking-widest text-[#A9A0A5] reading-muted pt-1">
            <span>Published {poem.publishedAt}</span>
          </div>
        </header>

        {/* Stanzas in deliberate centered or left-aligned column */}
        <div className="space-y-10 my-12 max-w-md mx-auto">
          {poem.stanzas.map((stanza, idx) => (
            <div
              key={idx}
              className="font-serif-display text-xl sm:text-2xl text-[#F0E8DC] reading-content whitespace-pre-line leading-relaxed italic pl-6 border-l border-[#6D293B]/40"
            >
              {stanza}
            </div>
          ))}
        </div>

        <div className="mt-20 pt-8 border-t border-[#393039]/40 reading-border text-center text-xs text-[#A9A0A5] reading-muted space-y-2">
          <p>Penned by Your Own Gloomy Writer</p>
          <Link to="/poetry" className="text-[#F0E8DC] hover:text-[#6D293B] uppercase tracking-wider block">
            More Poems from the Solitude →
          </Link>
        </div>
      </article>
    </div>
  );
};
