import React, { createContext, useState, useEffect } from 'react';
import api from '../api/client';

export const SiteContext = createContext();

export const SiteProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    siteName: 'Waytoonerd',
    tagline: 'Waytoonerd',
    contactPhone: '+919953609096',
    contactEmail: 'info@waytoonerd.com',
    socialLinks: {},
    menus: { main: [], top: [], footer: [] }
  });
  const [categories, setCategories] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [settingsRes, catsRes, recentRes] = await Promise.all([
          api.get('/settings').catch(() => ({ data: {} })),
          api.get('/categories').catch(() => ({ data: [] })),
          api.get('/posts/recent?limit=5').catch(() => ({ data: [] }))
        ]);
        if (settingsRes.data) setSettings(prev => ({ ...prev, ...settingsRes.data }));
        if (catsRes.data) setCategories(catsRes.data);
        if (recentRes.data) setRecentPosts(recentRes.data);
      } catch (err) {
        console.error('Error loading site global data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <SiteContext.Provider value={{ settings, categories, recentPosts, loading }}>
      {children}
    </SiteContext.Provider>
  );
};

