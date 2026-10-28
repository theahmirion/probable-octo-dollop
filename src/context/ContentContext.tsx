import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Novel, ShortStory, Poem, JournalPost, AuthorProfile, ReadingTheme, FontSize } from '../types/index.js';
import { api } from '../services/api.js';
import { safeStorage } from '../utils/safeStorage.js';
import fallbackData from '../../data/moonfall_data.json';

interface LastReadInfo {
  novelSlug: string;
  chapterSlug: string;
  novelTitle: string;
  chapterTitle: string;
  timestamp: string;
}

interface ContentContextType {
  authorProfile: AuthorProfile | null;
  novels: Novel[];
  shortStories: ShortStory[];
  poetry: Poem[];
  journal: JournalPost[];
  isLoading: boolean;
  error: string | null;
  refreshContent: () => Promise<void>;

  // Reader Settings
  readingTheme: ReadingTheme;
  setReadingTheme: (theme: ReadingTheme) => void;
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;

  // Bookmarking / Resume reading
  lastRead: LastReadInfo | null;
  saveLastRead: (info: Omit<LastReadInfo, 'timestamp'>) => void;

  // Admin / Author State
  isAuthorLoggedIn: boolean;
  authorName: string;
  loginAsAuthor: (passphrase: string) => Promise<boolean>;
  logoutAuthor: () => void;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authorProfile, setAuthorProfile] = useState<AuthorProfile | null>(null);
  const [novels, setNovels] = useState<Novel[]>([]);
  const [shortStories, setShortStories] = useState<ShortStory[]>([]);
  const [poetry, setPoetry] = useState<Poem[]>([]);
  const [journal, setJournal] = useState<JournalPost[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Reader settings stored in localStorage
  const [readingTheme, setReadingThemeState] = useState<ReadingTheme>(() => {
    return (safeStorage.get('moonfall_theme') as ReadingTheme) || 'obsidian';
  });

  const [fontSize, setFontSizeState] = useState<FontSize>(() => {
    return (safeStorage.get('moonfall_font_size') as FontSize) || 'base';
  });

  const [lastRead, setLastRead] = useState<LastReadInfo | null>(() => {
    const saved = safeStorage.get('moonfall_last_read');
    if (saved) {
      try { return JSON.parse(saved); } catch { return null; }
    }
    return null;
  });

  // Admin authentication state
  const [isAuthorLoggedIn, setIsAuthorLoggedIn] = useState<boolean>(false);
  const [authorName, setAuthorName] = useState<string>('Your Own Gloomy Writer');

  const setReadingTheme = (theme: ReadingTheme) => {
    setReadingThemeState(theme);
    safeStorage.set('moonfall_theme', theme);
  };

  const setFontSize = (size: FontSize) => {
    setFontSizeState(size);
    safeStorage.set('moonfall_font_size', size);
  };

  const saveLastRead = (info: Omit<LastReadInfo, 'timestamp'>) => {
    const fullInfo: LastReadInfo = {
      ...info,
      timestamp: new Date().toISOString(),
    };
    setLastRead(fullInfo);
    safeStorage.set('moonfall_last_read', JSON.stringify(fullInfo));
  };

  const refreshContent = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      let data: any;
      try {
        data = await api.getPublicContent();
        if (!data || !Array.isArray(data.novels)) throw new Error('Malformed content response');
      } catch (apiErr) {
        // API unreachable (e.g. serverless function failed): fall back to bundled content
        // so the site still renders instead of showing an empty/blank page.
        console.warn('API unavailable, using bundled content:', apiErr);
        const fb: any = fallbackData;
        const pub = (x: any) => x.status === 'published';
        data = {
          authorProfile: fb.authorProfile,
          novels: (fb.novels || []).filter(pub).map((n: any) => ({
            ...n,
            chapters: (n.chapters || []).filter(pub).sort((a: any, b: any) => a.chapterNumber - b.chapterNumber),
          })),
          shortStories: (fb.shortStories || []).filter(pub),
          poetry: (fb.poetry || []).filter(pub),
          journal: (fb.journal || []).filter(pub),
        };
      }
      setAuthorProfile(data.authorProfile || null);
      setNovels(Array.isArray(data.novels) ? data.novels : []);
      setShortStories(Array.isArray(data.shortStories) ? data.shortStories : []);
      setPoetry(Array.isArray(data.poetry) ? data.poetry : []);
      setJournal(Array.isArray(data.journal) ? data.journal : []);
    } catch (err: any) {
      console.error('Error fetching public content:', err);
      setError(err.message || 'Could not connect to Moonfall archive.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check auth on mount
  useEffect(() => {
    const checkToken = async () => {
      const token = safeStorage.get('moonfall_author_token');
      if (token) {
        try {
          const res = await api.verifyAuth();
          if (res.authenticated) {
            setIsAuthorLoggedIn(true);
            setAuthorName(res.authorName);
          } else {
            safeStorage.remove('moonfall_author_token');
            setIsAuthorLoggedIn(false);
          }
        } catch {
          setIsAuthorLoggedIn(false);
        }
      }
    };
    checkToken();
    refreshContent();
  }, [refreshContent]);

  const loginAsAuthor = async (passphrase: string): Promise<boolean> => {
    try {
      const res = await api.login(passphrase);
      safeStorage.set('moonfall_author_token', res.token);
      setIsAuthorLoggedIn(true);
      setAuthorName(res.authorName);
      await refreshContent();
      return true;
    } catch (err) {
      console.error('Login error:', err);
      return false;
    }
  };

  const logoutAuthor = () => {
    safeStorage.remove('moonfall_author_token');
    setIsAuthorLoggedIn(false);
    refreshContent();
  };

  return (
    <ContentContext.Provider
      value={{
        authorProfile,
        novels,
        shortStories,
        poetry,
        journal,
        isLoading,
        error,
        refreshContent,
        readingTheme,
        setReadingTheme,
        fontSize,
        setFontSize,
        lastRead,
        saveLastRead,
        isAuthorLoggedIn,
        authorName,
        loginAsAuthor,
        logoutAuthor,
      }}
    >
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
};
