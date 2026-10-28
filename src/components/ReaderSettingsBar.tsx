import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useContent } from '../context/ContentContext.js';
import { ReadingTheme, FontSize } from '../types/index.js';
import { BookOpen, Sliders } from 'lucide-react';

interface ReaderSettingsBarProps {
  novelSlug: string;
  novelTitle: string;
  chapterTitle: string;
  readTimeMinutes: number;
  wordCount: number;
}

export const ReaderSettingsBar: React.FC<ReaderSettingsBarProps> = ({
  novelSlug,
  novelTitle,
  chapterTitle,
  readTimeMinutes,
  wordCount,
}) => {
  const { readingTheme, setReadingTheme, fontSize, setFontSize } = useContent();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [controlsOpen, setControlsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (totalScroll > 0) {
        const currentProgress = (window.scrollY / totalScroll) * 100;
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const themes: { id: ReadingTheme; label: string; bg: string }[] = [
    { id: 'obsidian', label: 'Obsidian', bg: 'bg-[#111013] border-[#393039]' },
    { id: 'plum', label: 'Midnight Plum', bg: 'bg-[#1d141e] border-[#6D293B]' },
    { id: 'warm-parchment', label: 'Parchment', bg: 'bg-[#f7f1e7] border-[#ded3c5]' },
  ];

  const fontSizes: { id: FontSize; label: string }[] = [
    { id: 'sm', label: 'Small' },
    { id: 'base', label: 'Medium' },
    { id: 'lg', label: 'Large' },
    { id: 'xl', label: 'Expanded' },
  ];

  return (
    <>
      {/* Top scroll reading progress bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-transparent z-50 pointer-events-none">
        <div
          className="h-full bg-[#6D293B] transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Floating or sticky reader utility strip */}
      <div className="sticky top-18 z-30 bg-[#161219]/90 backdrop-blur-md border-b border-[#393039]/60 px-6 py-2.5 transition-colors">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4 text-xs">
          {/* Breadcrumb back to novel */}
          <Link
            to={`/novels/${novelSlug}`}
            className="flex items-center gap-2 text-[#A9A0A5] hover:text-[#F0E8DC] transition-colors truncate"
            title={`Back to ${novelTitle} Table of Contents`}
          >
            <BookOpen className="w-3.5 h-3.5 shrink-0 text-[#6D293B]" />
            <span className="truncate">
              <strong className="text-[#F0E8DC] font-medium">{novelTitle}</strong>
              <span className="hidden sm:inline"> · Contents</span>
            </span>
          </Link>

          {/* Reading Meta & Control toggler */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden md:inline text-[#A9A0A5]">
              {wordCount.toLocaleString()} words · {readTimeMinutes} min read
            </span>

            <button
              onClick={() => setControlsOpen(!controlsOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-[#A9A0A5] hover:text-[#F0E8DC] border border-[#393039] rounded hover:border-[#6D293B] transition-colors"
              aria-label="Adjust reading typography and theme"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Reader Style</span>
            </button>
          </div>
        </div>

        {/* Reader Customizer dropdown */}
        {controlsOpen && (
          <div className="max-w-4xl mx-auto mt-3 pt-3 border-t border-[#393039]/50 flex flex-wrap items-center justify-between gap-4 text-xs">
            {/* Theme selector */}
            <div className="flex items-center gap-2">
              <span className="text-[#A9A0A5] uppercase tracking-wider text-[11px]">Surface:</span>
              <div className="flex items-center gap-1.5">
                {themes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setReadingTheme(t.id)}
                    className={`px-2.5 py-1 rounded border transition-all ${t.bg} ${
                      readingTheme === t.id
                        ? 'ring-1 ring-[#6D293B] font-semibold text-white'
                        : 'text-[#A9A0A5] opacity-70 hover:opacity-100'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Font size selector */}
            <div className="flex items-center gap-2">
              <span className="text-[#A9A0A5] uppercase tracking-wider text-[11px]">Type Size:</span>
              <div className="flex items-center gap-1 bg-[#111013] p-0.5 rounded border border-[#393039]">
                {fontSizes.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFontSize(f.id)}
                    className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                      fontSize === f.id
                        ? 'bg-[#6D293B] text-[#F0E8DC] font-medium'
                        : 'text-[#A9A0A5] hover:text-[#F0E8DC]'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
