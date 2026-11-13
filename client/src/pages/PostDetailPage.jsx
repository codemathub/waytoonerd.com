import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api, { getImageUrl, API_BASE_URL } from '../api/client';
import Sidebar from '../components/layout/Sidebar';

const PostDetailPage = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        const [postRes, catsRes, recentRes] = await Promise.all([
          api.get(`/posts/${slug}`),
          api.get('/categories'),
          api.get('/posts/recent?limit=5')
        ]);
        setPost(postRes.data.post);
        setRelatedPosts(postRes.data.relatedPosts || []);
        setCategories(catsRes.data || []);
        setRecentPosts(recentRes.data || []);
      } catch (err) {
        console.error('Failed to load post', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) return <div className="text-center py-20 text-gray-500">Loading Article...</div>;
  if (!post) return <div className="text-center py-20 text-red-500">Article not found.</div>;

  // Dynamically prefix any relative /uploads/ in content with the current API_BASE_URL
  const parsedContent = post.content
    ? post.content.replace(/src="\/uploads\//g, `src="${API_BASE_URL}/uploads/`)
    : '';

  return (
    <div className="max-w-[98%] mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Article Column (9 cols) */}
        <div className="lg:col-span-9 bg-white p-6 md:p-10 rounded border border-gray-200 shadow-sm">
          {/* Breadcrumb */}
          <div className="text-xs text-gray-400 mb-3 flex items-center space-x-2">
            <Link to="/" className="hover:text-[#fd4f00]">Home</Link>
            <span>/</span>
            {post.categories?.[0] && (
              <>
                <Link to={`/category/${post.categories[0].slug}`} className="hover:text-[#fd4f00]">
                  {post.categories[0].name}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-gray-600 truncate max-w-xs">{post.title}</span>
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight mb-4">
            {post.title}
          </h1>

          {/* Meta Info */}
          <div className="flex items-center space-x-4 text-xs text-gray-500 pb-6 border-b border-gray-100 mb-6">
            <span>By <strong className="text-gray-800">{post.author?.name || 'Sachin'}</strong></span>
            <span>•</span>
            <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <span>•</span>
            <span>{post.views} Views</span>
          </div>

          {/* Featured Image */}
          {post.featuredImage?.url && (
            <div className="mb-8 rounded overflow-hidden">
              <img
                src={getImageUrl(post.featuredImage.url)}
                alt={post.title}
                className="w-full max-h-[500px] object-cover"
              />
            </div>
          )}

          {/* HTML Article Content */}
          <div
            className="prose max-w-none text-gray-800 leading-relaxed text-sm md:text-base space-y-4"
            dangerouslySetInnerHTML={{ __html: parsedContent }}
          />

          {/* Tags */}
          {post.tagNames && post.tagNames.length > 0 && (
            <div className="mt-10 pt-6 border-t border-gray-200">
              <h4 className="text-xs font-bold text-gray-700 uppercase mb-3">Tags:</h4>
              <div className="flex flex-wrap gap-2">
                {post.tagNames.map((tag, idx) => (
                  <span key={idx} className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Related Articles */}
          {relatedPosts.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-6 border-b-2 border-[#fd4f00] pb-2 inline-block">
                Related Articles
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map(rel => (
                  <div key={rel._id} className="bg-gray-50 rounded border border-gray-200 p-3 hover:shadow-md transition">
                    {rel.featuredImage?.url && (
                      <img
                        src={getImageUrl(rel.featuredImage.url)}
                        alt={rel.title}
                        className="w-full h-32 object-cover rounded mb-2"
                      />
                    )}
                    <h5 className="text-xs font-bold text-gray-800 line-clamp-2 hover:text-[#fd4f00]">
                      <Link to={`/${rel.slug}`}>{rel.title}</Link>
                    </h5>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar (3 cols) */}
        <div className="lg:col-span-3">
          <Sidebar categories={categories} recentPosts={recentPosts} />
        </div>
      </div>
    </div>
  );
};

export default PostDetailPage;
