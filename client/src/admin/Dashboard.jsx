import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import { 
  LayoutDashboard, 
  FileText, 
  Folder, 
  Mail, 
  Users, 
  Image as ImageIcon, 
  Settings, 
  LogOut, 
  Plus, 
  Trash2, 
  Edit,
  Eye,
  CheckCircle,
  Upload
} from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('posts');
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [messages, setMessages] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [pages, setPages] = useState([]);
  
  // Post editing & creation
  const [editingPost, setEditingPost] = useState(null);
  const [newPost, setNewPost] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    status: 'publish',
    featuredImage: { url: '' },
    categoryNames: [],
    categories: []
  });

  // Category editing
  const [newCategory, setNewCategory] = useState({ name: '', slug: '', description: '' });

  // Page editing
  const [editingPage, setEditingPage] = useState(null);

  // Settings
  const [settingsData, setSettingsData] = useState({
    siteName: 'Waytoonerd',
    tagline: 'Waytoonerd',
    contactPhone: '+919953609096',
    contactEmail: 'info@waytoonerd.com'
  });

  useEffect(() => {
    if (!user) {
      navigate('/admin/login');
      return;
    }
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const [statsRes, postsRes, catsRes, msgRes, subRes, pagesRes, settingsRes] = await Promise.all([
        api.get('/stats').catch(() => ({ data: null })),
        api.get('/posts?limit=100').catch(() => ({ data: { posts: [] } })),
        api.get('/categories').catch(() => ({ data: [] })),
        api.get('/contact-messages').catch(() => ({ data: [] })),
        api.get('/subscribers').catch(() => ({ data: [] })),
        api.get('/pages').catch(() => ({ data: [] })),
        api.get('/settings').catch(() => ({ data: {} }))
      ]);

      if (statsRes.data) setStats(statsRes.data);
      if (postsRes.data?.posts) setPosts(postsRes.data.posts);
      if (catsRes.data) setCategories(catsRes.data);
      if (msgRes.data) setMessages(msgRes.data);
      if (subRes.data) setSubscribers(subRes.data);
      if (pagesRes.data) setPages(pagesRes.data);
      if (settingsRes.data) setSettingsData(settingsRes.data);
    } catch (err) {
      console.error('Error loading admin data', err);
    }
  };

  const handleDeletePost = async (id) => {
    if (window.confirm('Delete this article permanently?')) {
      try {
        await api.delete(`/posts/${id}`);
        setPosts(posts.filter(p => p._id !== id));
      } catch (err) {
        alert('Failed to delete post');
      }
    }
  };

  const handleSavePost = async (e) => {
    e.preventDefault();
    try {
      if (editingPost) {
        await api.put(`/posts/${editingPost._id}`, editingPost);
        setEditingPost(null);
      } else {
        await api.post('/posts', newPost);
        setNewPost({ title: '', slug: '', content: '', excerpt: '', status: 'publish', featuredImage: { url: '' }, categoryNames: [], categories: [] });
      }
      loadData();
      setActiveTab('posts');
      alert('Article saved successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving post');
    }
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      await api.post('/categories', newCategory);
      setNewCategory({ name: '', slug: '', description: '' });
      loadData();
      alert('Category added successfully!');
    } catch (err) {
      alert('Failed to add category');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Delete category?')) {
      try {
        await api.delete(`/categories/${id}`);
        loadData();
      } catch (err) {
        alert('Failed to delete category');
      }
    }
  };

  const handleSavePage = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/pages/${editingPage._id}`, editingPage);
      setEditingPage(null);
      loadData();
      alert('Page content updated successfully!');
    } catch (err) {
      alert('Failed to update page');
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      await api.post('/settings', settingsData);
      alert('Settings saved successfully!');
    } catch (err) {
      alert('Failed to save settings');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const url = res.data.url;
      if (editingPost) {
        setEditingPost({ ...editingPost, featuredImage: { url } });
      } else {
        setNewPost({ ...newPost, featuredImage: { url } });
      }
      alert('Image uploaded: ' + url);
    } catch (err) {
      alert('Failed to upload image');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-gray-900 text-white flex flex-col justify-between shrink-0 shadow-lg">
        <div>
          <div className="p-6 border-b border-gray-800 flex items-center justify-between">
            <div>
              <span className="text-xl font-black text-[#fd4f00]">WayTooNerd</span>
              <span className="block text-[10px] text-gray-400 mt-0.5 uppercase tracking-wider">MERN Control Center</span>
            </div>
          </div>
          <nav className="p-3 space-y-1 text-xs">
            <button
              onClick={() => setActiveTab('posts')}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded transition font-medium ${activeTab === 'posts' ? 'bg-[#fd4f00] text-white shadow-sm' : 'text-gray-400 hover:bg-gray-800'}`}
            >
              <FileText size={16} />
              <span>Articles ({posts.length})</span>
            </button>
            <button
              onClick={() => { setEditingPost(null); setActiveTab('editor'); }}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded transition font-medium ${activeTab === 'editor' ? 'bg-[#fd4f00] text-white shadow-sm' : 'text-gray-400 hover:bg-gray-800'}`}
            >
              <Plus size={16} />
              <span>Write Article</span>
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded transition font-medium ${activeTab === 'categories' ? 'bg-[#fd4f00] text-white shadow-sm' : 'text-gray-400 hover:bg-gray-800'}`}
            >
              <Folder size={16} />
              <span>Categories ({categories.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('pages')}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded transition font-medium ${activeTab === 'pages' ? 'bg-[#fd4f00] text-white shadow-sm' : 'text-gray-400 hover:bg-gray-800'}`}
            >
              <LayoutDashboard size={16} />
              <span>Pages ({pages.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded transition font-medium ${activeTab === 'messages' ? 'bg-[#fd4f00] text-white shadow-sm' : 'text-gray-400 hover:bg-gray-800'}`}
            >
              <Mail size={16} />
              <span>Inquiries ({messages.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('subscribers')}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded transition font-medium ${activeTab === 'subscribers' ? 'bg-[#fd4f00] text-white shadow-sm' : 'text-gray-400 hover:bg-gray-800'}`}
            >
              <Users size={16} />
              <span>Subscribers ({subscribers.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded transition font-medium ${activeTab === 'settings' ? 'bg-[#fd4f00] text-white shadow-sm' : 'text-gray-400 hover:bg-gray-800'}`}
            >
              <Settings size={16} />
              <span>Settings</span>
            </button>
            <div className="pt-4 mt-4 border-t border-gray-800">
              <a
                href="http://localhost:5174/"
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center space-x-3 px-4 py-2.5 rounded text-gray-300 hover:bg-gray-800 transition"
              >
                <Eye size={16} />
                <span>View Live Site</span>
              </a>
            </div>
          </nav>
        </div>

        <div className="p-4 border-t border-gray-800">
          <div className="text-xs text-gray-400 mb-2 truncate">
            User: <strong className="text-white">{user?.displayName || user?.username}</strong>
          </div>
          <button
            onClick={() => { logout(); navigate('/admin/login'); }}
            className="w-full flex items-center justify-center space-x-2 bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white py-2 rounded text-xs transition font-semibold"
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content View */}
      <div className="flex-1 p-8 overflow-y-auto max-h-screen">
        {/* Top Summary Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-xs">
              <span className="text-gray-400 text-xs font-semibold uppercase">Total Articles</span>
              <div className="text-2xl font-black text-gray-800 mt-1">{stats.postCount}</div>
            </div>
            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-xs">
              <span className="text-gray-400 text-xs font-semibold uppercase">Categories</span>
              <div className="text-2xl font-black text-gray-800 mt-1">{stats.categoryCount}</div>
            </div>
            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-xs">
              <span className="text-gray-400 text-xs font-semibold uppercase">Subscribers</span>
              <div className="text-2xl font-black text-gray-800 mt-1">{stats.subscriberCount}</div>
            </div>
            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-xs">
              <span className="text-gray-400 text-xs font-semibold uppercase">Inquiries</span>
              <div className="text-2xl font-black text-gray-800 mt-1">{messages.length}</div>
            </div>
          </div>
        )}

        {/* Tab 1: Articles Manager */}
        {activeTab === 'posts' && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-xs p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-800">All Published Articles ({posts.length})</h2>
              <button
                onClick={() => { setEditingPost(null); setActiveTab('editor'); }}
                className="bg-[#fd4f00] text-white px-4 py-2 rounded text-xs font-bold hover:bg-[#cb3f00] transition flex items-center space-x-1"
              >
                <Plus size={14} />
                <span>Write New Article</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Title</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Views</th>
                    <th className="py-3 px-4">Published</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {posts.map(p => (
                    <tr key={p._id} className="hover:bg-gray-50 transition">
                      <td className="py-3 px-4 font-semibold text-gray-800 max-w-md truncate">
                        <a href={`http://localhost:5174/${p.slug}`} target="_blank" rel="noreferrer" className="hover:text-[#fd4f00]">
                          {p.title}
                        </a>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {p.categoryNames?.[0] || 'Tech'}
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-700">{p.views}</td>
                      <td className="py-3 px-4 text-gray-400">
                        {new Date(p.publishedAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right space-x-3">
                        <button
                          onClick={() => { setEditingPost(p); setActiveTab('editor'); }}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="Edit"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeletePost(p._id)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Article Editor */}
        {activeTab === 'editor' && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-xs p-6 max-w-4xl">
            <h2 className="text-lg font-bold text-gray-800 mb-6">
              {editingPost ? 'Edit Article' : 'Write New Article'}
            </h2>
            <form onSubmit={handleSavePost} className="space-y-5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Article Title *</label>
                <input
                  type="text"
                  required
                  value={editingPost ? editingPost.title : newPost.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                    if (editingPost) setEditingPost({ ...editingPost, title, slug: editingPost.slug || slug });
                    else setNewPost({ ...newPost, title, slug });
                  }}
                  className="w-full px-4 py-2.5 border rounded focus:outline-none focus:border-[#fd4f00]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">URL Slug *</label>
                <input
                  type="text"
                  required
                  value={editingPost ? editingPost.slug : newPost.slug}
                  onChange={(e) => {
                    if (editingPost) setEditingPost({ ...editingPost, slug: e.target.value });
                    else setNewPost({ ...newPost, slug: e.target.value });
                  }}
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:border-[#fd4f00]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Featured Image URL or Upload</label>
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={editingPost ? editingPost.featuredImage?.url : newPost.featuredImage?.url}
                    onChange={(e) => {
                      if (editingPost) setEditingPost({ ...editingPost, featuredImage: { ...editingPost.featuredImage, url: e.target.value } });
                      else setNewPost({ ...newPost, featuredImage: { ...newPost.featuredImage, url: e.target.value } });
                    }}
                    placeholder="/uploads/YYYY/MM/sample.jpg"
                    className="flex-1 px-4 py-2 border rounded focus:outline-none focus:border-[#fd4f00]"
                  />
                  <label className="bg-gray-100 hover:bg-gray-200 border px-4 py-2 rounded cursor-pointer flex items-center space-x-2 text-gray-700">
                    <Upload size={14} />
                    <span>Upload File</span>
                    <input type="file" onChange={handleImageUpload} className="hidden" accept="image/*" />
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Short Excerpt</label>
                <textarea
                  rows="2"
                  value={editingPost ? editingPost.excerpt : newPost.excerpt}
                  onChange={(e) => {
                    if (editingPost) setEditingPost({ ...editingPost, excerpt: e.target.value });
                    else setNewPost({ ...newPost, excerpt: e.target.value });
                  }}
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:border-[#fd4f00]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">HTML Content *</label>
                <textarea
                  rows="14"
                  required
                  value={editingPost ? editingPost.content : newPost.content}
                  onChange={(e) => {
                    if (editingPost) setEditingPost({ ...editingPost, content: e.target.value });
                    else setNewPost({ ...newPost, content: e.target.value });
                  }}
                  className="w-full px-4 py-3 border rounded font-mono text-xs focus:outline-none focus:border-[#fd4f00]"
                />
              </div>

              <div className="flex space-x-3 pt-4 border-t">
                <button
                  type="submit"
                  className="bg-[#fd4f00] text-white px-6 py-2.5 rounded font-bold hover:bg-[#cb3f00] transition"
                >
                  Save & Publish
                </button>
                <button
                  type="button"
                  onClick={() => { setEditingPost(null); setActiveTab('posts'); }}
                  className="bg-gray-200 text-gray-700 px-6 py-2.5 rounded font-bold hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 3: Categories Manager */}
        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-4 bg-white rounded-lg border border-gray-200 p-6 shadow-xs">
              <h3 className="text-base font-bold text-gray-800 mb-4">Add New Category</h3>
              <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Category Name *</label>
                  <input
                    type="text"
                    required
                    value={newCategory.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                      setNewCategory({ ...newCategory, name, slug });
                    }}
                    className="w-full px-4 py-2 border rounded focus:outline-none focus:border-[#fd4f00]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Slug *</label>
                  <input
                    type="text"
                    required
                    value={newCategory.slug}
                    onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
                    className="w-full px-4 py-2 border rounded focus:outline-none focus:border-[#fd4f00]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Description / SEO Description</label>
                  <textarea
                    rows="3"
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                    className="w-full px-4 py-2 border rounded focus:outline-none focus:border-[#fd4f00]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#fd4f00] text-white py-2 rounded font-bold hover:bg-[#cb3f00] transition"
                >
                  Create Category
                </button>
              </form>
            </div>

            <div className="md:col-span-8 bg-white rounded-lg border border-gray-200 p-6 shadow-xs">
              <h3 className="text-base font-bold text-gray-800 mb-4">Categories ({categories.length})</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b font-bold text-gray-600">
                    <tr>
                      <th className="py-2.5 px-4">Name</th>
                      <th className="py-2.5 px-4">Slug</th>
                      <th className="py-2.5 px-4">Posts</th>
                      <th className="py-2.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {categories.map(c => (
                      <tr key={c._id}>
                        <td className="py-3 px-4 font-semibold text-gray-800">{c.name}</td>
                        <td className="py-3 px-4 text-gray-500">{c.slug}</td>
                        <td className="py-3 px-4 font-bold text-gray-700">{c.postCount}</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleDeleteCategory(c._id)}
                            className="text-red-600 hover:text-red-800 p-1"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Pages Manager */}
        {activeTab === 'pages' && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-xs p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-6">Static & Custom Pages ({pages.length})</h2>
            {editingPage ? (
              <form onSubmit={handleSavePage} className="space-y-4 text-xs max-w-3xl">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Page Title</label>
                  <input
                    type="text"
                    required
                    value={editingPage.title}
                    onChange={(e) => setEditingPage({ ...editingPage, title: e.target.value })}
                    className="w-full px-4 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Page HTML Content</label>
                  <textarea
                    rows="12"
                    value={editingPage.content}
                    onChange={(e) => setEditingPage({ ...editingPage, content: e.target.value })}
                    className="w-full px-4 py-3 border rounded font-mono text-xs"
                  />
                </div>
                <div className="flex space-x-3">
                  <button type="submit" className="bg-[#fd4f00] text-white px-5 py-2 rounded font-bold hover:bg-[#cb3f00]">
                    Save Page
                  </button>
                  <button type="button" onClick={() => setEditingPage(null)} className="bg-gray-200 px-5 py-2 rounded font-bold">
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b font-bold text-gray-600">
                  <tr>
                    <th className="py-3 px-4">Title</th>
                    <th className="py-3 px-4">Slug</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pages.map(p => (
                    <tr key={p._id}>
                      <td className="py-3 px-4 font-semibold text-gray-800">{p.title}</td>
                      <td className="py-3 px-4 text-gray-500">/{p.slug}</td>
                      <td className="py-3 px-4 text-green-600 font-bold">{p.status}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setEditingPage(p)}
                          className="text-blue-600 hover:text-blue-800 p-1 mr-2"
                        >
                          <Edit size={14} />
                        </button>
                        <a href={`http://localhost:5174/${p.slug}`} target="_blank" rel="noreferrer" className="text-gray-600 hover:text-[#fd4f00]">
                          <Eye size={14} />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab 5: Inquiries Messages */}
        {activeTab === 'messages' && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-xs p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-6">Contact Inquiries ({messages.length})</h2>
            {messages.length === 0 ? (
              <div className="text-gray-400 text-xs py-8 text-center">No contact inquiries yet.</div>
            ) : (
              <div className="space-y-4">
                {messages.map(m => (
                  <div key={m._id} className="p-4 border rounded-lg bg-gray-50 text-xs shadow-xs">
                    <div className="flex justify-between items-center mb-2">
                      <strong className="text-gray-900 text-sm">{m.name}</strong>
                      <span className="text-gray-400">{new Date(m.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="text-blue-600 mb-2">{m.email}</div>
                    <p className="text-gray-700 leading-relaxed bg-white p-3 rounded border border-gray-200">
                      {m.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 6: Subscribers List */}
        {activeTab === 'subscribers' && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-xs p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-6">Newsletter Subscribers ({subscribers.length})</h2>
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b font-bold text-gray-600">
                <tr>
                  <th className="py-3 px-4">Email Address</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {subscribers.map(s => (
                  <tr key={s._id}>
                    <td className="py-3 px-4 font-semibold text-gray-800">{s.email}</td>
                    <td className="py-3 px-4 text-gray-500">{s.name || '-'}</td>
                    <td className="py-3 px-4 text-green-600 font-bold">{s.status}</td>
                    <td className="py-3 px-4 text-gray-400">{new Date(s.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 7: Global Settings */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-xs p-6 max-w-xl">
            <h2 className="text-lg font-bold text-gray-800 mb-6">Global Site Settings</h2>
            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Site Title</label>
                <input
                  type="text"
                  value={settingsData.siteName || ''}
                  onChange={(e) => setSettingsData({ ...settingsData, siteName: e.target.value })}
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:border-[#fd4f00]"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={settingsData.contactPhone || ''}
                  onChange={(e) => setSettingsData({ ...settingsData, contactPhone: e.target.value })}
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:border-[#fd4f00]"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Contact Email</label>
                <input
                  type="email"
                  value={settingsData.contactEmail || ''}
                  onChange={(e) => setSettingsData({ ...settingsData, contactEmail: e.target.value })}
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:border-[#fd4f00]"
                />
              </div>
              <button
                type="submit"
                className="bg-[#fd4f00] text-white px-6 py-2 rounded font-bold hover:bg-[#cb3f00] transition"
              >
                Save Settings
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
