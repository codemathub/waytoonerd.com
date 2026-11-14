import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SiteProvider, SiteContext } from './context/SiteContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import TopBar from './components/layout/TopBar';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

import HomePage from './pages/HomePage';
import PostDetailPage from './pages/PostDetailPage';
import CategoryPage from './pages/CategoryPage';
import ContactPage from './pages/ContactPage';
import StaticPage from './pages/StaticPage';

import AdminLogin from './admin/AdminLogin';
import Dashboard from './admin/Dashboard';
import ScrollToTop from './components/common/ScrollToTop';

const MainLayout = ({ children }) => {
  const { settings, categories, recentPosts } = useContext(SiteContext);
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#fbfbfb] dark:bg-[#0d0d0d] transition-colors duration-200">
      <div>
        <Header settings={settings} categories={categories} />
        <main>{children}</main>
      </div>
      <Footer settings={settings} categories={categories} recentPosts={recentPosts} />
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SiteProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<Dashboard />} />

              {/* Public Website Routes */}
              <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
              <Route path="/category/:slug" element={<MainLayout><CategoryPage /></MainLayout>} />
              <Route path="/contact-us" element={<MainLayout><ContactPage /></MainLayout>} />
              <Route path="/about-us" element={<MainLayout><StaticPage defaultSlug="about-us" /></MainLayout>} />
              <Route path="/privacy-policy" element={<MainLayout><StaticPage defaultSlug="privacy-policy" /></MainLayout>} />
              <Route path="/disclaimer" element={<MainLayout><StaticPage defaultSlug="disclaimer" /></MainLayout>} />

              {/* Single Article Slug Route (matches exact WordPress URL structure) */}
              <Route path="/:slug" element={<MainLayout><PostDetailPage /></MainLayout>} />
            </Routes>
          </BrowserRouter>
        </SiteProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
