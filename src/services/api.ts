import { safeStorage } from '../utils/safeStorage.js';
import { MoonfallDatabase, Comment, Novel, Chapter, ShortStory, Poem, JournalPost, AuthorProfile } from '../types/index.js';

const getAuthHeaders = (): Record<string, string> => {
  const token = safeStorage.get('moonfall_author_token');
  return token ? { 'x-author-token': token } : {};
};

export const api = {
  // Public
  async getPublicContent(): Promise<{
    authorProfile: AuthorProfile;
    novels: Novel[];
    shortStories: ShortStory[];
    poetry: Poem[];
    journal: JournalPost[];
  }> {
    const res = await fetch('/api/public/content');
    if (!res.ok) throw new Error('Failed to load published content');
    return res.json();
  },

  async getComments(chapterId: string): Promise<Comment[]> {
    const res = await fetch(`/api/comments/${chapterId}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load comments');
    const data = await res.json();
    return data.comments || [];
  },

  async postComment(payload: {
    chapterId: string;
    parentId?: string | null;
    authorName: string;
    content: string;
    isSpoiler: boolean;
  }): Promise<Comment> {
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to submit comment');
    const data = await res.json();
    return data.comment;
  },

  async reactToComment(commentId: string): Promise<number> {
    const res = await fetch(`/api/comments/${commentId}/reaction`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to react to comment');
    const data = await res.json();
    return data.likesCount;
  },

  async reportComment(commentId: string, reason: string): Promise<void> {
    const res = await fetch(`/api/comments/${commentId}/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    if (!res.ok) throw new Error('Failed to report comment');
  },

  // Auth
  async login(passphrase: string): Promise<{ token: string; authorName: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passphrase }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Invalid credentials');
    }
    return res.json();
  },

  async verifyAuth(): Promise<{ authenticated: boolean; authorName: string }> {
    const res = await fetch('/api/auth/verify', {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return { authenticated: false, authorName: '' };
    return res.json();
  },

  // Admin
  async getAdminAll(): Promise<MoonfallDatabase> {
    const res = await fetch('/api/admin/all', {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Unauthorized or failed to load admin database');
    return res.json();
  },

  // Novel CRUD
  async createNovel(payload: Partial<Novel>): Promise<Novel> {
    const res = await fetch('/api/admin/novels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to create novel');
    return res.json();
  },

  async updateNovel(id: string, payload: Partial<Novel>): Promise<Novel> {
    const res = await fetch(`/api/admin/novels/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update novel');
    return res.json();
  },

  async deleteNovel(id: string): Promise<void> {
    const res = await fetch(`/api/admin/novels/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete novel');
  },

  // Chapter CRUD
  async createChapter(payload: Partial<Chapter>): Promise<Chapter> {
    const res = await fetch('/api/admin/chapters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to create chapter');
    return res.json();
  },

  async updateChapter(id: string, payload: Partial<Chapter>): Promise<Chapter> {
    const res = await fetch(`/api/admin/chapters/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update chapter');
    return res.json();
  },

  async reorderChapters(novelId: string, chapterIds: string[]): Promise<Chapter[]> {
    const res = await fetch(`/api/admin/novels/${novelId}/reorder-chapters`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ chapterIds }),
    });
    if (!res.ok) throw new Error('Failed to reorder chapters');
    const data = await res.json();
    return data.chapters;
  },

  async deleteChapter(id: string): Promise<void> {
    const res = await fetch(`/api/admin/chapters/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete chapter');
  },

  // Short Stories CRUD
  async createShortStory(payload: Partial<ShortStory>): Promise<ShortStory> {
    const res = await fetch('/api/admin/short-stories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to create short story');
    return res.json();
  },

  async updateShortStory(id: string, payload: Partial<ShortStory>): Promise<ShortStory> {
    const res = await fetch(`/api/admin/short-stories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update short story');
    return res.json();
  },

  async deleteShortStory(id: string): Promise<void> {
    const res = await fetch(`/api/admin/short-stories/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete story');
  },

  // Poetry CRUD
  async createPoem(payload: Partial<Poem>): Promise<Poem> {
    const res = await fetch('/api/admin/poetry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to create poem');
    return res.json();
  },

  async updatePoem(id: string, payload: Partial<Poem>): Promise<Poem> {
    const res = await fetch(`/api/admin/poetry/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update poem');
    return res.json();
  },

  async deletePoem(id: string): Promise<void> {
    const res = await fetch(`/api/admin/poetry/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete poem');
  },

  // Journal CRUD
  async createJournalPost(payload: Partial<JournalPost>): Promise<JournalPost> {
    const res = await fetch('/api/admin/journal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to create journal post');
    return res.json();
  },

  async updateJournalPost(id: string, payload: Partial<JournalPost>): Promise<JournalPost> {
    const res = await fetch(`/api/admin/journal/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update journal post');
    return res.json();
  },

  async deleteJournalPost(id: string): Promise<void> {
    const res = await fetch(`/api/admin/journal/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete post');
  },

  // Author Profile
  async updateAuthorProfile(profile: Partial<AuthorProfile>): Promise<AuthorProfile> {
    const res = await fetch('/api/admin/author-profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(profile),
    });
    if (!res.ok) throw new Error('Failed to update profile');
    return res.json();
  },

  // Comment Moderation
  async moderateComment(id: string, action: 'hide' | 'unhide' | 'delete' | 'resolve-report'): Promise<void> {
    const res = await fetch(`/api/admin/comments/${id}/moderate`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ action }),
    });
    if (!res.ok) throw new Error('Failed to moderate comment');
  },

  // Fast Status Toggle
  async toggleStatus(
    type: 'novel' | 'chapter' | 'story' | 'poem' | 'journal',
    id: string,
    novelId?: string
  ): Promise<'published' | 'draft'> {
    const res = await fetch('/api/admin/toggle-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ type, id, novelId }),
    });
    if (!res.ok) throw new Error('Failed to toggle status');
    const data = await res.json();
    return data.status;
  },

  // Set Featured Novel
  async setFeaturedNovel(id: string): Promise<Novel> {
    const res = await fetch(`/api/admin/novels/${id}/set-featured`, {
      method: 'POST',
      headers: { ...getAuthHeaders() },
    });
    if (!res.ok) throw new Error('Failed to set featured novel');
    const data = await res.json();
    return data.novel;
  },

  // Upload Custom Cover Artwork
  async uploadArtwork(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const dataUrl = reader.result as string;
          const res = await fetch('/api/admin/upload-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
            body: JSON.stringify({ fileName: file.name, dataUrl }),
          });
          if (!res.ok) throw new Error('Upload failed');
          const data = await res.json();
          resolve(data.url);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  },

  // Change Passphrase
  async changePassphrase(currentPassphrase: string, newPassphrase: string): Promise<void> {
    const res = await fetch('/api/admin/change-passphrase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ currentPassphrase, newPassphrase }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update passphrase');
    }
  },

  // Backup & Restore
  async restoreBackup(backupData: MoonfallDatabase): Promise<void> {
    const res = await fetch('/api/backup/restore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(backupData),
    });
    if (!res.ok) throw new Error('Failed to restore backup');
  },
};
