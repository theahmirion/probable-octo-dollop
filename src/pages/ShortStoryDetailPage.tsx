import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useContent } from '../context/ContentContext.js';
import { ArrowLeft, Clock, BookOpen, Share2 } from 'lucide-react';

export const ShortStoryDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { shortStories, readingTheme, fontSize, isLoading } = useContent();

  const story = shortStories.find((s) => s.slug === slug);

  if (isLoading) {
    return <div className="py-24 text-center text-[#A9A0A5]">Opening story...</div>;
  }

  if (!story) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center space-y-4">
        <h2 className="font-serif-display text-3xl text-[#F0E8DC]">Story Not Found</h2>
        <Link to="/short-stories" className="text-xs uppercase tracking-wider text-[#F0E8DC] underline">
          Return to Short Stories
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

  const paragraphs = story.content.split('\n\n').filter(Boolean);

  return (
    <div className={`min-h-screen transition-colors duration-200 ${themeClass}`}>
      <article className="max-w-3xl mx-auto px-6 py-12 md:py-20">
        <nav className="mb-8">
          <Link
            to="/short-stories"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#A9A0A5] hover:text-[#F0E8DC] transition-colors reading-muted"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Short Story Archive</span>
          </Link>
        </nav>

        <header className="space-y-4 mb-14 pb-8 border-b border-[#393039]/40 reading-border">
          <div className="flex flex-wrap items-center gap-3 text-xs text-[#A9A0A5] reading-muted">
            <span className="uppercase tracking-widest text-[#6D293B] font-semibold">{story.genre}</span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{story.estimatedReadTime} min read</span>
            </span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{story.wordCount.toLocaleString()} words</span>
            <span aria-hidden="true">·</span>
            <span>Published {story.publishedAt}</span>
          </div>

          <h1 className="font-serif-display text-4xl sm:text-6xl font-medium text-[#F0E8DC] reading-content tracking-tight">
            {story.title}
          </h1>

          <p className="font-serif-display text-xl italic text-[#A9A0A5] reading-muted leading-relaxed">
            “{story.hook}”
          </p>
        </header>

        {story.coverImage && (
          <div className="mb-12 rounded-sm overflow-hidden border border-[#393039]">
            <img
              src={story.coverImage}
              alt={story.title}
              className="w-full max-h-96 object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        )}

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
          <span>Authored by Your Own Gloomy Writer</span>
          <Link to="/short-stories" className="text-[#F0E8DC] hover:text-[#6D293B] uppercase tracking-wider">
            Explore More Short Stories →
          </Link>
        </div>
      </article>
    </div>
  );
};
