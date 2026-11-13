import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api, { getImageUrl } from '../api/client';
import Sidebar from '../components/layout/Sidebar';

const CategoryPage = () => {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [catRes, postsRes, allCatsRes, recentRes] = await Promise.all([
          api.get(`/categories/${slug}`).catch(() => ({ data: null })),
          api.get(`/posts?category=${slug}&limit=20`),
          api.get('/categories'),
          api.get('/posts/recent?limit=5')
        ]);
        setCategory(catRes.data);
        setPosts(postsRes.data.posts || []);
        setCategories(allCatsRes.data || []);
        setRecentPosts(recentRes.data || []);
      } catch (err) {
        console.error('Failed to load category', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  if (loading) return <div className="text-center py-20 text-gray-500">Loading Category...</div>;

  return (
    <div className="max-w-[98%] mx-auto px-4 py-8">
      {/* Category Header with Yoast SEO Title & Desc */}
      <div className="bg-white p-6 rounded border border-gray-200 mb-8 shadow-xs">
        <h1 className="text-2xl font-extrabold text-gray-900 border-b-2 border-[#fd4f00] pb-2 inline-block">
          {category?.name || slug.toUpperCase()}
        </h1>
        {category?.seo?.description && (
          <p className="text-sm text-gray-600 mt-3 max-w-3xl leading-relaxed">
            {category.seo.description}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-9">
          {posts.length === 0 ? (
            <div className="bg-white p-12 text-center text-gray-500 rounded border">
              No articles found in this category yet.
            </div>
          ) : (
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
                  <div className="p-5">
                    <span className="text-[10px] font-bold text-[#fd4f00] uppercase tracking-wider">
                      {category?.name || 'Category'}
                    </span>
                    <h3 className="text-sm font-bold text-gray-800 mt-1 mb-2 line-clamp-2">
                      <Link to={`/${post.slug}`} className="hover:text-[#fd4f00]">
                        {post.title}
                      </Link>
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-3">{post.excerpt}</p>
                    <span className="text-[10px] text-gray-400">
                      {new Date(post.publishedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-3">
          <Sidebar categories={categories} recentPosts={recentPosts} />
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
