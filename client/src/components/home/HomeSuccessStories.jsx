import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Sparkles, ArrowRight } from 'lucide-react';
import api, { getImageUrl } from '../../api/client';

const HomeSuccessStories = () => {
  const [stories, setStories] = useState([]);
  const [activeVideo, setActiveVideo] = useState(null);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const res = await api.get('/success-stories');
        setStories(res.data || []);
      } catch (err) {
        console.error('Failed to load success stories for home:', err);
      }
    };
    fetchStories();
  }, []);

  if (!stories || stories.length === 0) return null;

  const displayStories = stories.slice(0, 3);

  return (
    <section className="mt-14 mb-8 pt-10 border-t border-gray-200 dark:border-gray-800">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
        <div>
          <div className="flex items-center space-x-2 text-[#fd4f00] text-xs font-bold uppercase tracking-wider mb-1.5">
            <Sparkles size={14} />
            <span>Success Stories & Community</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white uppercase tracking-tight">
            Tech Journeys & Podcasts
          </h2>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Real stories, career leaps, and tech walkthroughs shared by creators and builders.
          </p>
        </div>
        <Link
          to="/success-stories"
          className="mt-4 md:mt-0 inline-flex items-center space-x-2 text-xs font-bold text-[#fd4f00] hover:text-[#e04500] uppercase tracking-wider group"
        >
          <span>View All Stories</span>
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {displayStories.map((story) => (
          <div
            key={story._id}
            className="bg-white dark:bg-[#171717] rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden shadow-xs hover:shadow-lg transition duration-300 flex flex-col justify-between"
          >
            {/* Video or Thumbnail */}
            <div className="relative aspect-video bg-black overflow-hidden group">
              {activeVideo === story._id ? (
                <video
                  src={getImageUrl(story.videoUrl)}
                  controls
                  autoPlay
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  onClick={() => setActiveVideo(story._id)}
                  className="w-full h-full relative cursor-pointer"
                >
                  {story.thumbnailUrl ? (
                    <img
                      src={getImageUrl(story.thumbnailUrl)}
                      alt={story.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
                      <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">
                        WayTooNerd Story
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-[#fd4f00] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition duration-300">
                      <Play size={20} className="fill-current ml-0.5" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#fd4f00] uppercase tracking-wider block mb-1">
                  {story.roleOrCompany || 'Community Highlight'}
                </span>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-snug line-clamp-2 mb-2">
                  {story.title}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                  {story.description}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-[#fd4f00]/10 border border-[#fd4f00]/30 text-[#fd4f00] flex items-center justify-center font-bold text-[11px] uppercase">
                    {story.personName?.charAt(0) || 'U'}
                  </div>
                  <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                    {story.personName}
                  </span>
                </div>
                {activeVideo !== story._id && (
                  <button
                    onClick={() => setActiveVideo(story._id)}
                    className="text-[11px] font-bold text-[#fd4f00] hover:underline uppercase tracking-wider"
                  >
                    Watch &rarr;
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HomeSuccessStories;
