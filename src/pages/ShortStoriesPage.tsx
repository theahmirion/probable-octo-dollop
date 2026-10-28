import React from 'react';
import { Link } from 'react-router-dom';
import { useContent } from '../context/ContentContext.js';
import { Clock, ArrowRight, BookOpen } from 'lucide-react';

export const ShortStoriesPage: React.FC = () => {
  const { shortStories, isLoading, error } = useContent();

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 space-y-12">
      <div className="max-w-3xl space-y-4">
        <span className="text-xs uppercase tracking-[0.25em] text-[#6D293B] font-semibold">
          Solitary Encounters
        </span>
        <h1 className="font-serif-display text-4xl sm:text-6xl text-[#F0E8DC]">
          Short Stories
        </h1>
        <p className="text-sm sm:text-base text-[#A9A0A5] leading-relaxed font-light">
          Self-contained dark fiction exploring the borders between psychological dread, forgotten spaces, and uncanny occurrences. Designed to be finished in a single midnight sitting.
        </p>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-[#A9A0A5]">Fetching archives...</div>
      ) : error ? (
        <div className="py-20 text-center text-rose-400">{error}</div>
      ) : shortStories.length === 0 ? (
        <div className="py-20 text-center text-[#A9A0A5]">No short stories published yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {shortStories.map((story) => (
            <article
              key={story.id}
              className="bg-[#161219] border border-[#393039] rounded-sm overflow-hidden flex flex-col justify-between group hover:border-[#6D293B] transition-colors"
            >
              {story.coverImage && (
                <div className="aspect-[16/9] w-full overflow-hidden bg-[#111013]">
                  <img
                    src={story.coverImage}
                    alt={story.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              <div className="p-7 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-[#A9A0A5]">
                    <span>{story.genre}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{story.estimatedReadTime} min read</span>
                    </span>
                  </div>

                  <h2 className="font-serif-display text-2xl sm:text-3xl text-[#F0E8DC] group-hover:text-white transition-colors">
                    <Link to={`/short-stories/${story.slug}`}>{story.title}</Link>
                  </h2>

                  <p className="font-serif-display text-base italic text-[#A9A0A5]">
                    “{story.hook}”
                  </p>

                  <p className="text-xs text-[#A9A0A5] leading-relaxed line-clamp-3">
                    {story.synopsis}
                  </p>
                </div>

                <div className="pt-6 border-t border-[#393039]/50 flex items-center justify-between text-xs">
                  <span className="text-[#A9A0A5]">{story.publishedAt}</span>
                  <Link
                    to={`/short-stories/${story.slug}`}
                    className="inline-flex items-center gap-1.5 uppercase tracking-wider font-medium text-[#F0E8DC] group-hover:text-[#6D293B] transition-colors"
                  >
                    <span>Read Story</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
