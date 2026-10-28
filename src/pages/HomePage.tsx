import React from 'react';
import { Link } from 'react-router-dom';
import { useContent } from '../context/ContentContext.js';
import { ArrowRight, BookOpen, Clock, Feather, Bookmark, Sparkles } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { novels, shortStories, poetry, journal, authorProfile, lastRead } = useContent();

  const flagshipNovel = novels.find((n) => n.featured) || novels[0];
  const secondNovel = novels.find((n) => !n.featured) || novels[1];

  return (
    <div className="space-y-24 md:space-y-36 pb-24">
      {/* Resume reading pill banner if reader has last read item */}
      {lastRead && (
        <div className="bg-[#1c1520] border-b border-[#6D293B]/60 py-2.5 px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2 text-[#A9A0A5]">
              <Bookmark className="w-3.5 h-3.5 text-[#6D293B]" />
              <span>Resume reading where you paused:</span>
              <strong className="text-[#F0E8DC] font-medium">{lastRead.novelTitle}</strong>
              <span className="text-[#393039]">·</span>
              <span className="italic">{lastRead.chapterTitle}</span>
            </div>
            <Link
              to={`/novels/${lastRead.novelSlug}/chapters/${lastRead.chapterSlug}`}
              className="text-[#F0E8DC] hover:text-white underline font-medium tracking-wide flex items-center gap-1"
            >
              <span>Continue</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}

      {/* ============================================================
          SECTION 1 — THE THRESHOLD (CINEMATIC EDITORIAL HERO)
          ============================================================ */}
      <section className="relative min-h-[85vh] flex items-center justify-center px-6 overflow-hidden">
        {/* Background Atmosphere Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/src/assets/images/moonfall_hero_nocturne_1792629519153.jpg"
            alt="Solitary Victorian gothic library window at midnight overlooking rain"
            className="w-full h-full object-cover object-center filter brightness-[0.45] contrast-[1.1]"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111013] via-[#111013]/60 to-[#111013]/40" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#111013_90%)]" />
        </div>

        {/* Hero Editorial Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6 pt-12">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[#A9A0A5]">
            <span className="text-[#6D293B]">☾</span>
            <span>An Independent Dark Fiction Sanctuary</span>
            <span className="text-[#6D293B]">☽</span>
          </div>

          {/* Headline */}
          <h1 className="font-serif-display text-4xl sm:text-6xl md:text-7xl font-normal text-[#F0E8DC] tracking-tight leading-[1.1] text-balance">
            Some stories don’t let you leave.
          </h1>

          {/* Supporting Copy */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-[#A9A0A5] font-light leading-relaxed">
            Dark fiction, unfinished thoughts, and the quiet things that follow you long after the final page. Authored by Your Own Gloomy Writer.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/novels"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-xs uppercase tracking-[0.2em] font-semibold text-[#111013] bg-[#F0E8DC] hover:bg-white rounded-sm transition-all shadow-lg hover:shadow-black/50"
            >
              <BookOpen className="w-4 h-4" />
              <span>Enter the Stories</span>
            </Link>

            <Link
              to="/about"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-xs uppercase tracking-[0.2em] font-medium text-[#F0E8DC] bg-[#211722]/80 hover:bg-[#211722] border border-[#393039] hover:border-[#6D293B] rounded-sm transition-all"
            >
              <span>Meet the Writer</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#A9A0A5]" />
            </Link>
          </div>

          {/* Subtle Exploration Indicator */}
          <div className="pt-12 flex justify-center text-xs tracking-widest uppercase text-[#A9A0A5]/60">
            <span>Scroll into the archive ↓</span>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 2 — ENTER A STORY (FLAGSHIP NOVEL FEATURE)
          ============================================================ */}
      {flagshipNovel && (
        <section className="max-w-7xl mx-auto px-6">
          <div className="mb-4">
            <span className="text-xs uppercase tracking-[0.25em] text-[#6D293B] font-semibold">
              Current Flagship Project
            </span>
          </div>

          <div className="bg-[#161219] border border-[#393039] p-6 lg:p-12 rounded-sm grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Book Cover Image */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative group max-w-sm w-full">
                <div className="absolute -inset-2 bg-[#6D293B]/20 rounded-sm blur-md opacity-40 group-hover:opacity-70 transition-opacity" />
                <img
                  src={flagshipNovel.coverImage}
                  alt={flagshipNovel.title}
                  className="relative w-full aspect-[3/4] object-cover rounded-sm shadow-2xl border border-[#393039]"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            {/* Novel Info & Teaser */}
            <div className="lg:col-span-7 space-y-6">
              {/* Unboxed Metadata */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#A9A0A5]">
                <span>{flagshipNovel.genre}</span>
                <span aria-hidden="true">·</span>
                <span>{flagshipNovel.chapters.length} Published Chapters</span>
                <span aria-hidden="true">·</span>
                <span>Updated {flagshipNovel.lastUpdated}</span>
              </div>

              {/* Title & Hook */}
              <div>
                <h2 className="font-serif-display text-3xl sm:text-5xl font-medium text-[#F0E8DC] tracking-tight">
                  {flagshipNovel.title}
                </h2>
                <p className="font-serif-display text-xl sm:text-2xl italic text-[#A9A0A5] mt-2">
                  “{flagshipNovel.hook}”
                </p>
              </div>

              {/* Synopsis */}
              <p className="text-sm sm:text-base text-[#A9A0A5] leading-relaxed font-light">
                {flagshipNovel.synopsis}
              </p>

              {/* Content Warnings (Unboxed text) */}
              {flagshipNovel.contentWarnings?.length > 0 && (
                <div className="text-xs text-[#A9A0A5]/80 pt-1">
                  <span className="uppercase tracking-wider text-[#A9A0A5]">Themes: </span>
                  {flagshipNovel.contentWarnings.join(' · ')}
                </div>
              )}

              {/* Reading Actions */}
              <div className="pt-4 flex flex-wrap items-center gap-4">
                {flagshipNovel.chapters.length > 0 ? (
                  <Link
                    to={`/novels/${flagshipNovel.slug}/chapters/${flagshipNovel.chapters[0].slug}`}
                    className="inline-flex items-center gap-2 px-6 py-3 text-xs uppercase tracking-wider font-semibold text-[#111013] bg-[#F0E8DC] hover:bg-white rounded-sm transition-all"
                  >
                    <span>Begin Chapter 1</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ) : null}

                <Link
                  to={`/novels/${flagshipNovel.slug}`}
                  className="inline-flex items-center gap-2 px-5 py-3 text-xs uppercase tracking-wider font-medium text-[#F0E8DC] bg-[#211722] border border-[#393039] hover:border-[#6D293B] rounded-sm transition-all"
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#A9A0A5]" />
                  <span>Table of Contents</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ============================================================
          SECTION 3 — THE LIBRARY (DISTINCT DESTINATIONS)
          ============================================================ */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 pb-4 border-b border-[#393039]/60">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-[#6D293B] font-semibold">
              The Archive
            </span>
            <h2 className="font-serif-display text-3xl sm:text-4xl text-[#F0E8DC] mt-1">
              Curated Collections
            </h2>
          </div>
          <p className="text-xs text-[#A9A0A5] max-w-sm">
            Novels, solitary short stories, and melancholic verses arranged by form.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Serialized Novels */}
          <div className="bg-[#161219] border border-[#393039] p-7 rounded-sm flex flex-col justify-between group hover:border-[#6D293B] transition-colors">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-[#A9A0A5]">
                <span className="uppercase tracking-widest text-[#6D293B]">Form I</span>
                <span className="tabular-nums">{novels.length} Works</span>
              </div>
              <h3 className="font-serif-display text-2xl text-[#F0E8DC] group-hover:text-white transition-colors">
                Serialized Novels
              </h3>
              <p className="text-xs text-[#A9A0A5] leading-relaxed">
                Multi-chapter Gothic narratives tracing the quiet descent of forgotten keepers, coastal ruins, and psychological mysteries.
              </p>
            </div>
            <div className="pt-6">
              <Link
                to="/novels"
                className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#F0E8DC] hover:text-[#6D293B] transition-colors"
              >
                <span>Explore Novels</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 2: Short Stories */}
          <div className="bg-[#161219] border border-[#393039] p-7 rounded-sm flex flex-col justify-between group hover:border-[#6D293B] transition-colors">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-[#A9A0A5]">
                <span className="uppercase tracking-widest text-[#6D293B]">Form II</span>
                <span className="tabular-nums">{shortStories.length} Stories</span>
              </div>
              <h3 className="font-serif-display text-2xl text-[#F0E8DC] group-hover:text-white transition-colors">
                Solitary Stories
              </h3>
              <p className="text-xs text-[#A9A0A5] leading-relaxed">
                Standalone encounters with the uncanny: abandoned railway stations, mirrors that hesitate, and letters that refuse to stop arriving.
              </p>
            </div>
            <div className="pt-6">
              <Link
                to="/short-stories"
                className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#F0E8DC] hover:text-[#6D293B] transition-colors"
              >
                <span>Read Short Stories</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 3: Poetry */}
          <div className="bg-[#161219] border border-[#393039] p-7 rounded-sm flex flex-col justify-between group hover:border-[#6D293B] transition-colors">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-[#A9A0A5]">
                <span className="uppercase tracking-widest text-[#6D293B]">Form III</span>
                <span className="tabular-nums">{poetry.length} Poems</span>
              </div>
              <h3 className="font-serif-display text-2xl text-[#F0E8DC] group-hover:text-white transition-colors">
                Melancholic Poetry
              </h3>
              <p className="text-xs text-[#A9A0A5] leading-relaxed">
                Verses penned in the silence of 2:00 AM. Reflections on the weight of empty rooms, winter frosts, and unreturned affections.
              </p>
            </div>
            <div className="pt-6">
              <Link
                to="/poetry"
                className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#F0E8DC] hover:text-[#6D293B] transition-colors"
              >
                <span>Read Poetry</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Secondary Novel Spotlight if available */}
        {secondNovel && (
          <div className="mt-8 bg-[#141016] border border-[#393039] p-6 rounded-sm flex flex-col md:flex-row items-center gap-6">
            <img
              src={secondNovel.coverImage}
              alt={secondNovel.title}
              className="w-20 md:w-28 aspect-[3/4] object-cover rounded-sm border border-[#393039]"
              referrerPolicy="no-referrer"
            />
            <div className="flex-1 space-y-2 text-center md:text-left">
              <div className="text-xs text-[#A9A0A5]">
                <span>Companion Novel</span>
                <span className="mx-2">·</span>
                <span>{secondNovel.genre}</span>
              </div>
              <h4 className="font-serif-display text-xl text-[#F0E8DC]">{secondNovel.title}</h4>
              <p className="text-xs text-[#A9A0A5] line-clamp-2">{secondNovel.hook}</p>
            </div>
            <Link
              to={`/novels/${secondNovel.slug}`}
              className="px-4 py-2 text-xs uppercase tracking-wider text-[#F0E8DC] bg-[#211722] hover:bg-[#6D293B]/40 border border-[#393039] rounded-sm whitespace-nowrap"
            >
              Explore Novel
            </Link>
          </div>
        )}
      </section>

      {/* ============================================================
          SECTION 4 — RECENTLY WRITTEN
          ============================================================ */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between gap-4 mb-8 pb-4 border-b border-[#393039]/60">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-[#6D293B] font-semibold">
              Recent Chronicles
            </span>
            <h2 className="font-serif-display text-3xl sm:text-4xl text-[#F0E8DC] mt-1">
              Recently Written
            </h2>
          </div>
          <Link
            to="/journal"
            className="text-xs uppercase tracking-wider text-[#A9A0A5] hover:text-[#F0E8DC] transition-colors hidden sm:block"
          >
            All Journal Dispatches →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Short Story */}
          {shortStories[0] && (
            <div className="bg-[#161219] border border-[#393039] p-6 rounded-sm space-y-3">
              <div className="flex items-center justify-between text-xs text-[#A9A0A5]">
                <span className="uppercase tracking-wider text-[#6D293B]">Short Story</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{shortStories[0].estimatedReadTime} min</span>
                </span>
              </div>
              <h3 className="font-serif-display text-2xl text-[#F0E8DC]">
                <Link to={`/short-stories/${shortStories[0].slug}`} className="hover:underline">
                  {shortStories[0].title}
                </Link>
              </h3>
              <p className="text-xs text-[#A9A0A5] leading-relaxed line-clamp-2">
                {shortStories[0].hook}
              </p>
              <div className="pt-2 text-xs">
                <Link
                  to={`/short-stories/${shortStories[0].slug}`}
                  className="text-[#F0E8DC] hover:text-[#6D293B] font-medium"
                >
                  Read Story →
                </Link>
              </div>
            </div>
          )}

          {/* Recent Journal Reflection */}
          {journal[0] && (
            <div className="bg-[#161219] border border-[#393039] p-6 rounded-sm space-y-3">
              <div className="flex items-center justify-between text-xs text-[#A9A0A5]">
                <span className="uppercase tracking-wider text-[#6D293B]">Author Journal</span>
                <span>{journal[0].publishedAt}</span>
              </div>
              <h3 className="font-serif-display text-2xl text-[#F0E8DC]">
                <Link to={`/journal/${journal[0].slug}`} className="hover:underline">
                  {journal[0].title}
                </Link>
              </h3>
              <p className="text-xs text-[#A9A0A5] leading-relaxed line-clamp-2">
                {journal[0].excerpt}
              </p>
              <div className="pt-2 text-xs">
                <Link
                  to={`/journal/${journal[0].slug}`}
                  className="text-[#F0E8DC] hover:text-[#6D293B] font-medium"
                >
                  Read Dispatch →
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ============================================================
          SECTION 5 — A NOTE FROM THE WRITER
          ============================================================ */}
      <section className="max-w-5xl mx-auto px-6">
        <div className="bg-[#17121a] border border-[#393039] p-8 md:p-12 rounded-sm grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Author Silhouette Photo */}
          <div className="md:col-span-4 flex justify-center">
            <div className="relative">
              <img
                src="/src/assets/images/gloomy_author_silhouette_1792629595646.jpg"
                alt="Your Own Gloomy Writer in dark study"
                className="w-48 h-48 md:w-56 md:h-56 object-cover rounded-full border-2 border-[#393039] shadow-xl"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-2 right-2 text-lg text-[#6D293B] bg-[#111013] px-2 py-0.5 rounded-full border border-[#393039]">
                ☾
              </span>
            </div>
          </div>

          {/* Intimate Author Note */}
          <div className="md:col-span-8 space-y-4">
            <span className="text-xs uppercase tracking-[0.25em] text-[#6D293B] font-semibold">
              A Note from the Desk
            </span>
            <h3 className="font-serif-display text-2xl sm:text-3xl text-[#F0E8DC]">
              Your Own Gloomy Writer
            </h3>
            <p className="text-sm text-[#A9A0A5] leading-relaxed font-light italic">
              “I do not write to shock or frighten; I write because there are truths that only speak when daylight has gone quiet. When you open one of these stories, you are not a passive spectator. You are keeping vigil with me.”
            </p>
            <p className="text-xs text-[#A9A0A5] leading-relaxed">
              Moonfall Fiction was created as an escape from algorithmic feeds and hurried reading. Here, stories are published when they are finished, read without haste, and discussed among those who understand the quiet beauty of melancholy.
            </p>
            <div className="pt-2">
              <Link
                to="/about"
                className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#F0E8DC] hover:text-[#6D293B] font-medium"
              >
                <span>Read the Writer's Philosophy</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 6 — THE READER'S RETURN
          ============================================================ */}
      <section className="max-w-4xl mx-auto px-6 text-center space-y-6">
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#A9A0A5]">
          <Feather className="w-3.5 h-3.5 text-[#6D293B]" />
          <span>The Dispatch</span>
        </div>

        <h2 className="font-serif-display text-3xl sm:text-4xl text-[#F0E8DC]">
          Never Miss a Nocturnal Release
        </h2>

        <p className="text-sm sm:text-base text-[#A9A0A5] max-w-xl mx-auto leading-relaxed font-light">
          New chapters, standalone short fiction, and reflections are released directly to readers. You can follow the writing through the Substack dispatch or return whenever you need silence.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          {authorProfile?.socials?.substack && (
            <a
              href={authorProfile.socials.substack}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 text-xs uppercase tracking-wider font-semibold text-[#111013] bg-[#F0E8DC] hover:bg-white rounded-sm transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#6D293B]" />
              <span>Join the Substack Dispatch</span>
            </a>
          )}

          <Link
            to="/connect"
            className="inline-flex items-center gap-2 px-6 py-3 text-xs uppercase tracking-wider font-medium text-[#F0E8DC] bg-[#211722] hover:bg-[#6D293B]/30 border border-[#393039] rounded-sm transition-all"
          >
            <span>Direct Author Channels</span>
          </Link>
        </div>
      </section>
    </div>
  );
};
