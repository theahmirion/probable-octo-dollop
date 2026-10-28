import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useContent } from '../context/ContentContext.js';
import { ArrowLeft, Clock } from 'lucide-react';

export const JournalDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { journal, readingTheme, fontSize, isLoading } = useContent();

  const post = journal.find((j) => j.slug === slug);

  if (isLoading) {
    return <div className="py-24 text-center text-[#A9A0A5]">Opening entry...</div>;
  }

  if (!post) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center space-y-4">
        <h2 className="font-serif-display text-3xl text-[#F0E8DC]">Entry Not Found</h2>
        <Link to="/journal" className="text-xs uppercase tracking-wider text-[#F0E8DC] underline">
          Return to Journal
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

  const fontSizeClass =
    fontSize === 'sm'
      ? 'text-base leading-relaxed'
      : fontSize === 'lg'
      ? 'text-xl leading-loose'
      : fontSize === 'xl'
      ? 'text-2xl leading-loose'
      : 'text-lg leading-relaxed';

  const paragraphs = post.content.split('\n\n').filter(Boolean);

  return (
    <div className={`min-h-screen transition-colors duration-200 ${themeClass}`}>
      <article className="max-w-3xl mx-auto px-6 py-12 md:py-20">
        <nav className="mb-8">
          <Link
            to="/journal"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#A9A0A5] hover:text-[#F0E8DC] transition-colors reading-muted"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Journal Archive</span>
          </Link>
        </nav>

        <header className="space-y-4 mb-12 pb-8 border-b border-[#393039]/40 reading-border">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#A9A0A5] reading-muted">
            <span className="uppercase tracking-widest text-[#6D293B] font-semibold">Author Journal</span>
            <span aria-hidden="true">·</span>
            <span>{post.publishedAt}</span>
            {post.tags?.length > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span>{post.tags.join(' · ')}</span>
              </>
            )}
          </div>

          <h1 className="font-serif-display text-4xl sm:text-5xl font-medium text-[#F0E8DC] reading-content tracking-tight">
            {post.title}
          </h1>

          <p className="font-serif-display text-lg italic text-[#A9A0A5] reading-muted leading-relaxed">
            {post.excerpt}
          </p>
        </header>

        <div className={`font-prose-reading reading-content space-y-6 ${fontSizeClass}`}>
          {paragraphs.map((p, idx) => (
            <p
              key={idx}
              className={`${
                idx === 0
                  ? 'first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-[#6D293B]'
                  : ''
              }`}
            >
              {p}
            </p>
          ))}
        </div>

        <div className="my-16 pt-8 border-t border-[#393039]/50 reading-border flex items-center justify-between text-xs text-[#A9A0A5] reading-muted">
          <span>By Your Own Gloomy Writer</span>
          <Link to="/journal" className="text-[#F0E8DC] hover:text-[#6D293B] uppercase tracking-wider">
            All Dispatches →
          </Link>
        </div>
      </article>
    </div>
  );
};
