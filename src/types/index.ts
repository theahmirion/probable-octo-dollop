export type ContentStatus = 'published' | 'draft';

export interface Chapter {
  id: string;
  novelId: string;
  slug: string;
  chapterNumber: number;
  title: string;
  epigraph?: string;
  content: string;
  wordCount: number;
  estimatedReadTime: number; // in minutes
  status: ContentStatus;
  publishedAt: string;
  lastUpdated: string;
}

export interface Novel {
  id: string;
  slug: string;
  title: string;
  hook: string;
  synopsis: string;
  genre: string;
  contentWarnings: string[];
  status: ContentStatus;
  coverImage: string;
  featured: boolean;
  publicationDate: string;
  lastUpdated: string;
  chapters: Chapter[];
}

export interface ShortStory {
  id: string;
  slug: string;
  title: string;
  hook: string;
  synopsis: string;
  genre: string;
  content: string;
  wordCount: number;
  estimatedReadTime: number;
  status: ContentStatus;
  coverImage?: string;
  publishedAt: string;
}

export interface Poem {
  id: string;
  slug: string;
  title: string;
  stanzas: string[];
  notes?: string;
  status: ContentStatus;
  publishedAt: string;
}

export interface JournalPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
  status: ContentStatus;
  publishedAt: string;
}

export interface Comment {
  id: string;
  chapterId: string;
  parentId: string | null;
  authorName: string;
  isAuthor: boolean;
  content: string;
  isSpoiler: boolean;
  likesCount: number;
  isReported: boolean;
  reportReason?: string;
  isHidden: boolean;
  createdAt: string;
}

export interface AuthorProfile {
  name: string;
  penName: string;
  tagline: string;
  biography: string;
  philosophy: string;
  journey: string;
  socials: {
    instagram?: string;
    substack?: string;
    goodreads?: string;
    email?: string;
  };
  newsletterLink?: string;
}

export interface MoonfallDatabase {
  authorProfile: AuthorProfile;
  novels: Novel[];
  shortStories: ShortStory[];
  poetry: Poem[];
  journal: JournalPost[];
  comments: Comment[];
  lastBackupDate?: string;
  authorPassphrase?: string;
}

export type ReadingTheme = 'obsidian' | 'plum' | 'warm-parchment';
export type FontSize = 'sm' | 'base' | 'lg' | 'xl';
