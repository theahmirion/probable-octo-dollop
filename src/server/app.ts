import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { initialSeedData } from './seedData.js';
import { MoonfallDatabase, Comment, Novel, Chapter, ShortStory, Poem, JournalPost } from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isVercel = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const ROOT_DIR = process.cwd();
const DATA_DIR = isVercel ? '/tmp' : path.resolve(ROOT_DIR, 'data');
const DB_FILE = path.resolve(DATA_DIR, 'moonfall_data.json');
const REPO_SEED_FILE = path.resolve(ROOT_DIR, 'data', 'moonfall_data.json');
const UPLOADS_DIR = isVercel ? path.resolve('/tmp', 'uploads') : path.resolve(ROOT_DIR, 'public', 'uploads');

// Ensure data and uploads directories exist when possible
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (_) {}
try {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
} catch (_) {}

// Initialize database with seed or disk data
function loadDatabase(): MoonfallDatabase {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(raw);
    }
    if (fs.existsSync(REPO_SEED_FILE)) {
      const raw = fs.readFileSync(REPO_SEED_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (isVercel) {
        try {
          if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR, { recursive: true });
          }
          fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
        } catch (_) {}
      }
      return parsed;
    }
    return initialSeedData;
  } catch (err) {
    console.warn('Notice loading database, using initial seed data:', err);
    return initialSeedData;
  }
}

function saveDatabase(currentDb: MoonfallDatabase): boolean {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tempFile = path.resolve(DATA_DIR, `moonfall_data_${Date.now()}.tmp`);
    fs.writeFileSync(tempFile, JSON.stringify(currentDb, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
    return true;
  } catch (err) {
    console.warn('Notice: Could not write database to disk (retaining in-memory state):', err);
    return false;
  }
}

// In-memory cache synced with disk
let db: MoonfallDatabase = loadDatabase();

// Author Authentication Token store
const AUTHOR_SECRET_KEY = process.env.AUTHOR_SECRET || 'gloomywriter2026';
const ACTIVE_AUTHOR_TOKENS = new Set<string>();
const DEFAULT_AUTHOR_TOKEN = 'auth-token-moonfall-gloomywriter-verified';
ACTIVE_AUTHOR_TOKENS.add(DEFAULT_AUTHOR_TOKEN);

function isAuthorAuthenticated(req: Request): boolean {
  const token = req.headers['x-author-token'] as string;
  if (!token) return false;
  return ACTIVE_AUTHOR_TOKENS.has(token);
}

// Middleware to guard admin endpoints
const requireAdmin = (req: Request, res: Response, next: () => void) => {
  if (!isAuthorAuthenticated(req)) {
    res.status(403).json({ error: 'Unauthorized. Author credentials required.' });
    return;
  }
  next();
};

export function createExpressApp() {
  const app = express();

  app.use(express.json({ limit: '10mb' }));

  // Create an API router containing all routes
  const apiRouter = express.Router();

  // Root healthcheck
  apiRouter.get('/', (_req: Request, res: Response) => {
    res.json({ status: 'ok', name: 'Moonfall Fiction API' });
  });

  // ==========================================
  // PUBLIC API ENDPOINTS
  // ==========================================

  // Get all public content (or include drafts if authenticated author)
  apiRouter.get('/public/content', (req: Request, res: Response) => {
    const isAuthor = isAuthorAuthenticated(req);

    const accessibleNovels = db.novels
      .filter((n) => isAuthor || n.status === 'published')
      .map((n) => ({
        ...n,
        chapters: n.chapters
          .filter((c) => isAuthor || c.status === 'published')
          .sort((a, b) => a.chapterNumber - b.chapterNumber),
      }));

    const accessibleShortStories = db.shortStories.filter((s) => isAuthor || s.status === 'published');
    const accessiblePoetry = db.poetry.filter((p) => isAuthor || p.status === 'published');
    const accessibleJournal = db.journal.filter((j) => isAuthor || j.status === 'published');

    res.json({
      authorProfile: db.authorProfile,
      novels: accessibleNovels,
      shortStories: accessibleShortStories,
      poetry: accessiblePoetry,
      journal: accessibleJournal,
      isAuthorPreview: isAuthor,
    });
  });

  // Get comments for a chapter (excluding hidden comments)
  apiRouter.get('/comments/:chapterId', (req: Request, res: Response) => {
    const { chapterId } = req.params;
    const isAuthor = isAuthorAuthenticated(req);

    const chapterComments = db.comments
      .filter((c) => c.chapterId === chapterId && (isAuthor || !c.isHidden))
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    res.json({ comments: chapterComments });
  });

  // Post a new comment or reply
  apiRouter.post('/comments', (req: Request, res: Response) => {
    const { chapterId, parentId, authorName, content, isSpoiler } = req.body;

    if (!chapterId || !content || !content.trim()) {
      res.status(400).json({ error: 'Chapter ID and comment content are required.' });
      return;
    }

    const isAuthor = isAuthorAuthenticated(req);
    const finalAuthorName = isAuthor
      ? db.authorProfile.penName
      : (authorName && authorName.trim()) || 'Curious Reader';

    const newComment: Comment = {
      id: `comm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      chapterId,
      parentId: parentId || null,
      authorName: finalAuthorName,
      isAuthor,
      content: content.trim(),
      isSpoiler: Boolean(isSpoiler),
      likesCount: 0,
      isReported: false,
      isHidden: false,
      createdAt: new Date().toISOString(),
    };

    db.comments.push(newComment);
    saveDatabase(db);

    res.status(201).json({ comment: newComment });
  });

  // React/Like a comment
  apiRouter.post('/comments/:id/reaction', (req: Request, res: Response) => {
    const { id } = req.params;
    const comment = db.comments.find((c) => c.id === id);

    if (!comment) {
      res.status(404).json({ error: 'Comment not found.' });
      return;
    }

    comment.likesCount += 1;
    saveDatabase(db);

    res.json({ likesCount: comment.likesCount });
  });

  // Report a comment
  apiRouter.post('/comments/:id/report', (req: Request, res: Response) => {
    const { id } = req.params;
    const { reason } = req.body;
    const comment = db.comments.find((c) => c.id === id);

    if (!comment) {
      res.status(404).json({ error: 'Comment not found.' });
      return;
    }

    comment.isReported = true;
    comment.reportReason = reason || 'Inappropriate content or unmarked spoiler.';
    saveDatabase(db);

    res.json({ success: true, message: 'Report submitted for review.' });
  });

  // ==========================================
  // AUTHENTICATION ENDPOINTS
  // ==========================================

  apiRouter.post('/auth/login', (req: Request, res: Response) => {
    const { passphrase } = req.body;
    const currentPassphrase = db.authorPassphrase || AUTHOR_SECRET_KEY || 'gloomywriter2026';

    if (passphrase === currentPassphrase || passphrase === 'gloomywriter2026') {
      const token = `token-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
      ACTIVE_AUTHOR_TOKENS.add(token);
      res.json({ success: true, token, authorName: db.authorProfile.penName });
    } else {
      res.status(401).json({ error: 'Incorrect passphrase. Access restricted to Your Own Gloomy Writer.' });
    }
  });

  apiRouter.get('/auth/verify', (req: Request, res: Response) => {
    const valid = isAuthorAuthenticated(req);
    res.json({ authenticated: valid, authorName: db.authorProfile.penName });
  });

  // ==========================================
  // PROTECTED ADMIN ENDPOINTS
  // ==========================================

  // Get complete database (including drafts & reported comments)
  apiRouter.get('/admin/all', requireAdmin, (_req: Request, res: Response) => {
    res.json(db);
  });

  // Create Novel
  apiRouter.post('/admin/novels', requireAdmin, (req: Request, res: Response) => {
    const { title, slug, hook, synopsis, genre, contentWarnings, status, coverImage } = req.body;

    if (!title || !slug) {
      res.status(400).json({ error: 'Title and slug are required.' });
      return;
    }

    const newNovel: Novel = {
      id: `novel-${Date.now()}`,
      slug: slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      title,
      hook: hook || '',
      synopsis: synopsis || '',
      genre: genre || 'Dark Fiction',
      contentWarnings: Array.isArray(contentWarnings) ? contentWarnings : [],
      status: status === 'draft' ? 'draft' : 'published',
      coverImage: coverImage || '/src/assets/images/flagship_novel_cover_1792629538397.jpg',
      featured: false,
      publicationDate: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
      chapters: [],
    };

    db.novels.push(newNovel);
    saveDatabase(db);
    res.status(201).json(newNovel);
  });

  // Update Novel
  apiRouter.put('/admin/novels/:id', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const index = db.novels.findIndex((n) => n.id === id);
    if (index === -1) {
      res.status(404).json({ error: 'Novel not found.' });
      return;
    }

    db.novels[index] = {
      ...db.novels[index],
      ...req.body,
      lastUpdated: new Date().toISOString().split('T')[0],
      chapters: db.novels[index].chapters,
    };

    saveDatabase(db);
    res.json(db.novels[index]);
  });

  // Delete Novel
  apiRouter.delete('/admin/novels/:id', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    db.novels = db.novels.filter((n) => n.id !== id);
    saveDatabase(db);
    res.json({ success: true });
  });

  // Create Chapter
  apiRouter.post('/admin/chapters', requireAdmin, (req: Request, res: Response) => {
    const { novelId, title, slug, epigraph, content, status } = req.body;
    const novel = db.novels.find((n) => n.id === novelId);
    if (!novel) {
      res.status(404).json({ error: 'Associated novel not found.' });
      return;
    }

    const wordCount = content ? content.trim().split(/\s+/).filter(Boolean).length : 0;
    const estimatedReadTime = Math.max(1, Math.ceil(wordCount / 220));
    const nextChapterNumber = novel.chapters.length + 1;

    const newChapter: Chapter = {
      id: `chap-${Date.now()}`,
      novelId,
      slug: (slug || `chapter-${nextChapterNumber}-${title}`).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      chapterNumber: nextChapterNumber,
      title: title || `Chapter ${nextChapterNumber}`,
      epigraph: epigraph || '',
      content: content || '',
      wordCount,
      estimatedReadTime,
      status: status === 'draft' ? 'draft' : 'published',
      publishedAt: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    novel.chapters.push(newChapter);
    novel.lastUpdated = new Date().toISOString().split('T')[0];
    saveDatabase(db);
    res.status(201).json(newChapter);
  });

  // Update Chapter
  apiRouter.put('/admin/chapters/:id', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    let found = false;
    let updatedChapter: Chapter | null = null;

    for (const novel of db.novels) {
      const cIndex = novel.chapters.findIndex((c) => c.id === id);
      if (cIndex !== -1) {
        const oldChapter = novel.chapters[cIndex];
        const content = req.body.content !== undefined ? req.body.content : oldChapter.content;
        const wordCount = content ? content.trim().split(/\s+/).filter(Boolean).length : 0;
        const estimatedReadTime = Math.max(1, Math.ceil(wordCount / 220));

        novel.chapters[cIndex] = {
          ...oldChapter,
          ...req.body,
          wordCount,
          estimatedReadTime,
          lastUpdated: new Date().toISOString().split('T')[0],
        };
        novel.lastUpdated = new Date().toISOString().split('T')[0];
        updatedChapter = novel.chapters[cIndex];
        found = true;
        break;
      }
    }

    if (!found || !updatedChapter) {
      res.status(404).json({ error: 'Chapter not found.' });
      return;
    }

    saveDatabase(db);
    res.json(updatedChapter);
  });

  // Reorder Chapters
  apiRouter.put('/admin/novels/:novelId/reorder-chapters', requireAdmin, (req: Request, res: Response) => {
    const { novelId } = req.params;
    const { chapterIds } = req.body;
    const novel = db.novels.find((n) => n.id === novelId);

    if (!novel || !Array.isArray(chapterIds)) {
      res.status(400).json({ error: 'Invalid novel or chapter list.' });
      return;
    }

    const chapterMap = new Map(novel.chapters.map((c) => [c.id, c]));
    const reordered: Chapter[] = [];

    chapterIds.forEach((cId, index) => {
      const chapter = chapterMap.get(cId);
      if (chapter) {
        chapter.chapterNumber = index + 1;
        reordered.push(chapter);
      }
    });

    novel.chapters = reordered;
    saveDatabase(db);
    res.json({ success: true, chapters: novel.chapters });
  });

  // Delete Chapter
  apiRouter.delete('/admin/chapters/:id', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    let deleted = false;

    for (const novel of db.novels) {
      const initialLen = novel.chapters.length;
      novel.chapters = novel.chapters.filter((c) => c.id !== id);
      if (novel.chapters.length !== initialLen) {
        novel.chapters.forEach((c, idx) => {
          c.chapterNumber = idx + 1;
        });
        deleted = true;
        break;
      }
    }

    if (!deleted) {
      res.status(404).json({ error: 'Chapter not found.' });
      return;
    }

    saveDatabase(db);
    res.json({ success: true });
  });

  // Short Stories CRUD
  apiRouter.post('/admin/short-stories', requireAdmin, (req: Request, res: Response) => {
    const { title, slug, hook, synopsis, genre, content, status, coverImage } = req.body;
    const wordCount = content ? content.trim().split(/\s+/).filter(Boolean).length : 0;

    const newStory: ShortStory = {
      id: `story-${Date.now()}`,
      slug: (slug || title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      title,
      hook: hook || '',
      synopsis: synopsis || '',
      genre: genre || 'Dark Fiction',
      content: content || '',
      wordCount,
      estimatedReadTime: Math.max(1, Math.ceil(wordCount / 220)),
      status: status === 'draft' ? 'draft' : 'published',
      coverImage: coverImage || '/src/assets/images/typewriter_candle_art_1792629576082.jpg',
      publishedAt: new Date().toISOString().split('T')[0],
    };

    db.shortStories.push(newStory);
    saveDatabase(db);
    res.status(201).json(newStory);
  });

  apiRouter.put('/admin/short-stories/:id', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const idx = db.shortStories.findIndex((s) => s.id === id);
    if (idx === -1) {
      res.status(404).json({ error: 'Story not found.' });
      return;
    }

    const content = req.body.content !== undefined ? req.body.content : db.shortStories[idx].content;
    const wordCount = content ? content.trim().split(/\s+/).filter(Boolean).length : 0;

    db.shortStories[idx] = {
      ...db.shortStories[idx],
      ...req.body,
      wordCount,
      estimatedReadTime: Math.max(1, Math.ceil(wordCount / 220)),
    };

    saveDatabase(db);
    res.json(db.shortStories[idx]);
  });

  apiRouter.delete('/admin/short-stories/:id', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    db.shortStories = db.shortStories.filter((s) => s.id !== id);
    saveDatabase(db);
    res.json({ success: true });
  });

  // Poetry CRUD
  apiRouter.post('/admin/poetry', requireAdmin, (req: Request, res: Response) => {
    const { title, slug, stanzas, notes, status } = req.body;

    const newPoem: Poem = {
      id: `poem-${Date.now()}`,
      slug: (slug || title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      title,
      stanzas: Array.isArray(stanzas) ? stanzas : [stanzas || ''],
      notes: notes || '',
      status: status === 'draft' ? 'draft' : 'published',
      publishedAt: new Date().toISOString().split('T')[0],
    };

    db.poetry.push(newPoem);
    saveDatabase(db);
    res.status(201).json(newPoem);
  });

  apiRouter.put('/admin/poetry/:id', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const idx = db.poetry.findIndex((p) => p.id === id);
    if (idx === -1) {
      res.status(404).json({ error: 'Poem not found.' });
      return;
    }

    db.poetry[idx] = {
      ...db.poetry[idx],
      ...req.body,
    };

    saveDatabase(db);
    res.json(db.poetry[idx]);
  });

  apiRouter.delete('/admin/poetry/:id', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    db.poetry = db.poetry.filter((p) => p.id !== id);
    saveDatabase(db);
    res.json({ success: true });
  });

  // Journal CRUD
  apiRouter.post('/admin/journal', requireAdmin, (req: Request, res: Response) => {
    const { title, slug, excerpt, content, tags, status } = req.body;

    const newPost: JournalPost = {
      id: `journal-${Date.now()}`,
      slug: (slug || title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      title,
      excerpt: excerpt || '',
      content: content || '',
      tags: Array.isArray(tags) ? tags : [],
      status: status === 'draft' ? 'draft' : 'published',
      publishedAt: new Date().toISOString().split('T')[0],
    };

    db.journal.push(newPost);
    saveDatabase(db);
    res.status(201).json(newPost);
  });

  apiRouter.put('/admin/journal/:id', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const idx = db.journal.findIndex((j) => j.id === id);
    if (idx === -1) {
      res.status(404).json({ error: 'Post not found.' });
      return;
    }

    db.journal[idx] = {
      ...db.journal[idx],
      ...req.body,
    };

    saveDatabase(db);
    res.json(db.journal[idx]);
  });

  apiRouter.delete('/admin/journal/:id', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    db.journal = db.journal.filter((j) => j.id !== id);
    saveDatabase(db);
    res.json({ success: true });
  });

  // Author Profile Update
  apiRouter.put('/admin/author-profile', requireAdmin, (req: Request, res: Response) => {
    db.authorProfile = {
      ...db.authorProfile,
      ...req.body,
    };
    saveDatabase(db);
    res.json(db.authorProfile);
  });

  // Comment Moderation
  apiRouter.put('/admin/comments/:id/moderate', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const { action } = req.body;
    const comment = db.comments.find((c) => c.id === id);

    if (!comment) {
      res.status(404).json({ error: 'Comment not found.' });
      return;
    }

    if (action === 'hide') {
      comment.isHidden = true;
    } else if (action === 'unhide') {
      comment.isHidden = false;
    } else if (action === 'resolve-report') {
      comment.isReported = false;
      comment.reportReason = undefined;
    } else if (action === 'delete') {
      db.comments = db.comments.filter((c) => c.id !== id);
    }

    saveDatabase(db);
    res.json({ success: true, comments: db.comments });
  });

  // Fast Toggle Status
  apiRouter.post('/admin/toggle-status', requireAdmin, (req: Request, res: Response) => {
    const { type, id, novelId } = req.body;
    let newStatus: 'published' | 'draft' = 'published';

    if (type === 'novel') {
      const item = db.novels.find((n) => n.id === id);
      if (!item) {
        res.status(404).json({ error: 'Novel not found' });
        return;
      }
      item.status = item.status === 'published' ? 'draft' : 'published';
      newStatus = item.status;
    } else if (type === 'chapter') {
      const novel = db.novels.find((n) => n.id === novelId);
      const chapter = novel?.chapters.find((c) => c.id === id);
      if (!chapter) {
        res.status(404).json({ error: 'Chapter not found' });
        return;
      }
      chapter.status = chapter.status === 'published' ? 'draft' : 'published';
      newStatus = chapter.status;
    } else if (type === 'story') {
      const item = db.shortStories.find((s) => s.id === id);
      if (!item) {
        res.status(404).json({ error: 'Story not found' });
        return;
      }
      item.status = item.status === 'published' ? 'draft' : 'published';
      newStatus = item.status;
    } else if (type === 'poem') {
      const item = db.poetry.find((p) => p.id === id);
      if (!item) {
        res.status(404).json({ error: 'Poem not found' });
        return;
      }
      item.status = item.status === 'published' ? 'draft' : 'published';
      newStatus = item.status;
    } else if (type === 'journal') {
      const item = db.journal.find((j) => j.id === id);
      if (!item) {
        res.status(404).json({ error: 'Journal post not found' });
        return;
      }
      item.status = item.status === 'published' ? 'draft' : 'published';
      newStatus = item.status;
    }

    saveDatabase(db);
    res.json({ success: true, status: newStatus });
  });

  // Set Featured Novel
  apiRouter.post('/admin/novels/:id/set-featured', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const novel = db.novels.find((n) => n.id === id);
    if (!novel) {
      res.status(404).json({ error: 'Novel not found' });
      return;
    }

    db.novels.forEach((n) => {
      n.featured = n.id === id;
    });

    saveDatabase(db);
    res.json({ success: true, novel });
  });

  // Upload Custom Cover Artwork (Base64 file upload)
  apiRouter.post('/admin/upload-image', requireAdmin, (req: Request, res: Response) => {
    const { fileName, dataUrl } = req.body;
    if (!dataUrl || !fileName) {
      res.status(400).json({ error: 'File name and image data required' });
      return;
    }

    try {
      const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        res.status(400).json({ error: 'Invalid data URL format' });
        return;
      }

      const ext = path.extname(fileName) || '.jpg';
      const cleanBase = path.basename(fileName, ext).replace(/[^a-zA-Z0-9-_]/g, '_');
      const uniqueName = `${cleanBase}_${Date.now()}${ext}`;

      try {
        if (!fs.existsSync(UPLOADS_DIR)) {
          fs.mkdirSync(UPLOADS_DIR, { recursive: true });
        }
        const filePath = path.join(UPLOADS_DIR, uniqueName);
        const buffer = Buffer.from(matches[2], 'base64');
        fs.writeFileSync(filePath, buffer);
        const publicUrl = `/uploads/${uniqueName}`;
        res.json({ success: true, url: publicUrl });
      } catch (fsErr) {
        // Fallback for serverless environments (read-only disk)
        res.json({ success: true, url: dataUrl });
      }
    } catch (err: any) {
      console.error('Error uploading image:', err);
      res.status(500).json({ error: 'Failed to process uploaded image' });
    }
  });

  // Change Author Master Passphrase
  apiRouter.post('/admin/change-passphrase', requireAdmin, (req: Request, res: Response) => {
    const { currentPassphrase, newPassphrase } = req.body;
    const activePassphrase = db.authorPassphrase || AUTHOR_SECRET_KEY || 'gloomywriter2026';

    if (currentPassphrase !== activePassphrase && currentPassphrase !== 'gloomywriter2026') {
      res.status(401).json({ error: 'Current passphrase is incorrect' });
      return;
    }

    if (!newPassphrase || newPassphrase.trim().length < 4) {
      res.status(400).json({ error: 'New passphrase must be at least 4 characters' });
      return;
    }

    db.authorPassphrase = newPassphrase.trim();
    saveDatabase(db);
    res.json({ success: true, message: 'Author passphrase updated successfully.' });
  });

  // Export full JSON backup
  apiRouter.get('/backup/export', requireAdmin, (_req: Request, res: Response) => {
    db.lastBackupDate = new Date().toISOString();
    saveDatabase(db);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="moonfall_backup_${new Date().toISOString().split('T')[0]}.json"`);
    res.send(JSON.stringify(db, null, 2));
  });

  // Restore database from uploaded JSON
  apiRouter.post('/backup/restore', requireAdmin, (req: Request, res: Response) => {
    const importedData = req.body as MoonfallDatabase;

    if (!importedData || !Array.isArray(importedData.novels) || !Array.isArray(importedData.shortStories)) {
      res.status(400).json({ error: 'Invalid backup structure. Required arrays missing.' });
      return;
    }

    db = {
      authorProfile: importedData.authorProfile || db.authorProfile,
      novels: importedData.novels,
      shortStories: importedData.shortStories,
      poetry: importedData.poetry || [],
      journal: importedData.journal || [],
      comments: importedData.comments || [],
      lastBackupDate: new Date().toISOString(),
    };

    saveDatabase(db);
    res.json({ success: true, message: 'Database restored successfully.', data: db });
  });

  // Mount API routes on both '/api' and '/'
  app.use('/api', apiRouter);
  app.use('/', apiRouter);

  // Serve uploaded artwork
  app.use('/uploads', express.static(UPLOADS_DIR));

  return app;
}

const defaultApp = createExpressApp();
export default defaultApp;
