import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useContent } from '../context/ContentContext.js';
import { Menu, X, BookOpen, Feather } from 'lucide-react';

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { isAuthorLoggedIn } = useContent();

  const navLinks = [
    { label: 'Novels', path: '/novels' },
    { label: 'Short Stories', path: '/short-stories' },
    { label: 'Poetry', path: '/poetry' },
    { label: 'Journal', path: '/journal' },
    { label: 'About', path: '/about' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 bg-[#111013]/90 backdrop-blur-md border-b border-[#393039]/60 transition-colors">
      <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between gap-8">
        
        {/* Zone 1: Single text element Brand wordmark with crescent moon emblem */}
        <Link
          to="/"
          className="flex items-center gap-2.5 text-lg md:text-xl font-serif-display tracking-widest text-[#F0E8DC] hover:text-white transition-colors whitespace-nowrap shrink-0 group"
        >
          <span className="text-[#6D293B] group-hover:text-[#8f364e] transition-colors text-base" aria-hidden="true">
            ☾
          </span>
          <span className="font-semibold uppercase tracking-[0.2em]">Moonfall Fiction</span>
        </Link>

        {/* Zone 2: 4-5 single-line clean text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#A9A0A5]">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                isActive(link.path)
                  ? 'text-[#F0E8DC] border-b border-[#6D293B]'
                  : 'hover:text-[#F0E8DC]'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/connect"
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              isActive('/connect')
                ? 'text-[#F0E8DC] border-b border-[#6D293B]'
                : 'hover:text-[#F0E8DC]'
            }`}
          >
            Connect
          </Link>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="hidden md:flex items-center gap-4 shrink-0">
          {isAuthorLoggedIn ? (
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium tracking-wide uppercase text-[#F0E8DC] bg-[#211722] border border-[#6D293B] rounded-sm hover:bg-[#6D293B]/30 transition-all whitespace-nowrap shrink-0"
            >
              <Feather className="w-3.5 h-3.5 text-[#F0E8DC]" />
              <span>Author Studio</span>
            </Link>
          ) : (
            <Link
              to="/novels"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium tracking-wider uppercase text-[#111013] bg-[#F0E8DC] hover:bg-white rounded-sm transition-all whitespace-nowrap shrink-0 shadow-sm"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Enter Stories</span>
            </Link>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#A9A0A5] hover:text-[#F0E8DC] focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#18131a] border-b border-[#393039] px-6 py-6 space-y-4">
          <nav className="flex flex-col gap-3.5 text-sm">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`py-1.5 transition-colors ${
                  isActive(link.path) ? 'text-[#F0E8DC] font-semibold' : 'text-[#A9A0A5]'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/connect"
              onClick={() => setMobileMenuOpen(false)}
              className={`py-1.5 transition-colors ${
                isActive('/connect') ? 'text-[#F0E8DC] font-semibold' : 'text-[#A9A0A5]'
              }`}
            >
              Connect & Links
            </Link>
            <div className="pt-3 border-t border-[#393039]/60 flex flex-col gap-2">
              <Link
                to="/novels"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-xs uppercase tracking-wider font-semibold text-[#111013] bg-[#F0E8DC] rounded-sm"
              >
                Enter the Stories
              </Link>
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-xs uppercase tracking-wider text-[#A9A0A5] hover:text-[#F0E8DC]"
              >
                {isAuthorLoggedIn ? 'Author Studio (Active)' : 'Author Login'}
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
