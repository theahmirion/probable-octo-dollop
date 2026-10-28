import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useContent } from '../context/ContentContext.js';
import { ReaderSettingsBar } from '../components/ReaderSettingsBar.js';
import { CommentSection } from '../components/CommentSection.js';
import { ArrowLeft, ArrowRight, BookOpen, Clock, Compass } from 'lucide-react';

export const ChapterPage: React.FC = () => {
  const { slug, chapterSlug } = useParams<{ slug: string; chapterSlug: string }>();
  const { novels, readingTheme, fontSize, saveLastRead, isLoading } = useContent();

  const novel = novels.find((n) => n.slug === slug);
  const currentChapter = novel?.chapters.find((c) => c.slug === chapterSlug);

  // Find previous and next chapters
  const currentIndex = novel?.chapters.findIndex((c) => c.slug === chapterSlug) ?? -1;
  const prevChapter = currentIndex > 0 ? novel?.chapters[currentIndex - 1] : null;
  const nextChapter =
    novel && currentIndex >= 0 && currentIndex < novel.chapters.length - 1
      ? novel.chapters[currentIndex + 1]
      : null;

  // Auto bookmark current position
  useEffect(() => {
    if (novel && currentChapter) {
      saveLastRead({
        novelSlug: novel.slug,
        chapterSlug: currentChapter.slug,
        novelTitle: novel.title,
        chapterTitle: `Ch. ${currentChapter.chapterNumber}: ${currentChapter.title}`,
      });
      window.scrollTo(0, 0);
    }
  }, [novel?.slug, currentChapter?.slug]);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-[#A9A0A5]">
        Opening the manuscript...
      </div>
    );
  }

  if (!novel || !currentChapter) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center space-y-4">
        <h2 className="font-serif-display text-3xl text-[#F0E8DC]">Chapter Not Found</h2>
        <p className="text-sm text-[#A9A0A5]">
          This chapter may still be in the author's private desk or has been relocated.
        </p>
        <Link
          to={`/novels/${slug}`}
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#F0E8DC] underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Table of Contents</span>
        </Link>
      </div>
    );
  }

  // Theme container classes
  const themeClass =
    readingTheme === 'plum'
      ? 'theme-plum'
      : readingTheme === 'warm-parchment'
      ? 'theme-warm-parchment'
      : 'theme-obsidian';

  // Font size classes
  const fontSizeClass =
    fontSize === 'sm'
      ? 'text-base leading-relaxed'
      : fontSize === 'lg'
      ? 'text-xl leading-loose'
      : fontSize === 'xl'
      ? 'text-2xl leading-loose'
      : 'text-lg leading-relaxed';

  // Format content paragraphs
  const paragraphs = currentChapter.content.split('\n\n').filter(Boolean);

  return (
    <div className={`min-h-screen transition-colors duration-200 ${themeClass}`}>
      {/* Top Reader Utility Bar */}
      <ReaderSettingsBar
        novelSlug={novel.slug}
        novelTitle={novel.title}
        chapterTitle={currentChapter.title}
        readTimeMinutes={currentChapter.estimatedReadTime}
        wordCount={currentChapter.wordCount}
      />

      <article className="max-w-3xl mx-auto px-6 py-12 md:py-20">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#A9A0A5] reading-muted mb-8">
          <Link to="/novels" className="hover:text-[#F0E8DC] transition-colors">
            Novels
          </Link>
          <span>/</span>
          <Link to={`/novels/${novel.slug}`} className="hover:text-[#F0E8DC] transition-colors truncate max-w-[200px]">
            {novel.title}
          </Link>
          <span>/</span>
          <span className="text-[#F0E8DC] reading-content">Ch. {currentChapter.chapterNumber}</span>
        </nav>

        {/* Chapter Header */}
        <header className="space-y-4 mb-14 pb-8 border-b border-[#393039]/40 reading-border text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs text-[#A9A0A5] reading-muted">
            <span className="uppercase tracking-[0.25em] text-[#6D293B] font-semibold">
              Chapter {currentChapter.chapterNumber}
            </span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{currentChapter.estimatedReadTime} min read</span>
            </span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{currentChapter.wordCount.toLocaleString()} words</span>
          </div>

          <h1 className="font-serif-display text-4xl sm:text-5xl md:text-6xl font-medium text-[#F0E8DC] reading-content tracking-tight">
            {currentChapter.title}
          </h1>

          {/* Epigraph */}
          {currentChapter.epigraph && (
            <div className="pt-2 max-w-xl mx-auto md:mx-0">
              <p className="font-serif-display text-base sm:text-lg italic text-[#A9A0A5] reading-muted leading-relaxed">
                {currentChapter.epigraph}
              </p>
            </div>
          )}
        </header>

        {/* Distraction-Free Reading Body */}
        <div className={`font-prose-reading reading-content space-y-6 ${fontSizeClass}`}>
          {paragraphs.map((p, idx) => {
            const isFirst = idx === 0;

            // Scene break check (e.g. * * *)
            if (p.trim() === '* * *' || p.trim() === '***' || p.trim() === '---') {
              return (
                <div key={idx} className="py-8 text-center text-[#6D293B] text-lg select-none">
                  ☾ · · · ☽
                </div>
              );
            }

            return (
              <p
                key={idx}
                className={`${
                  isFirst
                    ? 'first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-[#6D293B]'
                    : ''
                }`}
              >
                {p}
              </p>
            );
          })}
        </div>

        {/* Chapter Bottom Separator */}
        <div className="my-16 pt-8 border-t border-[#393039]/50 reading-border text-center text-xs tracking-[0.3em] uppercase text-[#A9A0A5] reading-muted">
          <span>End of Chapter {currentChapter.chapterNumber}</span>
        </div>

        {/* Previous / Next Chapter Navigation */}
        <nav className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-12" aria-label="Chapter transitions">
          {prevChapter ? (
            <Link
              to={`/novels/${novel.slug}/chapters/${prevChapter.slug}`}
              className="p-5 bg-[#17121a] hover:bg-[#201824] border border-[#393039] reading-border rounded-sm transition-all group flex flex-col justify-between"
            >
              <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#A9A0A5] reading-muted mb-1">
                <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                <span>Previous Chapter</span>
              </div>
              <div className="font-serif-display text-lg text-[#F0E8DC] reading-content group-hover:text-white">
                Ch. {prevChapter.chapterNumber}: {prevChapter.title}
              </div>
            </Link>
          ) : (
            <Link
              to={`/novels/${novel.slug}`}
              className="p-5 bg-[#17121a]/50 border border-[#393039]/40 reading-border rounded-sm text-xs text-[#A9A0A5] reading-muted flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-[#6D293B]" />
              <span>Table of Contents</span>
            </Link>
          )}

          {nextChapter ? (
            <Link
              to={`/novels/${novel.slug}/chapters/${nextChapter.slug}`}
              className="p-5 bg-[#17121a] hover:bg-[#201824] border border-[#393039] reading-border rounded-sm transition-all group flex flex-col justify-between sm:text-right"
            >
              <div className="flex items-center justify-start sm:justify-end gap-1.5 text-xs uppercase tracking-wider text-[#A9A0A5] reading-muted mb-1">
                <span>Next Chapter</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
              <div className="font-serif-display text-lg text-[#F0E8DC] reading-content group-hover:text-white">
                Ch. {nextChapter.chapterNumber}: {nextChapter.title}
              </div>
            </Link>
          ) : (
            <div className="p-5 bg-[#17121a]/50 border border-[#393039]/40 reading-border rounded-sm sm:text-right text-xs text-[#A9A0A5] reading-muted">
              <span>Next chapter is being transcribed in the study.</span>
            </div>
          )}
        </nav>

        {/* Chapter-wise Community & Comments */}
        <CommentSection
          chapterId={currentChapter.id}
          chapterTitle={`Ch. ${currentChapter.chapterNumber}: ${currentChapter.title}`}
        />
      </article>
    </div>
  );
};
