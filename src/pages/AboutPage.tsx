import React from 'react';
import { Link } from 'react-router-dom';
import { useContent } from '../context/ContentContext.js';
import { Feather, BookOpen, Compass, ArrowRight } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { authorProfile, novels, shortStories } = useContent();

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 md:py-20 space-y-16">
      {/* Intro Hero with Silhouette Portrait */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
        <div className="md:col-span-4 flex justify-center">
          <div className="relative">
            <img
              src="/src/assets/images/gloomy_author_silhouette_1792629595646.jpg"
              alt="Your Own Gloomy Writer in dark candlelit study"
              className="w-52 h-52 md:w-64 md:h-64 object-cover rounded-full border-2 border-[#393039] shadow-2xl"
              referrerPolicy="no-referrer"
            />
            <span className="absolute bottom-2 right-4 text-xl text-[#6D293B] bg-[#111013] px-2.5 py-0.5 rounded-full border border-[#393039]">
              ☾
            </span>
          </div>
        </div>

        <div className="md:col-span-8 space-y-4">
          <span className="text-xs uppercase tracking-[0.25em] text-[#6D293B] font-semibold">
            About the Writer
          </span>
          <h1 className="font-serif-display text-4xl sm:text-5xl text-[#F0E8DC]">
            {authorProfile?.penName || 'Your Own Gloomy Writer'}
          </h1>
          <p className="font-serif-display text-lg italic text-[#A9A0A5] leading-relaxed">
            “{authorProfile?.tagline}”
          </p>
          <p className="text-sm text-[#A9A0A5] leading-relaxed font-light">
            {authorProfile?.biography}
          </p>
        </div>
      </div>

      {/* Writing Philosophy */}
      <section className="bg-[#161219] border border-[#393039] p-8 md:p-10 rounded-sm space-y-4">
        <span className="text-xs uppercase tracking-[0.2em] text-[#6D293B] font-semibold">
          Artistic Philosophy
        </span>
        <h2 className="font-serif-display text-2xl sm:text-3xl text-[#F0E8DC]">
          The Truth in Quiet Shadows
        </h2>
        <div className="font-serif-display text-lg sm:text-xl text-[#F0E8DC]/90 italic leading-relaxed border-l-2 border-[#6D293B] pl-4">
          “{authorProfile?.philosophy}”
        </div>
      </section>

      {/* The Journey */}
      <section className="space-y-4">
        <span className="text-xs uppercase tracking-[0.2em] text-[#6D293B] font-semibold">
          The Origin of Moonfall
        </span>
        <h2 className="font-serif-display text-2xl sm:text-3xl text-[#F0E8DC]">
          A Digital Sanctuary for Unhurried Reading
        </h2>
        <p className="text-sm sm:text-base text-[#A9A0A5] leading-relaxed font-light">
          {authorProfile?.journey}
        </p>
      </section>

      {/* Selected Works Showcase */}
      <section className="pt-8 border-t border-[#393039]/50 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-serif-display text-2xl text-[#F0E8DC]">Selected Works</h2>
          <Link to="/novels" className="text-xs uppercase tracking-wider text-[#A9A0A5] hover:text-[#F0E8DC]">
            Full Library →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {novels.slice(0, 2).map((novel) => (
            <Link
              key={novel.id}
              to={`/novels/${novel.slug}`}
              className="p-5 bg-[#161219] border border-[#393039] hover:border-[#6D293B] rounded-sm transition-colors group space-y-2"
            >
              <div className="text-xs uppercase tracking-wider text-[#6D293B]">Novel</div>
              <h3 className="font-serif-display text-xl text-[#F0E8DC] group-hover:text-white">
                {novel.title}
              </h3>
              <p className="text-xs text-[#A9A0A5] line-clamp-2">{novel.hook}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Dialogue invitation */}
      <section className="text-center py-8 space-y-4 border-t border-[#393039]/40">
        <h3 className="font-serif-display text-2xl text-[#F0E8DC]">Join the Nocturnal Dialogue</h3>
        <p className="text-xs text-[#A9A0A5] max-w-md mx-auto">
          Every chapter hosts a dedicated discussion area. Readers are warmly invited to leave their reflections, theories, and interpretations.
        </p>
        <div>
          <Link
            to="/connect"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs uppercase tracking-wider font-semibold text-[#111013] bg-[#F0E8DC] hover:bg-white rounded-sm transition-all"
          >
            <span>Connect with the Writer</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
};
