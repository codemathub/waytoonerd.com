import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api, { getImageUrl } from '../api/client';
import HeroBannerGrid from '../components/home/HeroBannerGrid';
import Sidebar from '../components/layout/Sidebar';

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const search = searchParams.get('search');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [postsRes, catsRes, recentRes] = await Promise.all([
          api.get(`/posts?limit=100${search ? `&search=${encodeURIComponent(search)}` : ''}`),
          api.get('/categories'),
          api.get('/posts/recent?limit=5')
        ]);
        setPosts(postsRes.data.posts || []);
        setCategories(catsRes.data || []);
        setRecentPosts(recentRes.data || []);
      } catch (err) {
        console.error('Failed to load home data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [search]);

  // Group posts dynamically by active categories from the database
  const getCategoryPosts = (slug) => {
    return posts.filter(p => {
      if (!p.categories) return false;
      return p.categories.some(c => {
        if (typeof c === 'object' && c !== null) {
          return c.slug === slug || c.name?.toLowerCase() === slug.toLowerCase();
        }
        return c === slug;
      }) || p.categoryNames?.some(cn => cn.toLowerCase() === slug.toLowerCase() || (slug === 'latest-tech-news' && cn.toLowerCase().includes('tech')));
    }).slice(0, 4);
  };

  const activeSections = [
    { name: 'Tech News', slug: 'latest-tech-news', icon: '/uploads/2019/07/news.png' },
    { name: 'Android', slug: 'latest-android-updates', icon: '/uploads/2019/07/android.png' },
    { name: 'iPhone', slug: 'iphone', icon: '/uploads/2019/07/apple-icon-1.png' },
    { name: 'iOS', slug: 'latest-ios-updates', icon: '/uploads/2019/07/apple-icon-1.png' },
    { name: 'Windows OS', slug: 'windows-os', icon: '/uploads/2019/07/windows.png' },
    { name: 'Mac OS', slug: 'mac-os', icon: '/uploads/2019/07/mac-pc.png' }
  ];

  if (loading) {
    return <div className="text-center py-20 text-gray-500 font-medium">Loading WayTooNerd...</div>;
  }

  return (
    <div className="max-w-[98%] mx-auto px-4 py-6">
      {/* Search Header if search active */}
      {search && (
        <div className="mb-6 p-4 bg-white rounded border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">
            Search results for: <span className="text-[#fd4f00]">"{search}"</span>
          </h2>
        </div>
      )}

      {/* Hero Banner Grid (Dynamically rendered with top 5 real articles) */}
      {!search && <HeroBannerGrid posts={posts} />}

      {/* Main Content + Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main 9 Cols */}
        <div className="lg:col-span-9 space-y-12">
          {search ? (
            /* Search results list */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {posts.map(post => (
                <div key={post._id} className="bg-white rounded border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition">
                  {post.featuredImage?.url && (
                    <img
                      src={getImageUrl(post.featuredImage.url)}
                      alt={post.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <span className="text-[10px] font-bold text-[#fd4f00] uppercase">
                      {post.categoryNames?.[0] || 'Tech'}
                    </span>
                    <h3 className="text-sm font-bold text-gray-800 mt-1 mb-2 line-clamp-2">
                      <Link to={`/${post.slug}`} className="hover:text-[#fd4f00]">
                        {post.title}
                      </Link>
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2">{post.excerpt}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Standard Flatsome Home Categories */
            activeSections.map(section => {
              const secPosts = getCategoryPosts(section.slug);
              if (secPosts.length === 0) return null;

              return (
                <div key={section.slug} className="space-y-4">
                  {/* Category Title Header */}
                  <div className="flex items-center space-x-2 border-b-2 border-[#fd4f00] pb-2">
                    <img src={getImageUrl(section.icon)} alt="" className="w-5 h-5 object-contain" />
                    <Link to={`/category/${section.slug}`} className="text-lg font-bold text-gray-800 uppercase hover:text-[#fd4f00] transition">
                      {section.name}
                    </Link>
                  </div>

                  {/* 2x2 Category Post Grid (Uniform Equal-Height Aligned Cards) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {secPosts.map(post => (
                      <div
                        key={post._id}
                        className="bg-white rounded-md border border-gray-200 p-3 flex space-x-3 hover:shadow-md transition duration-300 h-[100px] items-center"
                      >
                        <div className="w-28 h-20 shrink-0 rounded overflow-hidden bg-gray-100">
                          {post.featuredImage?.url ? (
                            <img
                              src={getImageUrl(post.featuredImage.url)}
                              alt={post.title}
                              className="w-full h-full object-cover hover:scale-105 transition duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No image</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-0.5">
                          <h4 className="text-xs font-bold text-gray-800 hover:text-[#fd4f00] line-clamp-2 leading-tight">
                            <Link to={`/${post.slug}`}>{post.title}</Link>
                          </h4>
                          <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
                            <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            {post.views > 0 && <span>{post.views} views</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}

          {/* Latest Articles Grid (Equal Heights & Grid Aligned) */}
          <div className="pt-6">
            <h3 className="text-lg font-bold text-gray-800 uppercase border-b-2 border-[#fd4f00] pb-2 mb-6">
              Latest Articles
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {posts.slice(0, 9).map(post => (
                <div
                  key={post._id}
                  className="bg-white rounded-md border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition duration-300 flex flex-col justify-between h-full"
                >
                  <div className="w-full aspect-[16/10] overflow-hidden bg-gray-100">
                    {post.featuredImage?.url ? (
                      <img
                        src={getImageUrl(post.featuredImage.url)}
                        alt={post.title}
                        className="w-full h-full object-cover hover:scale-105 transition duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No image</div>
                    )}
                  </div>
                  <div className="p-4 flex flex-col justify-between flex-1">
                    <div>
                      <span className="text-[10px] font-bold text-[#fd4f00] uppercase tracking-wider block mb-1">
                        {post.categoryNames?.[0] || 'Article'}
                      </span>
                      <h4 className="text-xs font-bold text-gray-800 leading-snug hover:text-[#fd4f00] line-clamp-2 min-h-[34px]">
                        <Link to={`/${post.slug}`}>{post.title}</Link>
                      </h4>
                      <p className="text-[11px] text-gray-500 line-clamp-2 mt-1 leading-relaxed">
                        {post.excerpt}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-gray-400 pt-3 mt-2 border-t border-gray-100">
                      <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      {post.views > 0 && <span>{post.views} views</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar 3 Cols */}
        <div className="lg:col-span-3">
          <Sidebar categories={categories} recentPosts={recentPosts} />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
