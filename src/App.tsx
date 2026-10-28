import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ContentProvider } from './context/ContentContext.js';
import { Header } from './components/Header.js';
import { Footer } from './components/Footer.js';
import { HomePage } from './pages/HomePage.js';
import { NovelsIndexPage } from './pages/NovelsIndexPage.js';
import { NovelDetailPage } from './pages/NovelDetailPage.js';
import { ChapterPage } from './pages/ChapterPage.js';
import { ShortStoriesPage } from './pages/ShortStoriesPage.js';
import { ShortStoryDetailPage } from './pages/ShortStoryDetailPage.js';
import { PoetryPage } from './pages/PoetryPage.js';
import { PoemDetailPage } from './pages/PoemDetailPage.js';
import { JournalPage } from './pages/JournalPage.js';
import { JournalDetailPage } from './pages/JournalDetailPage.js';
import { AboutPage } from './pages/AboutPage.js';
import { ConnectPage } from './pages/ConnectPage.js';
import { AdminDashboardPage } from './pages/AdminDashboardPage.js';

export default function App() {
  return (
    <BrowserRouter>
      <ContentProvider>
        <div className="min-h-screen flex flex-col bg-[#111013] text-[#F0E8DC] font-sans">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/novels" element={<NovelsIndexPage />} />
              <Route path="/novels/:slug" element={<NovelDetailPage />} />
              <Route path="/novels/:slug/chapters/:chapterSlug" element={<ChapterPage />} />
              <Route path="/short-stories" element={<ShortStoriesPage />} />
              <Route path="/short-stories/:slug" element={<ShortStoryDetailPage />} />
              <Route path="/poetry" element={<PoetryPage />} />
              <Route path="/poetry/:slug" element={<PoemDetailPage />} />
              <Route path="/journal" element={<JournalPage />} />
              <Route path="/journal/:slug" element={<JournalDetailPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/connect" element={<ConnectPage />} />
              <Route path="/admin" element={<AdminDashboardPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </ContentProvider>
    </BrowserRouter>
  );
}
