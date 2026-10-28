import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useContent } from '../context/ContentContext.js';
import { api } from '../services/api.js';
import { MoonfallDatabase, Novel, Chapter, ShortStory, Poem, JournalPost, Comment } from '../types/index.js';
import {
  Lock,
  Unlock,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Save,
  Download,
  Upload,
  ArrowUp,
  ArrowDown,
  ShieldAlert,
  CheckCircle,
  FileText,
  BookOpen,
  Feather,
  RefreshCw,
  LogOut,
  Layers,
  Search,
  Star,
  Image as ImageIcon,
  Key,
  ExternalLink,
  Bold,
  Italic,
  Quote,
  Heading,
  Divide,
  Sliders,
  Check,
  Loader2,
} from 'lucide-react';

const PRESET_COVERS = [
  { name: 'The Ashen Clocktower', path: '/src/assets/images/flagship_novel_cover_1792629538397.jpg' },
  { name: 'The Conservatory of Ashes', path: '/src/assets/images/glasshouse_novel_cover_1792629557476.jpg' },
  { name: 'Midnight Gothic Window', path: '/src/assets/images/moonfall_hero_nocturne_1792629519153.jpg' },
  { name: 'Typewriter & Candle', path: '/src/assets/images/typewriter_candle_art_1792629576082.jpg' },
  { name: 'Author Silhouette', path: '/src/assets/images/gloomy_author_silhouette_1792629595646.jpg' },
];

export const AdminDashboardPage: React.FC = () => {
  const { isAuthorLoggedIn, authorName, loginAsAuthor, logoutAuthor, refreshContent } = useContent();

  const [passphraseInput, setPassphraseInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Full admin data
  const [adminDb, setAdminDb] = useState<MoonfallDatabase | null>(null);
  const [loadingDb, setLoadingDb] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'novels' | 'stories' | 'poetry' | 'journal' | 'comments' | 'profile' | 'security' | 'backup'
  >('overview');

  // Search and Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  // Novel editing modal/form
  const [editingNovel, setEditingNovel] = useState<Partial<Novel> | null>(null);
  const [novelModalOpen, setNovelModalOpen] = useState(false);

  // Chapter editing modal/form
  const [editingChapter, setEditingChapter] = useState<{
    novelId: string;
    chapter: Partial<Chapter>;
  } | null>(null);
  const [chapterModalOpen, setChapterModalOpen] = useState(false);
  const [chapterEditorTab, setChapterEditorTab] = useState<'write' | 'preview'>('write');
  const [chapterPreviewTheme, setChapterPreviewTheme] = useState<'obsidian' | 'plum' | 'warm-parchment'>('obsidian');

  // Short Story editing
  const [editingStory, setEditingStory] = useState<Partial<ShortStory> | null>(null);
  const [storyModalOpen, setStoryModalOpen] = useState(false);
  const [storyEditorTab, setStoryEditorTab] = useState<'write' | 'preview'>('write');

  // Poetry editing
  const [editingPoem, setEditingPoem] = useState<Partial<Poem> | null>(null);
  const [poemModalOpen, setPoemModalOpen] = useState(false);

  // Journal editing
  const [editingJournal, setEditingJournal] = useState<Partial<JournalPost> | null>(null);
  const [journalModalOpen, setJournalModalOpen] = useState(false);

  // Status notice
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Password change state
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passChangeSuccess, setPassChangeSuccess] = useState(false);
  const [passChangeError, setPassChangeError] = useState<string | null>(null);

  // In-app Delete Confirmation state
  const [pendingDelete, setPendingDelete] = useState<{
    type: 'novel' | 'chapter' | 'story' | 'poem' | 'journal' | 'comment';
    id: string;
    title: string;
    extraId?: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Restore JSON
  const [restoreJson, setRestoreJson] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const fetchAdminData = useCallback(async () => {
    if (!isAuthorLoggedIn) return;
    try {
      setLoadingDb(true);
      const data = await api.getAdminAll();
      setAdminDb(data);
    } catch (err: any) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoadingDb(false);
    }
  }, [isAuthorLoggedIn]);

  useEffect(() => {
    if (isAuthorLoggedIn) {
      fetchAdminData();
    }
  }, [isAuthorLoggedIn, fetchAdminData]);

  const showNotice = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const success = await loginAsAuthor(passphraseInput);
    if (!success) {
      setLoginError('Incorrect passphrase. Access restricted to Your Own Gloomy Writer.');
    }
  };

  const handleQuickDemoLogin = async () => {
    setLoginError(null);
    await loginAsAuthor('gloomywriter2026');
  };

  // Fast Status Toggle
  const handleToggleStatus = async (
    type: 'novel' | 'chapter' | 'story' | 'poem' | 'journal',
    id: string,
    novelId?: string
  ) => {
    try {
      const newStatus = await api.toggleStatus(type, id, novelId);
      showNotice(`Status switched to ${newStatus}.`);
      await fetchAdminData();
      await refreshContent();
    } catch (err: any) {
      showNotice(err.message || 'Failed to toggle status');
    }
  };

  // Set Featured Flagship Novel
  const handleSetFeatured = async (id: string) => {
    try {
      await api.setFeaturedNovel(id);
      showNotice('Set as Flagship Feature on homepage.');
      await fetchAdminData();
      await refreshContent();
    } catch (err: any) {
      showNotice(err.message || 'Failed to set featured novel');
    }
  };

  // Image Upload Handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'novel' | 'story' | 'author') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const url = await api.uploadArtwork(file);
      if (target === 'novel' && editingNovel) {
        setEditingNovel({ ...editingNovel, coverImage: url });
      } else if (target === 'story' && editingStory) {
        setEditingStory({ ...editingStory, coverImage: url });
      }
      showNotice('Artwork uploaded successfully.');
    } catch (err: any) {
      showNotice('Upload failed: ' + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  // Text formatting tool for prose editors
  const insertFormatting = (
    prefix: string,
    suffix: string = '',
    content: string,
    setContent: (val: string) => void,
    placeholder: string = 'text'
  ) => {
    setContent(content + (content ? '\n\n' : '') + `${prefix}${placeholder}${suffix}`);
  };

  // Novel Handlers
  const handleSaveNovel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNovel?.title || !editingNovel?.slug) return;

    try {
      if (editingNovel.id) {
        await api.updateNovel(editingNovel.id, editingNovel);
        showNotice(`Novel "${editingNovel.title}" updated.`);
      } else {
        await api.createNovel(editingNovel);
        showNotice(`Novel "${editingNovel.title}" created.`);
      }
      setNovelModalOpen(false);
      setEditingNovel(null);
      await fetchAdminData();
      await refreshContent();
    } catch (err: any) {
      showNotice(err.message || 'Error saving novel');
    }
  };

  const handleDeleteNovel = (id: string, title: string) => {
    setPendingDelete({ type: 'novel', id, title });
  };

  // Chapter Handlers
  const handleSaveChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChapter?.chapter.title || !editingChapter.novelId) return;

    try {
      if (editingChapter.chapter.id) {
        await api.updateChapter(editingChapter.chapter.id, editingChapter.chapter);
        showNotice(`Chapter saved.`);
      } else {
        await api.createChapter({
          ...editingChapter.chapter,
          novelId: editingChapter.novelId,
        });
        showNotice(`Chapter published.`);
      }
      setChapterModalOpen(false);
      setEditingChapter(null);
      await fetchAdminData();
      await refreshContent();
    } catch (err: any) {
      showNotice(err.message || 'Error saving chapter');
    }
  };

  const handleDeleteChapter = (id: string, title: string, novelId?: string) => {
    setPendingDelete({ type: 'chapter', id, title, extraId: novelId });
  };

  const executeDelete = async () => {
    if (!pendingDelete) return;
    setIsDeleting(true);
    try {
      if (pendingDelete.type === 'novel') {
        await api.deleteNovel(pendingDelete.id);
        showNotice(`Novel "${pendingDelete.title}" deleted.`);
      } else if (pendingDelete.type === 'chapter') {
        await api.deleteChapter(pendingDelete.id);
        showNotice(`Chapter "${pendingDelete.title}" deleted.`);
      } else if (pendingDelete.type === 'story') {
        await api.deleteShortStory(pendingDelete.id);
        showNotice(`Short story "${pendingDelete.title}" deleted.`);
      } else if (pendingDelete.type === 'poem') {
        await api.deletePoem(pendingDelete.id);
        showNotice(`Poem "${pendingDelete.title}" deleted.`);
      } else if (pendingDelete.type === 'journal') {
        await api.deleteJournalPost(pendingDelete.id);
        showNotice(`Journal post "${pendingDelete.title}" deleted.`);
      } else if (pendingDelete.type === 'comment') {
        await api.moderateComment(pendingDelete.id, 'delete');
        showNotice('Comment removed.');
      }
      setPendingDelete(null);
      await fetchAdminData();
      await refreshContent();
    } catch (err: any) {
      showNotice(`Error: ${err.message || 'Failed to delete'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMoveChapter = async (novel: Novel, chapterId: string, direction: 'up' | 'down') => {
    const ids = novel.chapters.map((c) => c.id);
    const index = ids.indexOf(chapterId);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === ids.length - 1) return;

    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = ids[index];
    ids[index] = ids[swapIndex];
    ids[swapIndex] = temp;

    try {
      await api.reorderChapters(novel.id, ids);
      await fetchAdminData();
      await refreshContent();
      showNotice('Chapters reordered.');
    } catch (err: any) {
      showNotice('Failed to reorder chapters: ' + (err.message || 'Unknown error'));
    }
  };

  // Comment Moderation Handlers
  const handleModerateComment = async (id: string, action: 'hide' | 'unhide' | 'delete' | 'resolve-report') => {
    try {
      await api.moderateComment(id, action);
      showNotice(`Comment action "${action}" completed.`);
      await fetchAdminData();
    } catch (err: any) {
      showNotice('Error updating comment: ' + (err.message || 'Unknown error'));
    }
  };

  // Change Passphrase
  const handleChangePassphrase = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassChangeError(null);
    setPassChangeSuccess(false);

    if (newPass !== confirmPass) {
      setPassChangeError('New passphrases do not match.');
      return;
    }

    try {
      await api.changePassphrase(currentPass, newPass);
      setPassChangeSuccess(true);
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
      showNotice('Author master passphrase updated successfully.');
    } catch (err: any) {
      setPassChangeError(err.message || 'Failed to update passphrase');
    }
  };

  // Backup & Restore
  const handleExportBackup = async () => {
    try {
      const res = await fetch('/api/backup/export');
      if (!res.ok) throw new Error('Backup export request failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `moonfall_sanctuary_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showNotice('Backup downloaded successfully.');
    } catch (err: any) {
      showNotice('Failed to export backup: ' + (err.message || 'Unknown error'));
    }
  };

  const handleBackupFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setRestoreJson(reader.result as string);
    };
    reader.readAsText(file);
  };

  const handleRestoreBackup = async () => {
    try {
      const parsed = JSON.parse(restoreJson);
      await api.restoreBackup(parsed);
      showNotice('Database restored successfully from backup.');
      setRestoreJson('');
      await fetchAdminData();
      await refreshContent();
    } catch (err: any) {
      showNotice('Invalid JSON backup file: ' + err.message);
    }
  };

  // ==========================================
  // UNVERIFIED: LOGIN SCREEN
  // ==========================================
  if (!isAuthorLoggedIn) {
    return (
      <div className="max-w-md mx-auto px-6 py-24">
        <div className="bg-[#18131a] border border-[#393039] p-8 rounded-sm shadow-xl text-center space-y-6">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#211722] border border-[#6D293B] flex items-center justify-center text-[#F0E8DC]">
            <Lock className="w-5 h-5 text-[#6D293B]" />
          </div>

          <div>
            <h1 className="font-serif-display text-2xl sm:text-3xl text-[#F0E8DC]">
              Author Sanctuary Access
            </h1>
            <p className="text-xs text-[#A9A0A5] mt-1.5">
              Enter the master passphrase for Your Own Gloomy Writer.
            </p>
          </div>

          {loginError && (
            <div className="p-3 bg-rose-950/40 border border-rose-900/60 rounded text-xs text-rose-300">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#A9A0A5] mb-1">
                Author Passphrase
              </label>
              <input
                type="password"
                required
                value={passphraseInput}
                onChange={(e) => setPassphraseInput(e.target.value)}
                placeholder="Enter private author passphrase"
                className="w-full bg-[#111013] border border-[#393039] px-3 py-2 text-sm text-[#F0E8DC] rounded-sm focus:outline-none focus:border-[#6D293B]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 text-xs uppercase tracking-wider font-semibold text-[#111013] bg-[#F0E8DC] hover:bg-white rounded-sm transition-all"
            >
              Unlock Publishing Suite
            </button>
          </form>

          <div className="pt-4 border-t border-[#393039]/50">
            <button
              onClick={handleQuickDemoLogin}
              className="text-xs text-[#A9A0A5] hover:text-[#F0E8DC] underline"
            >
              Quick Unlock with Author Passphrase (gloomywriter2026)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate high-level metrics
  const totalNovels = adminDb?.novels.length || 0;
  const allChapters = adminDb?.novels.flatMap((n) => n.chapters) || [];
  const publishedChaptersCount = allChapters.filter((c) => c.status === 'published').length;
  const draftChaptersCount = allChapters.filter((c) => c.status === 'draft').length;
  const totalWords = allChapters.reduce((acc, c) => acc + c.wordCount, 0);
  const reportedComments = adminDb?.comments.filter((c) => c.isReported) || [];

  // Filtered lists for current tab
  const filterBySearchAndStatus = <T extends { title?: string; name?: string; status?: string }>(items: T[] = []) => {
    return items.filter((item) => {
      const matchSearch =
        !searchQuery ||
        (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchSearch && matchStatus;
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
      {/* Top Bar with Author Session & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#393039]">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#6D293B] font-semibold">
            <Unlock className="w-3.5 h-3.5" />
            <span>Verified Author Session · Full Control</span>
          </div>
          <h1 className="font-serif-display text-3xl sm:text-4xl text-[#F0E8DC]">
            Publishing Sanctuary · {authorName}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#A9A0A5] hover:text-[#F0E8DC] border border-[#393039] rounded-sm"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Public Site</span>
          </Link>

          <button
            onClick={() => {
              fetchAdminData();
              refreshContent();
              showNotice('Database synchronized.');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#A9A0A5] hover:text-[#F0E8DC] border border-[#393039] rounded-sm"
            title="Reload from disk"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync</span>
          </button>

          <button
            onClick={logoutAuthor}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-300 hover:text-white bg-rose-950/40 border border-rose-900/60 rounded-sm"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Lock Desk</span>
          </button>
        </div>
      </div>

      {/* Status Notice Toast */}
      {statusMessage && (
        <div className="bg-[#211722] border border-[#6D293B] text-[#F0E8DC] px-4 py-2.5 rounded-sm text-xs flex items-center justify-between shadow-lg">
          <span className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{statusMessage}</span>
          </span>
          <button onClick={() => setStatusMessage(null)} className="text-[#A9A0A5] hover:text-white">
            ×
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#393039]/60 text-xs">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'novels', label: `Novels & Chapters (${totalNovels})` },
          { id: 'stories', label: `Short Stories (${adminDb?.shortStories.length || 0})` },
          { id: 'poetry', label: `Poetry (${adminDb?.poetry.length || 0})` },
          { id: 'journal', label: `Journal (${adminDb?.journal.length || 0})` },
          {
            id: 'comments',
            label: `Moderation (${adminDb?.comments.length || 0})${
              reportedComments.length > 0 ? ` · ${reportedComments.length} Reports` : ''
            }`,
          },
          { id: 'profile', label: 'Author Profile & Socials' },
          { id: 'security', label: 'Security & Password' },
          { id: 'backup', label: 'Backup & Restore' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as any);
              setSearchQuery('');
            }}
            className={`px-3 py-2 rounded-sm whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#F0E8DC] text-[#111013] font-semibold'
                : 'text-[#A9A0A5] hover:text-[#F0E8DC] hover:bg-[#18131a]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search & Filter Toolbar (Active for content tabs) */}
      {['novels', 'stories', 'poetry', 'journal', 'comments'].includes(activeTab) && (
        <div className="flex flex-wrap items-center justify-between gap-4 p-3 bg-[#161219] border border-[#393039] rounded-sm text-xs">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#A9A0A5]" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#111013] border border-[#393039] pl-9 pr-3 py-1.5 text-xs text-[#F0E8DC] rounded-sm focus:outline-none focus:border-[#6D293B]"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[#A9A0A5] uppercase tracking-wider text-[10px]">Status:</span>
            {(['all', 'published', 'draft'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-2.5 py-1 text-[11px] rounded transition-colors ${
                  statusFilter === filter
                    ? 'bg-[#F0E8DC] text-[#111013] font-medium'
                    : 'text-[#A9A0A5] hover:text-[#F0E8DC]'
                }`}
              >
                {filter === 'all' ? 'All' : filter === 'published' ? 'Published' : 'Drafts'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================
          TAB 1: OVERVIEW
          ============================================================ */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#161219] border border-[#393039] p-5 rounded-sm space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-[#A9A0A5]">Novels</span>
              <div className="font-serif-display text-3xl text-[#F0E8DC] tabular-nums">{totalNovels}</div>
              <span className="text-[11px] text-[#A9A0A5]">Serialized manuscripts</span>
            </div>

            <div className="bg-[#161219] border border-[#393039] p-5 rounded-sm space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-[#A9A0A5]">Chapters</span>
              <div className="font-serif-display text-3xl text-[#F0E8DC] tabular-nums">
                {publishedChaptersCount} <span className="text-xs text-[#A9A0A5]">({draftChaptersCount} drafts)</span>
              </div>
              <span className="text-[11px] text-[#A9A0A5]">{totalWords.toLocaleString()} words total</span>
            </div>

            <div className="bg-[#161219] border border-[#393039] p-5 rounded-sm space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-[#A9A0A5]">Community Echoes</span>
              <div className="font-serif-display text-3xl text-[#F0E8DC] tabular-nums">
                {adminDb?.comments.length || 0}
              </div>
              <span className="text-[11px] text-[#A9A0A5]">Chapter comments</span>
            </div>

            <div
              className={`p-5 rounded-sm space-y-1 border ${
                reportedComments.length > 0 ? 'bg-rose-950/30 border-rose-900/70' : 'bg-[#161219] border-[#393039]'
              }`}
            >
              <span className="text-[11px] uppercase tracking-wider text-[#A9A0A5]">Pending Reports</span>
              <div className="font-serif-display text-3xl text-rose-300 tabular-nums">
                {reportedComments.length}
              </div>
              <span className="text-[11px] text-[#A9A0A5]">Awaiting moderation</span>
            </div>
          </div>

          {/* Quick Creation Strip */}
          <div className="bg-[#18131a] border border-[#393039] p-6 rounded-sm space-y-4">
            <h3 className="font-serif-display text-xl text-[#F0E8DC]">Quick Creation Strip</h3>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  setEditingNovel({
                    title: '',
                    slug: '',
                    hook: '',
                    synopsis: '',
                    genre: 'Gothic Mystery · Psychological',
                    contentWarnings: [],
                    status: 'draft',
                    coverImage: PRESET_COVERS[0].path,
                  });
                  setNovelModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs uppercase tracking-wider font-semibold text-[#111013] bg-[#F0E8DC] hover:bg-white rounded-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Novel</span>
              </button>

              <button
                onClick={() => {
                  if (adminDb?.novels[0]) {
                    setEditingChapter({
                      novelId: adminDb.novels[0].id,
                      chapter: {
                        title: '',
                        slug: '',
                        epigraph: '',
                        content: '',
                        status: 'published',
                      },
                    });
                    setChapterEditorTab('write');
                    setChapterModalOpen(true);
                  }
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs uppercase tracking-wider font-medium text-[#F0E8DC] bg-[#211722] border border-[#393039] hover:border-[#6D293B] rounded-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Write Chapter</span>
              </button>

              <button
                onClick={() => {
                  setEditingStory({
                    title: '',
                    slug: '',
                    hook: '',
                    synopsis: '',
                    genre: 'Liminal Fiction · Melancholy',
                    content: '',
                    status: 'published',
                    coverImage: PRESET_COVERS[3].path,
                  });
                  setStoryEditorTab('write');
                  setStoryModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs uppercase tracking-wider font-medium text-[#F0E8DC] bg-[#211722] border border-[#393039] hover:border-[#6D293B] rounded-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Write Short Story</span>
              </button>

              <button
                onClick={handleExportBackup}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs uppercase tracking-wider font-medium text-[#F0E8DC] bg-[#211722] border border-[#393039] hover:border-[#6D293B] rounded-sm cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Backup</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          TAB 2: NOVELS & CHAPTERS
          ============================================================ */}
      {activeTab === 'novels' && (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="font-serif-display text-2xl text-[#F0E8DC]">Manuscripts & Serialization</h2>
            <button
              onClick={() => {
                setEditingNovel({
                  title: '',
                  slug: '',
                  hook: '',
                  synopsis: '',
                  genre: 'Gothic Mystery · Psychological',
                  contentWarnings: [],
                  status: 'draft',
                  coverImage: PRESET_COVERS[0].path,
                });
                setNovelModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs uppercase tracking-wider font-semibold text-[#111013] bg-[#F0E8DC] hover:bg-white rounded-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Novel</span>
            </button>
          </div>

          <div className="space-y-8">
            {filterBySearchAndStatus(adminDb?.novels).map((novel) => (
              <div key={novel.id} className="bg-[#161219] border border-[#393039] p-6 rounded-sm space-y-6">
                {/* Novel Info Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#393039]">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-[#A9A0A5]">
                      {/* Fast Status Toggle Button */}
                      <button
                        onClick={() => handleToggleStatus('novel', novel.id)}
                        className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-semibold transition-colors ${
                          novel.status === 'published'
                            ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 hover:bg-emerald-900/80'
                            : 'bg-amber-950/60 text-amber-300 border border-amber-800/60 hover:bg-amber-900/80'
                        }`}
                        title="Click to toggle Draft / Published"
                      >
                        {novel.status}
                      </button>

                      {novel.featured && (
                        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider font-semibold bg-[#6D293B]/60 text-white border border-[#6D293B]">
                          <Star className="w-2.5 h-2.5 fill-white" />
                          <span>Flagship</span>
                        </span>
                      )}

                      <span>{novel.genre}</span>
                      <span>·</span>
                      <span>{novel.chapters.length} Chapters</span>
                    </div>

                    <h3 className="font-serif-display text-2xl text-[#F0E8DC]">{novel.title}</h3>
                    <p className="text-xs italic text-[#A9A0A5]">“{novel.hook}”</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Make Featured Button */}
                    {!novel.featured && (
                      <button
                        onClick={() => handleSetFeatured(novel.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-[#A9A0A5] hover:text-[#F0E8DC] border border-[#393039] rounded-sm hover:border-[#6D293B]"
                        title="Feature as Flagship on Homepage"
                      >
                        <Star className="w-3 h-3 text-[#6D293B]" />
                        <span>Set Flagship</span>
                      </button>
                    )}

                    <Link
                      to={`/novels/${novel.slug}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-[#A9A0A5] hover:text-[#F0E8DC] border border-[#393039] rounded-sm"
                      title="View public novel page"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Preview</span>
                    </Link>

                    <button
                      onClick={() => {
                        setEditingChapter({
                          novelId: novel.id,
                          chapter: {
                            title: '',
                            slug: '',
                            epigraph: '',
                            content: '',
                            status: 'published',
                          },
                        });
                        setChapterEditorTab('write');
                        setChapterModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-[#F0E8DC] bg-[#211722] border border-[#6D293B] rounded-sm hover:bg-[#6D293B]/30"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Chapter</span>
                    </button>

                    <button
                      onClick={() => {
                        setEditingNovel(novel);
                        setNovelModalOpen(true);
                      }}
                      className="p-1.5 text-[#A9A0A5] hover:text-[#F0E8DC]"
                      title="Edit novel metadata"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDeleteNovel(novel.id, novel.title)}
                      className="p-1.5 text-[#A9A0A5] hover:text-rose-400"
                      title="Delete novel"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Chapter List & Reordering */}
                <div className="space-y-3">
                  <h4 className="text-xs uppercase tracking-wider text-[#A9A0A5]">Chapters Table of Contents</h4>

                  {novel.chapters.length === 0 ? (
                    <p className="text-xs text-[#A9A0A5] italic py-2">No chapters written yet.</p>
                  ) : (
                    <div className="divide-y divide-[#393039]/40 border border-[#393039]/50 rounded-sm">
                      {novel.chapters.map((ch, idx) => (
                        <div
                          key={ch.id}
                          className="p-3 bg-[#120e15] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-[#6D293B]">Ch. {ch.chapterNumber}</span>
                              <span className="text-[#F0E8DC] font-medium">{ch.title}</span>

                              {/* Fast Status Toggle for Chapter */}
                              <button
                                onClick={() => handleToggleStatus('chapter', ch.id, novel.id)}
                                className={`text-[10px] uppercase px-1.5 py-0.5 rounded cursor-pointer ${
                                  ch.status === 'published'
                                    ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60'
                                    : 'bg-amber-950/60 text-amber-300 border border-amber-800/60'
                                }`}
                                title="Click to toggle Published / Draft"
                              >
                                {ch.status}
                              </button>
                            </div>
                            <div className="text-[#A9A0A5] text-[11px] space-x-2">
                              <span>{ch.wordCount.toLocaleString()} words</span>
                              <span>·</span>
                              <span>{ch.estimatedReadTime} min read</span>
                              <span>·</span>
                              <span>Updated {ch.lastUpdated}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {/* Public Reader Preview Link */}
                            <Link
                              to={`/novels/${novel.slug}/chapters/${ch.slug}`}
                              className="p-1 text-[#A9A0A5] hover:text-[#F0E8DC]"
                              title="Read chapter in reader"
                            >
                              <BookOpen className="w-3.5 h-3.5" />
                            </Link>

                            {/* Reorder Buttons */}
                            <button
                              disabled={idx === 0}
                              onClick={() => handleMoveChapter(novel, ch.id, 'up')}
                              className="p-1 text-[#A9A0A5] hover:text-[#F0E8DC] disabled:opacity-30"
                              title="Move chapter earlier"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              disabled={idx === novel.chapters.length - 1}
                              onClick={() => handleMoveChapter(novel, ch.id, 'down')}
                              className="p-1 text-[#A9A0A5] hover:text-[#F0E8DC] disabled:opacity-30"
                              title="Move chapter later"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit Chapter */}
                            <button
                              onClick={() => {
                                setEditingChapter({ novelId: novel.id, chapter: ch });
                                setChapterEditorTab('write');
                                setChapterModalOpen(true);
                              }}
                              className="p-1 text-[#A9A0A5] hover:text-[#F0E8DC]"
                              title="Edit chapter text"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete Chapter */}
                            <button
                              onClick={() => handleDeleteChapter(ch.id, ch.title, novel.id)}
                              className="p-1 text-[#A9A0A5] hover:text-rose-400 cursor-pointer"
                              title="Delete chapter"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================
          TAB 3: SHORT STORIES
          ============================================================ */}
      {activeTab === 'stories' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif-display text-2xl text-[#F0E8DC]">Short Stories Collection</h2>
            <button
              onClick={() => {
                setEditingStory({
                  title: '',
                  slug: '',
                  hook: '',
                  synopsis: '',
                  genre: 'Liminal Fiction · Melancholy',
                  content: '',
                  status: 'published',
                  coverImage: PRESET_COVERS[3].path,
                });
                setStoryEditorTab('write');
                setStoryModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs uppercase tracking-wider font-semibold text-[#111013] bg-[#F0E8DC] hover:bg-white rounded-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Short Story</span>
            </button>
          </div>

          <div className="divide-y divide-[#393039] border border-[#393039] rounded-sm">
            {filterBySearchAndStatus(adminDb?.shortStories).map((story) => (
              <div key={story.id} className="p-4 bg-[#161219] flex items-center justify-between gap-4 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif-display text-lg text-[#F0E8DC]">{story.title}</span>
                    <button
                      onClick={() => handleToggleStatus('story', story.id)}
                      className={`text-[10px] uppercase px-1.5 py-0.5 rounded cursor-pointer ${
                        story.status === 'published'
                          ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60'
                          : 'bg-amber-950/60 text-amber-300 border border-amber-800/60'
                      }`}
                    >
                      {story.status}
                    </button>
                  </div>
                  <p className="text-xs text-[#A9A0A5] italic mt-0.5">{story.hook}</p>
                  <div className="text-[#A9A0A5] text-[11px] space-x-2 mt-1">
                    <span>{story.wordCount.toLocaleString()} words</span>
                    <span>·</span>
                    <span>{story.estimatedReadTime} min read</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/short-stories/${story.slug}`}
                    className="p-1 text-[#A9A0A5] hover:text-[#F0E8DC]"
                    title="Read on site"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    onClick={() => {
                      setEditingStory(story);
                      setStoryEditorTab('write');
                      setStoryModalOpen(true);
                    }}
                    className="p-1 text-[#A9A0A5] hover:text-[#F0E8DC]"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setPendingDelete({ type: 'story', id: story.id, title: story.title })}
                    className="p-1 text-[#A9A0A5] hover:text-rose-400 cursor-pointer"
                    title="Delete short story"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================
          TAB 4: POETRY
          ============================================================ */}
      {activeTab === 'poetry' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif-display text-2xl text-[#F0E8DC]">Melancholic Poetry</h2>
            <button
              onClick={() => {
                setEditingPoem({
                  title: '',
                  slug: '',
                  notes: '',
                  stanzas: [''],
                  status: 'published',
                });
                setPoemModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs uppercase tracking-wider font-semibold text-[#111013] bg-[#F0E8DC] hover:bg-white rounded-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Compose Poem</span>
            </button>
          </div>

          <div className="divide-y divide-[#393039] border border-[#393039] rounded-sm">
            {filterBySearchAndStatus(adminDb?.poetry).map((poem) => (
              <div key={poem.id} className="p-4 bg-[#161219] flex items-center justify-between gap-4 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif-display text-lg text-[#F0E8DC]">{poem.title}</h3>
                    <button
                      onClick={() => handleToggleStatus('poem', poem.id)}
                      className={`text-[10px] uppercase px-1.5 py-0.5 rounded cursor-pointer ${
                        poem.status === 'published'
                          ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60'
                          : 'bg-amber-950/60 text-amber-300 border border-amber-800/60'
                      }`}
                    >
                      {poem.status}
                    </button>
                  </div>
                  <p className="text-xs text-[#A9A0A5] italic">{poem.notes}</p>
                  <span className="text-[11px] text-[#A9A0A5]">{poem.stanzas.length} stanzas</span>
                </div>

                <div className="flex items-center gap-2">
                  <Link to={`/poetry/${poem.slug}`} className="p-1 text-[#A9A0A5] hover:text-[#F0E8DC]" title="Read on site">
                    <BookOpen className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    onClick={() => {
                      setEditingPoem(poem);
                      setPoemModalOpen(true);
                    }}
                    className="p-1 text-[#A9A0A5] hover:text-[#F0E8DC]"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setPendingDelete({ type: 'poem', id: poem.id, title: poem.title })}
                    className="p-1 text-[#A9A0A5] hover:text-rose-400 cursor-pointer"
                    title="Delete poem"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================
          TAB 5: JOURNAL
          ============================================================ */}
      {activeTab === 'journal' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif-display text-2xl text-[#F0E8DC]">Author Journal Dispatches</h2>
            <button
              onClick={() => {
                setEditingJournal({
                  title: '',
                  slug: '',
                  excerpt: '',
                  content: '',
                  tags: ['Craft', 'Reflections'],
                  status: 'published',
                });
                setJournalModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs uppercase tracking-wider font-semibold text-[#111013] bg-[#F0E8DC] hover:bg-white rounded-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Journal Post</span>
            </button>
          </div>

          <div className="divide-y divide-[#393039] border border-[#393039] rounded-sm">
            {filterBySearchAndStatus(adminDb?.journal).map((post) => (
              <div key={post.id} className="p-4 bg-[#161219] flex items-center justify-between gap-4 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif-display text-lg text-[#F0E8DC]">{post.title}</h3>
                    <button
                      onClick={() => handleToggleStatus('journal', post.id)}
                      className={`text-[10px] uppercase px-1.5 py-0.5 rounded cursor-pointer ${
                        post.status === 'published'
                          ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60'
                          : 'bg-amber-950/60 text-amber-300 border border-amber-800/60'
                      }`}
                    >
                      {post.status}
                    </button>
                  </div>
                  <p className="text-xs text-[#A9A0A5] line-clamp-1">{post.excerpt}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Link to={`/journal/${post.slug}`} className="p-1 text-[#A9A0A5] hover:text-[#F0E8DC]" title="Read on site">
                    <BookOpen className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    onClick={() => {
                      setEditingJournal(post);
                      setJournalModalOpen(true);
                    }}
                    className="p-1 text-[#A9A0A5] hover:text-[#F0E8DC]"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setPendingDelete({ type: 'journal', id: post.id, title: post.title })}
                    className="p-1 text-[#A9A0A5] hover:text-rose-400 cursor-pointer"
                    title="Delete journal post"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================
          TAB 6: COMMENT MODERATION & REPORTS
          ============================================================ */}
      {activeTab === 'comments' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif-display text-2xl text-[#F0E8DC]">Community Discussion Moderation</h2>
              <p className="text-xs text-[#A9A0A5]">Review discussions, hide spam, and address reader-reported spoilers.</p>
            </div>
            <span className="text-xs text-[#A9A0A5]">Total Comments: {adminDb?.comments.length || 0}</span>
          </div>

          {/* Pending reports alert queue */}
          {reportedComments.length > 0 && (
            <div className="p-4 bg-rose-950/30 border border-rose-900/60 rounded-sm space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase text-rose-300">
                <ShieldAlert className="w-4 h-4" />
                <span>Flagged for Review ({reportedComments.length})</span>
              </div>

              <div className="space-y-3">
                {reportedComments.map((comment) => (
                  <div key={comment.id} className="p-3 bg-[#111013] border border-rose-900/50 rounded-sm text-xs space-y-2">
                    <div className="flex items-center justify-between text-rose-300">
                      <span>Reason: {comment.reportReason}</span>
                      <span>By: {comment.authorName}</span>
                    </div>
                    <p className="text-[#F0E8DC]">{comment.content}</p>
                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#393039]">
                      <button
                        onClick={() => handleModerateComment(comment.id, 'resolve-report')}
                        className="px-2.5 py-1 text-[11px] bg-emerald-950/60 text-emerald-300 border border-emerald-800 rounded"
                      >
                        Dismiss Flag
                      </button>
                      <button
                        onClick={() => handleModerateComment(comment.id, comment.isHidden ? 'unhide' : 'hide')}
                        className="px-2.5 py-1 text-[11px] bg-[#211722] text-[#F0E8DC] border border-[#393039] rounded"
                      >
                        {comment.isHidden ? 'Unhide' : 'Hide from Public'}
                      </button>
                      <button
                        onClick={() => setPendingDelete({ type: 'comment', id: comment.id, title: `Comment by ${comment.authorName}` })}
                        className="px-2.5 py-1 text-[11px] bg-rose-900/60 text-rose-200 border border-rose-800 rounded cursor-pointer hover:bg-rose-800"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All comments */}
          <div className="divide-y divide-[#393039] border border-[#393039] rounded-sm">
            {adminDb?.comments.map((comment) => (
              <div key={comment.id} className="p-4 bg-[#161219] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[#F0E8DC]">{comment.authorName}</span>
                    {comment.isAuthor && (
                      <span className="px-1.5 py-0.5 text-[9px] uppercase font-semibold bg-[#6D293B] text-white rounded">
                        Author
                      </span>
                    )}
                    {comment.isSpoiler && <span className="text-[10px] uppercase text-amber-300">Spoiler</span>}
                    {comment.isHidden && <span className="text-[10px] uppercase text-rose-400">(Hidden)</span>}
                  </div>
                  <p className="text-xs text-[#F0E8DC]/80 line-clamp-2">{comment.content}</p>
                  <div className="text-[11px] text-[#A9A0A5]">
                    Chapter: {comment.chapterId} · {new Date(comment.createdAt).toLocaleString()} · {comment.likesCount} resonates
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleModerateComment(comment.id, comment.isHidden ? 'unhide' : 'hide')}
                    className="p-1.5 text-[#A9A0A5] hover:text-[#F0E8DC]"
                    title={comment.isHidden ? 'Unhide comment' : 'Hide from public'}
                  >
                    {comment.isHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setPendingDelete({ type: 'comment', id: comment.id, title: `Comment by ${comment.authorName}` })}
                    className="p-1.5 text-[#A9A0A5] hover:text-rose-400 cursor-pointer"
                    title="Permanently remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================
          TAB 7: AUTHOR PROFILE & SOCIALS
          ============================================================ */}
      {activeTab === 'profile' && adminDb?.authorProfile && (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await api.updateAuthorProfile(adminDb.authorProfile);
            showNotice('Author profile updated.');
            fetchAdminData();
            refreshContent();
          }}
          className="bg-[#161219] border border-[#393039] p-8 rounded-sm space-y-6 text-xs"
        >
          <div className="border-b border-[#393039] pb-4">
            <h2 className="font-serif-display text-2xl text-[#F0E8DC]">Author Profile & Identity</h2>
            <p className="text-xs text-[#A9A0A5]">Customize pen name, tagline, philosophy, and real social destinations.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block uppercase tracking-wider text-[#A9A0A5] mb-1">Pen Name</label>
              <input
                type="text"
                value={adminDb.authorProfile.penName}
                onChange={(e) =>
                  setAdminDb({
                    ...adminDb,
                    authorProfile: { ...adminDb.authorProfile, penName: e.target.value },
                  })
                }
                className="w-full bg-[#111013] border border-[#393039] p-2.5 text-sm text-[#F0E8DC] rounded-sm"
              />
            </div>

            <div>
              <label className="block uppercase tracking-wider text-[#A9A0A5] mb-1">Tagline</label>
              <input
                type="text"
                value={adminDb.authorProfile.tagline}
                onChange={(e) =>
                  setAdminDb({
                    ...adminDb,
                    authorProfile: { ...adminDb.authorProfile, tagline: e.target.value },
                  })
                }
                className="w-full bg-[#111013] border border-[#393039] p-2.5 text-sm text-[#F0E8DC] rounded-sm"
              />
            </div>
          </div>

          <div>
            <label className="block uppercase tracking-wider text-[#A9A0A5] mb-1">Biography</label>
            <textarea
              rows={3}
              value={adminDb.authorProfile.biography}
              onChange={(e) =>
                setAdminDb({
                  ...adminDb,
                  authorProfile: { ...adminDb.authorProfile, biography: e.target.value },
                })
              }
              className="w-full bg-[#111013] border border-[#393039] p-2.5 text-sm text-[#F0E8DC] rounded-sm"
            />
          </div>

          <div>
            <label className="block uppercase tracking-wider text-[#A9A0A5] mb-1">Writing Philosophy</label>
            <textarea
              rows={3}
              value={adminDb.authorProfile.philosophy}
              onChange={(e) =>
                setAdminDb({
                  ...adminDb,
                  authorProfile: { ...adminDb.authorProfile, philosophy: e.target.value },
                })
              }
              className="w-full bg-[#111013] border border-[#393039] p-2.5 text-sm text-[#F0E8DC] rounded-sm"
            />
          </div>

          <div>
            <label className="block uppercase tracking-wider text-[#A9A0A5] mb-1">The Journey</label>
            <textarea
              rows={3}
              value={adminDb.authorProfile.journey}
              onChange={(e) =>
                setAdminDb({
                  ...adminDb,
                  authorProfile: { ...adminDb.authorProfile, journey: e.target.value },
                })
              }
              className="w-full bg-[#111013] border border-[#393039] p-2.5 text-sm text-[#F0E8DC] rounded-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#393039]">
            <div>
              <label className="block uppercase tracking-wider text-[#A9A0A5] mb-1">Substack URL</label>
              <input
                type="text"
                value={adminDb.authorProfile.socials.substack || ''}
                onChange={(e) =>
                  setAdminDb({
                    ...adminDb,
                    authorProfile: {
                      ...adminDb.authorProfile,
                      socials: { ...adminDb.authorProfile.socials, substack: e.target.value },
                    },
                  })
                }
                className="w-full bg-[#111013] border border-[#393039] p-2 text-xs text-[#F0E8DC] rounded-sm"
              />
            </div>

            <div>
              <label className="block uppercase tracking-wider text-[#A9A0A5] mb-1">Instagram URL</label>
              <input
                type="text"
                value={adminDb.authorProfile.socials.instagram || ''}
                onChange={(e) =>
                  setAdminDb({
                    ...adminDb,
                    authorProfile: {
                      ...adminDb.authorProfile,
                      socials: { ...adminDb.authorProfile.socials, instagram: e.target.value },
                    },
                  })
                }
                className="w-full bg-[#111013] border border-[#393039] p-2 text-xs text-[#F0E8DC] rounded-sm"
              />
            </div>

            <div>
              <label className="block uppercase tracking-wider text-[#A9A0A5] mb-1">Goodreads URL</label>
              <input
                type="text"
                value={adminDb.authorProfile.socials.goodreads || ''}
                onChange={(e) =>
                  setAdminDb({
                    ...adminDb,
                    authorProfile: {
                      ...adminDb.authorProfile,
                      socials: { ...adminDb.authorProfile.socials, goodreads: e.target.value },
                    },
                  })
                }
                className="w-full bg-[#111013] border border-[#393039] p-2 text-xs text-[#F0E8DC] rounded-sm"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs uppercase tracking-wider font-semibold text-[#111013] bg-[#F0E8DC] hover:bg-white rounded-sm cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Author Profile</span>
            </button>
          </div>
        </form>
      )}

      {/* ============================================================
          TAB 8: SECURITY & PASSWORD MANAGEMENT
          ============================================================ */}
      {activeTab === 'security' && (
        <div className="max-w-2xl bg-[#161219] border border-[#393039] p-8 rounded-sm space-y-6 text-xs">
          <div className="border-b border-[#393039] pb-4">
            <div className="flex items-center gap-2 text-[#6D293B] mb-1">
              <Key className="w-4 h-4" />
              <span className="uppercase tracking-widest font-semibold text-[11px]">Security Sanctuary</span>
            </div>
            <h2 className="font-serif-display text-2xl text-[#F0E8DC]">Change Master Passphrase</h2>
            <p className="text-xs text-[#A9A0A5]">
              Update the private passphrase required to unlock the Author Publishing Suite.
            </p>
          </div>

          {passChangeSuccess && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-800 text-emerald-300 rounded text-xs flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>Passphrase updated successfully. Please note it down securely.</span>
            </div>
          )}

          {passChangeError && (
            <div className="p-3 bg-rose-950/40 border border-rose-800 text-rose-300 rounded text-xs">
              {passChangeError}
            </div>
          )}

          <form onSubmit={handleChangePassphrase} className="space-y-4">
            <div>
              <label className="block uppercase tracking-wider text-[#A9A0A5] mb-1">
                Current Passphrase
              </label>
              <input
                type="password"
                required
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                placeholder="Enter current master passphrase"
                className="w-full bg-[#111013] border border-[#393039] p-2.5 text-sm text-[#F0E8DC] rounded-sm focus:outline-none focus:border-[#6D293B]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block uppercase tracking-wider text-[#A9A0A5] mb-1">
                  New Passphrase
                </label>
                <input
                  type="password"
                  required
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="At least 4 characters"
                  className="w-full bg-[#111013] border border-[#393039] p-2.5 text-sm text-[#F0E8DC] rounded-sm focus:outline-none focus:border-[#6D293B]"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider text-[#A9A0A5] mb-1">
                  Confirm New Passphrase
                </label>
                <input
                  type="password"
                  required
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  placeholder="Re-enter new passphrase"
                  className="w-full bg-[#111013] border border-[#393039] p-2.5 text-sm text-[#F0E8DC] rounded-sm focus:outline-none focus:border-[#6D293B]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs uppercase tracking-wider font-semibold text-[#111013] bg-[#F0E8DC] hover:bg-white rounded-sm cursor-pointer"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Update Passphrase</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ============================================================
          TAB 9: BACKUP & RESTORE CENTER
          ============================================================ */}
      {activeTab === 'backup' && (
        <div className="space-y-8">
          <div className="bg-[#161219] border border-[#393039] p-6 rounded-sm space-y-4">
            <h2 className="font-serif-display text-2xl text-[#F0E8DC]">Archive Backup & Data Ownership</h2>
            <p className="text-xs text-[#A9A0A5] leading-relaxed">
              You own 100% of your stories, chapters, poems, essays, and reader comments. You can export a full structured JSON archive at any time with a single click, or restore from a previously saved backup file.
            </p>

            <div className="pt-2">
              <button
                onClick={handleExportBackup}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs uppercase tracking-wider font-semibold text-[#111013] bg-[#F0E8DC] hover:bg-white rounded-sm cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Moonfall Backup (.json)</span>
              </button>
            </div>
          </div>

          <div className="bg-[#161219] border border-[#393039] p-6 rounded-sm space-y-4 text-xs">
            <h3 className="font-serif-display text-xl text-[#F0E8DC]">Restore Archive</h3>
            <p className="text-[#A9A0A5]">
              Upload a previously exported backup file or paste its JSON content below to restore all novels, chapters, and comments.
            </p>

            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleBackupFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs bg-[#211722] border border-[#393039] hover:border-[#6D293B] text-[#F0E8DC] rounded-sm cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Choose .json File from Computer</span>
              </button>
              {restoreJson && <span className="text-xs text-emerald-400">File loaded ready for restore!</span>}
            </div>

            <textarea
              rows={6}
              value={restoreJson}
              onChange={(e) => setRestoreJson(e.target.value)}
              placeholder="Or paste JSON archive data here..."
              className="w-full bg-[#111013] border border-[#393039] p-3 text-xs text-[#F0E8DC] font-mono rounded-sm"
            />

            <div className="flex justify-end">
              <button
                onClick={handleRestoreBackup}
                disabled={!restoreJson.trim()}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs uppercase tracking-wider font-semibold text-white bg-[#6D293B] hover:bg-[#853248] disabled:opacity-50 rounded-sm cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Restore Archive from JSON</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL: NOVEL DETAILS & COVER ARTWORK
          ============================================================ */}
      {novelModalOpen && editingNovel && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#18131a] border border-[#393039] p-6 max-w-2xl w-full rounded-sm text-[#F0E8DC] my-8 shadow-2xl">
            <h3 className="font-serif-display text-2xl text-[#F0E8DC] mb-4">
              {editingNovel.id ? 'Edit Novel Details' : 'Create New Novel'}
            </h3>

            <form onSubmit={handleSaveNovel} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase tracking-wider text-[#A9A0A5] mb-1">Novel Title</label>
                  <input
                    type="text"
                    required
                    value={editingNovel.title || ''}
                    onChange={(e) => {
                      const title = e.target.value;
                      setEditingNovel({
                        ...editingNovel,
                        title,
                        slug: editingNovel.id
                          ? editingNovel.slug
                          : title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                      });
                    }}
                    className="w-full bg-[#111013] border border-[#393039] p-2 text-sm text-[#F0E8DC] rounded-sm"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider text-[#A9A0A5] mb-1">Slug URL</label>
                  <input
                    type="text"
                    required
                    value={editingNovel.slug || ''}
                    onChange={(e) => setEditingNovel({ ...editingNovel, slug: e.target.value })}
                    className="w-full bg-[#111013] border border-[#393039] p-2 text-sm text-[#F0E8DC] rounded-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block uppercase tracking-wider text-[#A9A0A5] mb-1">One-line Hook</label>
                <input
                  type="text"
                  required
                  value={editingNovel.hook || ''}
                  onChange={(e) => setEditingNovel({ ...editingNovel, hook: e.target.value })}
                  placeholder="e.g. A lonely keeper, a bell that strikes only for the dead..."
                  className="w-full bg-[#111013] border border-[#393039] p-2 text-sm text-[#F0E8DC] rounded-sm"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider text-[#A9A0A5] mb-1">Synopsis</label>
                <textarea
                  rows={4}
                  required
                  value={editingNovel.synopsis || ''}
                  onChange={(e) => setEditingNovel({ ...editingNovel, synopsis: e.target.value })}
                  className="w-full bg-[#111013] border border-[#393039] p-2.5 text-sm text-[#F0E8DC] rounded-sm font-sans"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase tracking-wider text-[#A9A0A5] mb-1">Genre</label>
                  <input
                    type="text"
                    value={editingNovel.genre || ''}
                    onChange={(e) => setEditingNovel({ ...editingNovel, genre: e.target.value })}
                    className="w-full bg-[#111013] border border-[#393039] p-2 text-xs text-[#F0E8DC] rounded-sm"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider text-[#A9A0A5] mb-1">Publication Status</label>
                  <select
                    value={editingNovel.status || 'draft'}
                    onChange={(e) =>
                      setEditingNovel({ ...editingNovel, status: e.target.value as any })
                    }
                    className="w-full bg-[#111013] border border-[#393039] p-2 text-xs text-[#F0E8DC] rounded-sm"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft (Private)</option>
                  </select>
                </div>
              </div>

              {/* Cover Artwork Selector & Uploader */}
              <div className="space-y-2 pt-2 border-t border-[#393039]">
                <label className="block uppercase tracking-wider text-[#A9A0A5]">Cover Artwork</label>
                
                {/* Preset Covers Selector */}
                <div className="grid grid-cols-5 gap-2">
                  {PRESET_COVERS.map((preset) => (
                    <button
                      key={preset.path}
                      type="button"
                      onClick={() => setEditingNovel({ ...editingNovel, coverImage: preset.path })}
                      className={`relative aspect-[3/4] rounded overflow-hidden border transition-all ${
                        editingNovel.coverImage === preset.path
                          ? 'border-[#6D293B] ring-2 ring-[#6D293B]'
                          : 'border-[#393039] opacity-70 hover:opacity-100'
                      }`}
                      title={preset.name}
                    >
                      <img src={preset.path} alt={preset.name} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>

                {/* Upload or Custom Path */}
                <div className="flex items-center gap-3 pt-2">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#211722] border border-[#393039] hover:border-[#6D293B] text-[#F0E8DC] rounded-sm cursor-pointer">
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>{uploadingImage ? 'Uploading...' : 'Upload Image from Computer'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'novel')}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </label>
                  <input
                    type="text"
                    value={editingNovel.coverImage || ''}
                    onChange={(e) => setEditingNovel({ ...editingNovel, coverImage: e.target.value })}
                    placeholder="or enter custom image URL"
                    className="flex-1 bg-[#111013] border border-[#393039] p-1.5 text-xs text-[#F0E8DC] rounded-sm font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#393039]">
                <button
                  type="button"
                  onClick={() => {
                    setNovelModalOpen(false);
                    setEditingNovel(null);
                  }}
                  className="px-4 py-2 text-xs text-[#A9A0A5] hover:text-[#F0E8DC]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs uppercase tracking-wider font-semibold text-[#111013] bg-[#F0E8DC] hover:bg-white rounded-sm cursor-pointer"
                >
                  Save Novel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL: CHAPTER WRITER & LIVE READER PREVIEW
          ============================================================ */}
      {chapterModalOpen && editingChapter && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#18131a] border border-[#393039] p-6 max-w-4xl w-full rounded-sm text-[#F0E8DC] my-6 shadow-2xl">
            {/* Header with Mode Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#393039]">
              <div>
                <h3 className="font-serif-display text-2xl text-[#F0E8DC]">
                  {editingChapter.chapter.id ? 'Edit Chapter Manuscript' : 'Write New Chapter'}
                </h3>
                <span className="text-[11px] text-[#A9A0A5]">
                  Novel: {adminDb?.novels.find((n) => n.id === editingChapter.novelId)?.title}
                </span>
              </div>

              {/* Write vs Preview Toggle */}
              <div className="flex items-center gap-1 bg-[#111013] p-1 rounded border border-[#393039]">
                <button
                  type="button"
                  onClick={() => setChapterEditorTab('write')}
                  className={`px-3 py-1 text-xs rounded transition-colors ${
                    chapterEditorTab === 'write'
                      ? 'bg-[#6D293B] text-white font-medium'
                      : 'text-[#A9A0A5] hover:text-[#F0E8DC]'
                  }`}
                >
                  Write Manuscript
                </button>
                <button
                  type="button"
                  onClick={() => setChapterEditorTab('preview')}
                  className={`px-3 py-1 text-xs rounded transition-colors ${
                    chapterEditorTab === 'preview'
                      ? 'bg-[#6D293B] text-white font-medium'
                      : 'text-[#A9A0A5] hover:text-[#F0E8DC]'
                  }`}
                >
                  Live Reader Preview
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveChapter} className="space-y-4 text-xs">
              {chapterEditorTab === 'write' ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block uppercase tracking-wider text-[#A9A0A5] mb-1">Chapter Title</label>
                      <input
                        type="text"
                        required
                        value={editingChapter.chapter.title || ''}
                        onChange={(e) => {
                          const title = e.target.value;
                          setEditingChapter({
                            ...editingChapter,
                            chapter: {
                              ...editingChapter.chapter,
                              title,
                              slug: editingChapter.chapter.id
                                ? editingChapter.chapter.slug
                                : title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                            },
                          });
                        }}
                        placeholder="e.g. The Bell Without a Tongue"
                        className="w-full bg-[#111013] border border-[#393039] p-2 text-sm text-[#F0E8DC] rounded-sm"
                      />
                    </div>

                    <div>
                      <label className="block uppercase tracking-wider text-[#A9A0A5] mb-1">Publication Status</label>
                      <select
                        value={editingChapter.chapter.status || 'published'}
                        onChange={(e) =>
                          setEditingChapter({
                            ...editingChapter,
                            chapter: { ...editingChapter.chapter, status: e.target.value as any },
                          })
                        }
                        className="w-full bg-[#111013] border border-[#393039] p-2 text-xs text-[#F0E8DC] rounded-sm"
                      >
                        <option value="published">Published</option>
                        <option value="draft">Draft (Hidden from Public)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block uppercase tracking-wider text-[#A9A0A5] mb-1">Epigraph (Optional)</label>
                    <input
                      type="text"
                      value={editingChapter.chapter.epigraph || ''}
                      onChange={(e) =>
                        setEditingChapter({
                          ...editingChapter,
                          chapter: { ...editingChapter.chapter, epigraph: e.target.value },
                        })
                      }
                      placeholder="“Time does not advance by gears; it is pulled forward by what we refuse to mourn.”"
                      className="w-full bg-[#111013] border border-[#393039] p-2 text-xs text-[#F0E8DC] rounded-sm italic"
                    />
                  </div>

                  {/* Formatting Toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 p-1.5 bg-[#141016] border border-[#393039] rounded-sm">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          insertFormatting(
                            '**',
                            '**',
                            editingChapter.chapter.content || '',
                            (val) =>
                              setEditingChapter({
                                ...editingChapter,
                                chapter: { ...editingChapter.chapter, content: val },
                              }),
                            'bold emphasis'
                          )
                        }
                        className="p-1.5 text-[#A9A0A5] hover:text-[#F0E8DC] rounded hover:bg-[#211722]"
                        title="Bold emphasis"
                      >
                        <Bold className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          insertFormatting(
                            '*',
                            '*',
                            editingChapter.chapter.content || '',
                            (val) =>
                              setEditingChapter({
                                ...editingChapter,
                                chapter: { ...editingChapter.chapter, content: val },
                              }),
                            'italic whisper'
                          )
                        }
                        className="p-1.5 text-[#A9A0A5] hover:text-[#F0E8DC] rounded hover:bg-[#211722]"
                        title="Italic whisper"
                      >
                        <Italic className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          insertFormatting(
                            '“',
                            '”',
                            editingChapter.chapter.content || '',
                            (val) =>
                              setEditingChapter({
                                ...editingChapter,
                                chapter: { ...editingChapter.chapter, content: val },
                              }),
                            'Spoken dialogue'
                          )
                        }
                        className="p-1.5 text-[#A9A0A5] hover:text-[#F0E8DC] rounded hover:bg-[#211722]"
                        title="Dialogue quotes"
                      >
                        <Quote className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          insertFormatting(
                            '\n\n* * *\n\n',
                            '',
                            editingChapter.chapter.content || '',
                            (val) =>
                              setEditingChapter({
                                ...editingChapter,
                                chapter: { ...editingChapter.chapter, content: val },
                              }),
                            ''
                          )
                        }
                        className="p-1.5 text-[#A9A0A5] hover:text-[#F0E8DC] rounded hover:bg-[#211722] text-xs font-mono"
                        title="Scene break divider"
                      >
                        * * *
                      </button>
                    </div>

                    <div className="text-[11px] text-[#A9A0A5] tabular-nums">
                      {(editingChapter.chapter.content || '').trim().split(/\s+/).filter(Boolean).length} words · ~
                      {Math.max(
                        1,
                        Math.ceil(
                          (editingChapter.chapter.content || '').trim().split(/\s+/).filter(Boolean).length / 220
                        )
                      )}{' '}
                      min read
                    </div>
                  </div>

                  <div>
                    <textarea
                      rows={12}
                      required
                      value={editingChapter.chapter.content || ''}
                      onChange={(e) =>
                        setEditingChapter({
                          ...editingChapter,
                          chapter: { ...editingChapter.chapter, content: e.target.value },
                        })
                      }
                      placeholder="Begin writing chapter prose here... (separate paragraphs with blank lines)"
                      className="w-full bg-[#111013] border border-[#393039] p-3.5 text-sm text-[#F0E8DC] rounded-sm font-serif leading-relaxed"
                    />
                  </div>
                </>
              ) : (
                /* LIVE READER PREVIEW */
                <div className="space-y-4">
                  {/* Preview surface picker */}
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-[#393039]">
                    <span className="text-[#A9A0A5]">Previewing how readers will see this chapter:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-[#A9A0A5]">Theme:</span>
                      {(['obsidian', 'plum', 'warm-parchment'] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setChapterPreviewTheme(t)}
                          className={`px-2 py-0.5 rounded text-[11px] ${
                            chapterPreviewTheme === t ? 'bg-[#6D293B] text-white' : 'text-[#A9A0A5] hover:text-white'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div
                    className={`p-8 rounded-sm max-h-[480px] overflow-y-auto ${
                      chapterPreviewTheme === 'plum'
                        ? 'bg-[#1d141e] text-[#f2e9dc]'
                        : chapterPreviewTheme === 'warm-parchment'
                        ? 'bg-[#f7f1e7] text-[#241d20]'
                        : 'bg-[#111013] text-[#F0E8DC]'
                    }`}
                  >
                    <div className="max-w-2xl mx-auto space-y-6">
                      <div className="text-center space-y-2 pb-6 border-b border-[#393039]/40">
                        <span className="text-xs uppercase tracking-widest text-[#6D293B]">
                          Chapter {editingChapter.chapter.chapterNumber || 1}
                        </span>
                        <h2 className="font-serif-display text-3xl font-medium">
                          {editingChapter.chapter.title || 'Untitled Chapter'}
                        </h2>
                        {editingChapter.chapter.epigraph && (
                          <p className="font-serif-display text-sm italic opacity-75">
                            {editingChapter.chapter.epigraph}
                          </p>
                        )}
                      </div>

                      <div className="font-prose-reading space-y-4 text-base leading-relaxed">
                        {(editingChapter.chapter.content || '')
                          .split('\n\n')
                          .filter(Boolean)
                          .map((p, idx) => {
                            if (p.trim() === '* * *' || p.trim() === '***') {
                              return (
                                <div key={idx} className="py-4 text-center text-[#6D293B] text-sm">
                                  ☾ · · · ☽
                                </div>
                              );
                            }
                            return (
                              <p
                                key={idx}
                                className={
                                  idx === 0
                                    ? 'first-letter:text-4xl first-letter:font-serif first-letter:font-bold first-letter:float-left first-letter:mr-2.5 first-letter:text-[#6D293B]'
                                    : ''
                                }
                              >
                                {p}
                              </p>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#393039]">
                <button
                  type="button"
                  onClick={() => {
                    setChapterModalOpen(false);
                    setEditingChapter(null);
                  }}
                  className="px-4 py-2 text-xs text-[#A9A0A5] hover:text-[#F0E8DC]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-xs uppercase tracking-wider font-semibold text-[#111013] bg-[#F0E8DC] hover:bg-white rounded-sm cursor-pointer"
                >
                  Save & Publish Chapter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL: SHORT STORY EDITOR
          ============================================================ */}
      {storyModalOpen && editingStory && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#18131a] border border-[#393039] p-6 max-w-3xl w-full rounded-sm text-[#F0E8DC] my-6 shadow-2xl">
            <h3 className="font-serif-display text-2xl text-[#F0E8DC] mb-4">
              {editingStory.id ? 'Edit Story' : 'New Short Story'}
            </h3>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!editingStory.title) return;
                if (editingStory.id) {
                  await api.updateShortStory(editingStory.id, editingStory);
                } else {
                  await api.createShortStory(editingStory);
                }
                setStoryModalOpen(false);
                setEditingStory(null);
                fetchAdminData();
                refreshContent();
                showNotice('Short story saved.');
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase tracking-wider text-[#A9A0A5] mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={editingStory.title || ''}
                    onChange={(e) => setEditingStory({ ...editingStory, title: e.target.value })}
                    className="w-full bg-[#111013] border border-[#393039] p-2 text-sm text-[#F0E8DC] rounded-sm"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider text-[#A9A0A5] mb-1">Status</label>
                  <select
                    value={editingStory.status || 'published'}
                    onChange={(e) => setEditingStory({ ...editingStory, status: e.target.value as any })}
                    className="w-full bg-[#111013] border border-[#393039] p-2 text-xs text-[#F0E8DC] rounded-sm"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft (Private)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block uppercase tracking-wider text-[#A9A0A5] mb-1">One-line Hook</label>
                <input
                  type="text"
                  required
                  value={editingStory.hook || ''}
                  onChange={(e) => setEditingStory({ ...editingStory, hook: e.target.value })}
                  className="w-full bg-[#111013] border border-[#393039] p-2 text-xs text-[#F0E8DC] rounded-sm"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider text-[#A9A0A5] mb-1">Prose Content</label>
                <textarea
                  rows={10}
                  required
                  value={editingStory.content || ''}
                  onChange={(e) => setEditingStory({ ...editingStory, content: e.target.value })}
                  className="w-full bg-[#111013] border border-[#393039] p-3 text-sm text-[#F0E8DC] rounded-sm font-serif leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#393039]">
                <button
                  type="button"
                  onClick={() => setStoryModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-[#A9A0A5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs uppercase tracking-wider font-semibold text-[#111013] bg-[#F0E8DC] rounded-sm cursor-pointer"
                >
                  Save Story
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL: POETRY EDITOR
          ============================================================ */}
      {poemModalOpen && editingPoem && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="bg-[#18131a] border border-[#393039] p-6 max-w-xl w-full rounded-sm text-[#F0E8DC] shadow-2xl">
            <h3 className="font-serif-display text-2xl text-[#F0E8DC] mb-4">
              {editingPoem.id ? 'Edit Poem' : 'Compose Poem'}
            </h3>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!editingPoem.title) return;
                if (editingPoem.id) {
                  await api.updatePoem(editingPoem.id, editingPoem);
                } else {
                  await api.createPoem(editingPoem);
                }
                setPoemModalOpen(false);
                setEditingPoem(null);
                fetchAdminData();
                refreshContent();
                showNotice('Poem saved.');
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block uppercase tracking-wider text-[#A9A0A5] mb-1">Poem Title</label>
                <input
                  type="text"
                  required
                  value={editingPoem.title || ''}
                  onChange={(e) => setEditingPoem({ ...editingPoem, title: e.target.value })}
                  className="w-full bg-[#111013] border border-[#393039] p-2 text-sm text-[#F0E8DC] rounded-sm"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider text-[#A9A0A5] mb-1">Author Notes</label>
                <input
                  type="text"
                  value={editingPoem.notes || ''}
                  onChange={(e) => setEditingPoem({ ...editingPoem, notes: e.target.value })}
                  className="w-full bg-[#111013] border border-[#393039] p-2 text-xs text-[#F0E8DC] rounded-sm"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider text-[#A9A0A5] mb-1">
                  Stanzas (Separate stanzas with double enter)
                </label>
                <textarea
                  rows={8}
                  required
                  value={(editingPoem.stanzas || []).join('\n\n')}
                  onChange={(e) =>
                    setEditingPoem({
                      ...editingPoem,
                      stanzas: e.target.value.split('\n\n').filter(Boolean),
                    })
                  }
                  className="w-full bg-[#111013] border border-[#393039] p-3 text-sm text-[#F0E8DC] rounded-sm font-serif italic"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#393039]">
                <button
                  type="button"
                  onClick={() => setPoemModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-[#A9A0A5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs uppercase tracking-wider font-semibold text-[#111013] bg-[#F0E8DC] rounded-sm cursor-pointer"
                >
                  Save Poem
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL: JOURNAL POST EDITOR
          ============================================================ */}
      {journalModalOpen && editingJournal && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="bg-[#18131a] border border-[#393039] p-6 max-w-2xl w-full rounded-sm text-[#F0E8DC] shadow-2xl">
            <h3 className="font-serif-display text-2xl text-[#F0E8DC] mb-4">
              {editingJournal.id ? 'Edit Journal Entry' : 'New Journal Entry'}
            </h3>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!editingJournal.title) return;
                if (editingJournal.id) {
                  await api.updateJournalPost(editingJournal.id, editingJournal);
                } else {
                  await api.createJournalPost(editingJournal);
                }
                setJournalModalOpen(false);
                setEditingJournal(null);
                fetchAdminData();
                refreshContent();
                showNotice('Journal post saved.');
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block uppercase tracking-wider text-[#A9A0A5] mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={editingJournal.title || ''}
                  onChange={(e) => setEditingJournal({ ...editingJournal, title: e.target.value })}
                  className="w-full bg-[#111013] border border-[#393039] p-2 text-sm text-[#F0E8DC] rounded-sm"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider text-[#A9A0A5] mb-1">Excerpt</label>
                <input
                  type="text"
                  required
                  value={editingJournal.excerpt || ''}
                  onChange={(e) => setEditingJournal({ ...editingJournal, excerpt: e.target.value })}
                  className="w-full bg-[#111013] border border-[#393039] p-2 text-xs text-[#F0E8DC] rounded-sm"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider text-[#A9A0A5] mb-1">Reflection Content</label>
                <textarea
                  rows={8}
                  required
                  value={editingJournal.content || ''}
                  onChange={(e) => setEditingJournal({ ...editingJournal, content: e.target.value })}
                  className="w-full bg-[#111013] border border-[#393039] p-3 text-sm text-[#F0E8DC] rounded-sm font-serif leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#393039]">
                <button
                  type="button"
                  onClick={() => setJournalModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-[#A9A0A5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs uppercase tracking-wider font-semibold text-[#111013] bg-[#F0E8DC] rounded-sm cursor-pointer"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL: IN-APP DELETE CONFIRMATION DIALOG
          ============================================================ */}
      {pendingDelete && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#18131a] border border-[#6D293B]/80 p-6 max-w-md w-full rounded-sm text-[#F0E8DC] shadow-2xl space-y-5">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-full bg-rose-950/70 border border-rose-900/80 flex items-center justify-center shrink-0 text-rose-400">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif-display text-xl text-[#F0E8DC]">
                  Confirm Deletion
                </h3>
                <p className="text-xs text-[#A9A0A5] leading-relaxed">
                  Are you sure you want to delete{' '}
                  <span className="text-[#F0E8DC] font-medium italic">
                    "{pendingDelete.title}"
                  </span>
                  ?
                </p>
                {pendingDelete.type === 'novel' && (
                  <p className="text-[11px] text-rose-300/90 bg-rose-950/40 border border-rose-900/50 p-2 rounded-xs mt-2">
                    Warning: Deleting this novel will permanently remove all of its chapters as well.
                  </p>
                )}
                <p className="text-[11px] text-[#A9A0A5]/80 mt-1">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#393039]">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setPendingDelete(null)}
                className="px-3 py-1.5 text-xs text-[#A9A0A5] hover:text-[#F0E8DC] transition-colors rounded cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={executeDelete}
                className="px-4 py-2 text-xs uppercase tracking-wider font-semibold text-white bg-rose-700 hover:bg-rose-600 rounded-sm cursor-pointer transition-colors shadow flex items-center gap-1.5 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Permanently</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
