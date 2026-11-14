import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import api, { getImageUrl } from '../api/client';
import { 
  LayoutDashboard, 
  FileText, 
  Folder, 
  Mail, 
  Users, 
  Settings, 
  LogOut, 
  Plus, 
  Trash2, 
  Edit,
  Eye,
  CheckCircle,
  Upload,
  Video,
  Loader2,
  X,
  Play
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
  const [stories, setStories] = useState([]);
  
  // Post editing & creation
  const [editingPost, setEditingPost] = useState(null);
  const [postImageUploading, setPostImageUploading] = useState(false);
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

  // Success Story editing & creation
  const [editingStory, setEditingStory] = useState(null);
  const [storyVideoUploading, setStoryVideoUploading] = useState(false);
  const [storyThumbUploading, setStoryThumbUploading] = useState(false);
  const [isStoryFormOpen, setIsStoryFormOpen] = useState(false);
  const [storyFormData, setStoryFormData] = useState({
    title: '',
    personName: '',
    roleOrCompany: '',
    description: '',
    videoUrl: '',
    thumbnailUrl: '',
    featured: true,
    order: 0
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
      const [statsRes, postsRes, catsRes, msgRes, subRes, pagesRes, storiesRes, settingsRes] = await Promise.all([
        api.get('/stats').catch(() => ({ data: null })),
        api.get('/posts?limit=100').catch(() => ({ data: { posts: [] } })),
        api.get('/categories').catch(() => ({ data: [] })),
        api.get('/contact-messages').catch(() => ({ data: [] })),
        api.get('/subscribers').catch(() => ({ data: [] })),
        api.get('/pages').catch(() => ({ data: [] })),
        api.get('/success-stories').catch(() => ({ data: [] })),
        api.get('/settings').catch(() => ({ data: {} }))
      ]);

      if (statsRes.data) setStats(statsRes.data);
      if (postsRes.data?.posts) setPosts(postsRes.data.posts);
      if (catsRes.data) setCategories(catsRes.data);
      if (msgRes.data) setMessages(msgRes.data);
      if (subRes.data) setSubscribers(subRes.data);
      if (pagesRes.data) setPages(pagesRes.data);
      if (storiesRes.data) setStories(storiesRes.data);
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

  // Direct File Upload to Backblaze B2 for Post Featured Image
  const handlePostImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPostImageUploading(true);
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
    } catch (err) {
      alert('Failed to upload image to storage');
    } finally {
      setPostImageUploading(false);
      e.target.value = '';
    }
  };

  const removePostImage = () => {
    if (editingPost) {
      setEditingPost({ ...editingPost, featuredImage: { url: '' } });
    } else {
      setNewPost({ ...newPost, featuredImage: { url: '' } });
    }
  };

  // Success Story Handlers
  const handleOpenNewStoryModal = () => {
    setEditingStory(null);
    setStoryFormData({
      title: '',
      personName: '',
      roleOrCompany: '',
      description: '',
      videoUrl: '',
      thumbnailUrl: '',
      featured: true,
      order: 0
    });
    setIsStoryFormOpen(true);
  };

  const handleEditStory = (story) => {
    setEditingStory(story);
    setStoryFormData({
      title: story.title,
      personName: story.personName,
      roleOrCompany: story.roleOrCompany || '',
      description: story.description,
      videoUrl: story.videoUrl,
      thumbnailUrl: story.thumbnailUrl || '',
      featured: story.featured ?? true,
      order: story.order || 0
    });
    setIsStoryFormOpen(true);
  };

  const handleDeleteStory = async (id) => {
    if (window.confirm('Delete this success story permanently?')) {
      try {
        await api.delete(`/success-stories/${id}`);
        setStories(stories.filter(s => s._id !== id));
      } catch (err) {
        alert('Failed to delete success story');
      }
    }
  };

  const handleStoryVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStoryVideoUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setStoryFormData(prev => ({ ...prev, videoUrl: res.data.url }));
    } catch (err) {
      alert('Failed to upload video to storage');
    } finally {
      setStoryVideoUploading(false);
      e.target.value = '';
    }
  };

  const handleStoryThumbnailUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStoryThumbUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setStoryFormData(prev => ({ ...prev, thumbnailUrl: res.data.url }));
    } catch (err) {
      alert('Failed to upload thumbnail to storage');
    } finally {
      setStoryThumbUploading(false);
      e.target.value = '';
    }
  };

  const handleSaveStory = async (e) => {
    e.preventDefault();
    if (!storyFormData.videoUrl) {
      alert('Please upload a video file for this success story');
      return;
    }
    try {
      if (editingStory) {
        await api.put(`/success-stories/${editingStory._id}`, storyFormData);
      } else {
        await api.post('/success-stories', storyFormData);
      }
      setIsStoryFormOpen(false);
      setEditingStory(null);
      loadData();
      alert('Success story saved successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save success story');
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
              onClick={() => setActiveTab('stories')}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded transition font-medium ${activeTab === 'stories' ? 'bg-[#fd4f00] text-white shadow-sm' : 'text-gray-400 hover:bg-gray-800'}`}
            >
              <Video size={16} />
              <span>Success Stories ({stories.length})</span>
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
              <Link
                to="/"
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center space-x-3 px-4 py-2.5 rounded text-gray-300 hover:bg-gray-800 transition"
              >
                <Eye size={16} />
                <span>View Live Site</span>
              </Link>
            </div>
          </nav>
        </div>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-gray-800 flex items-center justify-between text-xs">
          <div className="overflow-hidden pr-2">
            <span className="block font-bold truncate text-white">{user?.username}</span>
            <span className="text-[10px] text-gray-500 uppercase">{user?.role}</span>
          </div>
          <button
            onClick={logout}
            className="text-gray-400 hover:text-red-400 p-2 rounded hover:bg-gray-800 transition"
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-8">
        {/* Top KPI Header */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-xs">
            <span className="text-gray-500 text-xs font-semibold uppercase">Published Articles</span>
            <div className="text-2xl font-black text-gray-800 mt-1">{stats?.postCount ?? posts.length}</div>
          </div>
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-xs">
            <span className="text-gray-500 text-xs font-semibold uppercase">Success Stories</span>
            <div className="text-2xl font-black text-[#fd4f00] mt-1">{stories.length}</div>
          </div>
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-xs">
            <span className="text-gray-500 text-xs font-semibold uppercase">Newsletter Readers</span>
            <div className="text-2xl font-black text-gray-800 mt-1">{stats?.subscriberCount ?? subscribers.length}</div>
          </div>
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-xs">
            <span className="text-gray-500 text-xs font-semibold uppercase">Contact Inquiries</span>
            <div className="text-2xl font-black text-blue-600 mt-1">{stats?.messageCount ?? messages.length}</div>
          </div>
        </div>

        {/* Tab 1: Articles List */}
        {activeTab === 'posts' && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-xs">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-gray-800">Articles Directory</h2>
                <p className="text-xs text-gray-500 mt-0.5">Manage and organize all published articles and drafts.</p>
              </div>
              <button
                onClick={() => { setEditingPost(null); setActiveTab('editor'); }}
                className="bg-[#fd4f00] text-white px-4 py-2 rounded text-xs font-bold hover:bg-[#cb3f00] transition flex items-center space-x-1.5 shadow-sm"
              >
                <Plus size={14} />
                <span>New Article</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b font-bold text-gray-600">
                  <tr>
                    <th className="py-3 px-4">Title & Slug</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Published Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {posts.map(p => (
                    <tr key={p._id} className="hover:bg-gray-50/70 transition">
                      <td className="py-3 px-4 font-semibold text-gray-800">
                        <Link to={`/${p.slug}`} target="_blank" className="hover:text-[#fd4f00] flex items-center space-x-1.5">
                          <span>{p.title}</span>
                        </Link>
                        <span className="block text-[11px] text-gray-400 font-normal">/{p.slug}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[11px] font-medium">
                          {p.categoryNames?.[0] || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${p.status === 'publish' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-800'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-400">
                        {new Date(p.publishedAt || p.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => { setEditingPost(p); setActiveTab('editor'); }}
                          className="text-gray-500 hover:text-blue-600 p-1 rounded"
                          title="Edit"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeletePost(p._id)}
                          className="text-gray-500 hover:text-red-600 p-1 rounded"
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

        {/* Tab 2: Article Editor (NO URL typing - Direct File Upload to Backblaze B2) */}
        {activeTab === 'editor' && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-xs p-6 max-w-4xl">
            <h2 className="text-lg font-bold text-gray-800 mb-6">
              {editingPost ? 'Edit Article' : 'Compose New Article'}
            </h2>
            <form onSubmit={handleSavePost} className="space-y-5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Article Headline *</label>
                <input
                  type="text"
                  required
                  value={editingPost ? editingPost.title : newPost.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                    if (editingPost) setEditingPost({ ...editingPost, title });
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

              {/* Direct File Upload for Featured Image */}
              <div>
                <label className="block font-semibold text-gray-700 mb-2">Featured Image</label>
                {(() => {
                  const currentImgUrl = editingPost ? editingPost.featuredImage?.url : newPost.featuredImage?.url;
                  return (
                    <div className="border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 flex flex-col md:flex-row items-center justify-between gap-4">
                      {currentImgUrl ? (
                        <div className="flex items-center space-x-4">
                          <img
                            src={getImageUrl(currentImgUrl)}
                            alt="Featured"
                            className="w-24 h-16 object-cover rounded border border-gray-200 bg-white"
                          />
                          <div>
                            <span className="text-xs font-bold text-green-600 block flex items-center space-x-1">
                              <CheckCircle size={13} />
                              <span>Image Attached</span>
                            </span>
                            <span className="text-[11px] text-gray-400 truncate max-w-xs block mt-0.5">
                              {currentImgUrl}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-500 text-xs">
                          {postImageUploading ? (
                            <span className="flex items-center space-x-2 text-[#fd4f00] font-semibold">
                              <Loader2 size={16} className="animate-spin" />
                              <span>Uploading to Backblaze B2...</span>
                            </span>
                          ) : (
                            <span>No featured image selected. Upload one directly from your device.</span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center space-x-2 shrink-0">
                        <label className={`cursor-pointer px-4 py-2 rounded text-xs font-bold flex items-center space-x-1.5 transition ${postImageUploading ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#fd4f00] text-white hover:bg-[#cb3f00] shadow-xs'}`}>
                          {postImageUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                          <span>{currentImgUrl ? 'Replace Image' : 'Upload Image'}</span>
                          <input
                            type="file"
                            onChange={handlePostImageUpload}
                            disabled={postImageUploading}
                            className="hidden"
                            accept="image/*"
                          />
                        </label>
                        {currentImgUrl && (
                          <button
                            type="button"
                            onClick={removePostImage}
                            className="px-3 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded text-xs font-medium transition"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })()}
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

        {/* Tab 3: Success Stories Management */}
        {activeTab === 'stories' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 shadow-xs">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Success Stories & Podcasts ({stories.length})</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Upload and manage video interviews, podcasts, and community breakthrough stories.
                  </p>
                </div>
                <button
                  onClick={handleOpenNewStoryModal}
                  className="bg-[#fd4f00] text-white px-4 py-2 rounded text-xs font-bold hover:bg-[#cb3f00] transition flex items-center space-x-1.5 shadow-sm"
                >
                  <Plus size={14} />
                  <span>Add New Story</span>
                </button>
              </div>

              {/* Stories Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b font-bold text-gray-600">
                    <tr>
                      <th className="py-3 px-4">Video & Preview</th>
                      <th className="py-3 px-4">Title</th>
                      <th className="py-3 px-4">Person & Role</th>
                      <th className="py-3 px-4">Featured</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {stories.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-12 text-gray-400">
                          No success stories uploaded yet. Click "Add New Story" to upload your first video story!
                        </td>
                      </tr>
                    ) : (
                      stories.map(s => (
                        <tr key={s._id} className="hover:bg-gray-50/70 transition">
                          <td className="py-3 px-4 w-40">
                            <div className="relative aspect-video w-32 bg-black rounded overflow-hidden shadow-xs">
                              {s.thumbnailUrl ? (
                                <img src={getImageUrl(s.thumbnailUrl)} alt={s.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-[10px]">
                                  Video Clip
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                <Play size={16} className="text-white fill-current" />
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-gray-900 block text-sm">{s.title}</span>
                            <span className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">{s.description}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-gray-800 block">{s.personName}</span>
                            <span className="text-[11px] text-[#fd4f00] font-medium">{s.roleOrCompany || 'Community'}</span>
                          </td>
                          <td className="py-3 px-4">
                            {s.featured ? (
                              <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                                Yes
                              </span>
                            ) : (
                              <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                                No
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right space-x-2">
                            <button
                              onClick={() => handleEditStory(s)}
                              className="text-gray-500 hover:text-blue-600 p-1.5 rounded"
                              title="Edit Story"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteStory(s._id)}
                              className="text-gray-500 hover:text-red-600 p-1.5 rounded"
                              title="Delete Story"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal / Inline Form for Add & Edit Story */}
            {isStoryFormOpen && (
              <div className="bg-white rounded-lg border-2 border-[#fd4f00]/40 shadow-md p-6 max-w-3xl">
                <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-100">
                  <h3 className="text-base font-bold text-gray-800">
                    {editingStory ? 'Edit Success Story' : 'Upload New Success Story / Podcast'}
                  </h3>
                  <button
                    onClick={() => setIsStoryFormOpen(false)}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSaveStory} className="space-y-5 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Story Title / Headline *</label>
                      <input
                        type="text"
                        required
                        value={storyFormData.title}
                        onChange={(e) => setStoryFormData({ ...storyFormData, title: e.target.value })}
                        placeholder="e.g. From Self-Taught Coder to Full Stack Engineer"
                        className="w-full px-4 py-2 border rounded focus:outline-none focus:border-[#fd4f00]"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Person / Speaker Name *</label>
                      <input
                        type="text"
                        required
                        value={storyFormData.personName}
                        onChange={(e) => setStoryFormData({ ...storyFormData, personName: e.target.value })}
                        placeholder="e.g. Alex Morgan"
                        className="w-full px-4 py-2 border rounded focus:outline-none focus:border-[#fd4f00]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Role / Company or Tag</label>
                    <input
                      type="text"
                      value={storyFormData.roleOrCompany}
                      onChange={(e) => setStoryFormData({ ...storyFormData, roleOrCompany: e.target.value })}
                      placeholder="e.g. AI Engineer @ Startup / Podcast Host"
                      className="w-full px-4 py-2 border rounded focus:outline-none focus:border-[#fd4f00]"
                    />
                  </div>

                  {/* 1. Direct Video File Upload to Backblaze B2 */}
                  <div>
                    <label className="block font-semibold text-gray-700 mb-2">Video File Upload (.mp4, .webm, .mov) *</label>
                    <div className="border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 flex flex-col md:flex-row items-center justify-between gap-4">
                      {storyFormData.videoUrl ? (
                        <div className="w-full md:w-2/3">
                          <video
                            src={getImageUrl(storyFormData.videoUrl)}
                            controls
                            className="w-full aspect-video rounded bg-black object-cover shadow-xs"
                          />
                          <span className="text-[11px] text-green-600 font-semibold mt-1 block flex items-center space-x-1">
                            <CheckCircle size={13} />
                            <span>Video Uploaded to Backblaze Storage</span>
                          </span>
                        </div>
                      ) : (
                        <div className="text-gray-500 text-xs">
                          {storyVideoUploading ? (
                            <span className="flex items-center space-x-2 text-[#fd4f00] font-semibold">
                              <Loader2 size={16} className="animate-spin" />
                              <span>Uploading video directly to Backblaze B2...</span>
                            </span>
                          ) : (
                            <span>Choose a video file to upload. It will automatically save in Backblaze B2.</span>
                          )}
                        </div>
                      )}

                      <div className="shrink-0">
                        <label className={`cursor-pointer px-4 py-2 rounded text-xs font-bold flex items-center space-x-1.5 transition ${storyVideoUploading ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#fd4f00] text-white hover:bg-[#cb3f00] shadow-xs'}`}>
                          {storyVideoUploading ? <Loader2 size={14} className="animate-spin" /> : <Video size={14} />}
                          <span>{storyFormData.videoUrl ? 'Replace Video' : 'Upload Video File'}</span>
                          <input
                            type="file"
                            onChange={handleStoryVideoUpload}
                            disabled={storyVideoUploading}
                            className="hidden"
                            accept="video/*"
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* 2. Direct Thumbnail Image Upload */}
                  <div>
                    <label className="block font-semibold text-gray-700 mb-2">Cover Thumbnail Image</label>
                    <div className="border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 flex flex-col md:flex-row items-center justify-between gap-4">
                      {storyFormData.thumbnailUrl ? (
                        <div className="flex items-center space-x-4">
                          <img
                            src={getImageUrl(storyFormData.thumbnailUrl)}
                            alt="Cover Thumbnail"
                            className="w-28 h-18 object-cover rounded border border-gray-200 bg-white"
                          />
                          <div>
                            <span className="text-xs font-bold text-green-600 block flex items-center space-x-1">
                              <CheckCircle size={13} />
                              <span>Thumbnail Attached</span>
                            </span>
                            <span className="text-[11px] text-gray-400 truncate max-w-xs block mt-0.5">
                              {storyFormData.thumbnailUrl}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-500 text-xs">
                          {storyThumbUploading ? (
                            <span className="flex items-center space-x-2 text-[#fd4f00] font-semibold">
                              <Loader2 size={16} className="animate-spin" />
                              <span>Uploading thumbnail to Backblaze B2...</span>
                            </span>
                          ) : (
                            <span>Optional: Upload a video cover thumbnail image.</span>
                          )}
                        </div>
                      )}

                      <div className="shrink-0">
                        <label className={`cursor-pointer px-4 py-2 rounded text-xs font-bold flex items-center space-x-1.5 transition ${storyThumbUploading ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-800 text-white hover:bg-black shadow-xs'}`}>
                          {storyThumbUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                          <span>{storyFormData.thumbnailUrl ? 'Replace Thumbnail' : 'Upload Thumbnail'}</span>
                          <input
                            type="file"
                            onChange={handleStoryThumbnailUpload}
                            disabled={storyThumbUploading}
                            className="hidden"
                            accept="image/*"
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Description & Key Highlights *</label>
                    <textarea
                      rows="4"
                      required
                      value={storyFormData.description}
                      onChange={(e) => setStoryFormData({ ...storyFormData, description: e.target.value })}
                      placeholder="Write a short summary of the discussion, key takeaways, and tools covered..."
                      className="w-full px-4 py-2.5 border rounded focus:outline-none focus:border-[#fd4f00]"
                    />
                  </div>

                  <div className="flex items-center space-x-6">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={storyFormData.featured}
                        onChange={(e) => setStoryFormData({ ...storyFormData, featured: e.target.checked })}
                        className="rounded text-[#fd4f00] focus:ring-[#fd4f00]"
                      />
                      <span className="font-semibold text-gray-700">Feature on Homepage</span>
                    </label>

                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-700">Display Order:</span>
                      <input
                        type="number"
                        value={storyFormData.order}
                        onChange={(e) => setStoryFormData({ ...storyFormData, order: parseInt(e.target.value) || 0 })}
                        className="w-20 px-2 py-1 border rounded focus:outline-none focus:border-[#fd4f00]"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4 border-t">
                    <button
                      type="submit"
                      className="bg-[#fd4f00] text-white px-6 py-2.5 rounded font-bold hover:bg-[#cb3f00] transition"
                    >
                      Save Success Story
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsStoryFormOpen(false)}
                      className="bg-gray-200 text-gray-700 px-6 py-2.5 rounded font-bold hover:bg-gray-300 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Categories List */}
        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 shadow-xs p-6 md:col-span-1">
              <h3 className="font-bold text-gray-800 mb-4">Add Category</h3>
              <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Category Name *</label>
                  <input
                    type="text"
                    required
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({
                      ...newCategory,
                      name: e.target.value,
                      slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                    })}
                    className="w-full px-4 py-2 border rounded focus:outline-none focus:border-[#fd4f00]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Category Slug *</label>
                  <input
                    type="text"
                    required
                    value={newCategory.slug}
                    onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
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

            <div className="bg-white rounded-lg border border-gray-200 shadow-xs md:col-span-2 overflow-hidden">
              <div className="p-6 border-b">
                <h3 className="font-bold text-gray-800">Existing Categories</h3>
              </div>
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b font-bold text-gray-600">
                  <tr>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Slug</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {categories.map(c => (
                    <tr key={c._id}>
                      <td className="py-3 px-4 font-semibold text-gray-800">{c.name}</td>
                      <td className="py-3 px-4 text-gray-500">{c.slug}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteCategory(c._id)}
                          className="text-gray-400 hover:text-red-600 p-1 rounded"
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

        {/* Tab 5: Static Pages Manager */}
        {activeTab === 'pages' && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-xs p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-6">Pages Content Manager</h2>
            {editingPage ? (
              <form onSubmit={handleSavePage} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Page Title</label>
                  <input
                    type="text"
                    required
                    value={editingPage.title}
                    onChange={(e) => setEditingPage({ ...editingPage, title: e.target.value })}
                    className="w-full px-4 py-2 border rounded focus:outline-none focus:border-[#fd4f00]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Page HTML Content</label>
                  <textarea
                    rows="16"
                    required
                    value={editingPage.content}
                    onChange={(e) => setEditingPage({ ...editingPage, content: e.target.value })}
                    className="w-full px-4 py-3 border rounded font-mono text-xs focus:outline-none focus:border-[#fd4f00]"
                  />
                </div>
                <div className="flex space-x-3">
                  <button type="submit" className="bg-[#fd4f00] text-white px-6 py-2 rounded font-bold hover:bg-[#cb3f00] transition">
                    Save Changes
                  </button>
                  <button type="button" onClick={() => setEditingPage(null)} className="bg-gray-200 text-gray-700 px-6 py-2 rounded font-bold hover:bg-gray-300 transition">
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
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pages.map(pg => (
                    <tr key={pg._id}>
                      <td className="py-3 px-4 font-semibold text-gray-800">{pg.title}</td>
                      <td className="py-3 px-4 text-gray-500">/{pg.slug}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setEditingPage(pg)}
                          className="text-gray-500 hover:text-blue-600 p-1 rounded"
                        >
                          <Edit size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab 6: Messages Inbox */}
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

        {/* Tab 7: Subscribers List */}
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

        {/* Tab 8: Global Settings */}
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
