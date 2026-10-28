import React from 'react';
import { Link } from 'react-router-dom';
import { useContent } from '../context/ContentContext.js';

export const Footer: React.FC = () => {
  const { authorProfile, isAuthorLoggedIn } = useContent();

  return (
    <footer className="bg-[#0c0b0e] border-t border-[#393039]/60 pt-16 pb-12 text-[#A9A0A5]">
      <div className="max-w-7xl mx-auto px-6">
        {/* The Closing Passage */}
        <div className="max-w-3xl mx-auto text-center mb-16 pb-12 border-b border-[#393039]/40">
          <span className="text-[#6D293B] text-xl font-serif mb-4 block" aria-hidden="true">☾</span>
          <p className="font-serif-display text-2xl md:text-3xl italic text-[#F0E8DC] leading-relaxed mb-4">
            “The fog will lift by sunrise, but the things we read in the dark remain written on the ribs forever.”
          </p>
          <p className="text-xs tracking-[0.2em] uppercase text-[#A9A0A5]">
            — Closing Passage · Moonfall Archive
          </p>
        </div>

        {/* 3-Column Editorial Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2 text-xl font-serif-display tracking-widest text-[#F0E8DC]">
              <span className="text-[#6D293B]">☾</span>
              <span className="font-semibold uppercase tracking-[0.2em]">Moonfall Fiction</span>
            </Link>
            <p className="text-sm text-[#A9A0A5] max-w-md leading-relaxed">
              An independent literary sanctuary for dark fiction, psychological mysteries, and quiet words written after midnight. Authored and curated by Your Own Gloomy Writer.
            </p>
            <div className="text-xs text-[#A9A0A5]/80 space-x-3 pt-1">
              <span>Independent Publishing</span>
              <span>·</span>
              <span>No Clickbait</span>
              <span>·</span>
              <span>Reader Supported</span>
            </div>
          </div>

          {/* Library Destinations */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest text-[#F0E8DC] font-semibold">The Library</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/novels" className="hover:text-[#F0E8DC] transition-colors">Serialized Novels</Link>
              </li>
              <li>
                <Link to="/short-stories" className="hover:text-[#F0E8DC] transition-colors">Short Stories</Link>
              </li>
              <li>
                <Link to="/poetry" className="hover:text-[#F0E8DC] transition-colors">Melancholic Poetry</Link>
              </li>
              <li>
                <Link to="/journal" className="hover:text-[#F0E8DC] transition-colors">Writer's Journal</Link>
              </li>
            </ul>
          </div>

          {/* Author & Dispatch */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest text-[#F0E8DC] font-semibold">Sanctuary</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="hover:text-[#F0E8DC] transition-colors">About the Writer</Link>
              </li>
              <li>
                <Link to="/connect" className="hover:text-[#F0E8DC] transition-colors">Letters & Dispatch</Link>
              </li>
              {authorProfile?.socials?.substack && (
                <li>
                  <a
                    href={authorProfile.socials.substack}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-[#F0E8DC] transition-colors"
                  >
                    Substack Dispatch ↗
                  </a>
                </li>
              )}
              <li>
                <Link to="/admin" className="text-xs text-[#A9A0A5]/70 hover:text-[#6D293B] transition-colors">
                  {isAuthorLoggedIn ? 'Author Dashboard (Active)' : 'Author Studio Access'}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar with Unboxed Metadata */}
        <div className="pt-8 border-t border-[#393039]/40 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#A9A0A5]">
          <p>© {new Date().getFullYear()} Moonfall Fiction. All literary works copyrighted by Your Own Gloomy Writer.</p>
          <div className="flex items-center gap-4">
            <span>Dark Fiction Sanctuary</span>
            <span>·</span>
            <span>Curated with Care</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
