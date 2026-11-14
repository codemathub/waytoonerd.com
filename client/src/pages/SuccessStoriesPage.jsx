import React, { useState, useEffect } from 'react';
import { Play } from 'lucide-react';
import api, { getImageUrl } from '../api/client';

const SuccessStoriesPage = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState(null);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const res = await api.get('/success-stories');
        setStories(res.data || []);
      } catch (err) {
        console.error('Failed to load success stories:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStories();
  }, []);

  return (
    <div className="max-w-[98%] mx-auto px-4 py-8">
      {/* Header Banner */}
      <div className="mb-10 text-center max-w-3xl mx-auto">
        <span className="text-xs font-bold text-[#fd4f00] uppercase tracking-widest block mb-2">
          Real Journeys, Real Impact
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white uppercase tracking-tight">
          Success Stories & Podcasts
        </h1>
        <div className="w-16 h-1 bg-[#fd4f00] mx-auto mt-4 mb-4 rounded-full"></div>
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          Watch firsthand tech breakthroughs, career transitions, and stories of problem solving from the WayTooNerd community and creators.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-24 text-gray-400 font-medium">Loading stories...</div>
      ) : stories.length === 0 ? (
        <div className="bg-white dark:bg-[#171717] rounded-xl border border-gray-200 dark:border-gray-800 p-16 text-center text-gray-500">
          <p className="text-base font-semibold">No success stories published yet.</p>
          <p className="text-xs text-gray-400 mt-1">Check back soon for new podcast episodes and creator journeys!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stories.map((story) => (
            <div
              key={story._id}
              className="bg-white dark:bg-[#171717] rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden shadow-xs hover:shadow-lg transition duration-300 flex flex-col justify-between"
            >
              {/* Video Player or Thumbnail */}
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
                      <div className="w-14 h-14 rounded-full bg-[#fd4f00] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition duration-300">
                        <Play size={24} className="fill-current ml-1" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Story Details */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#fd4f00] uppercase tracking-wider">
                      {story.roleOrCompany || 'Success Story'}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      {new Date(story.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white leading-snug line-clamp-2 mb-2">
                    {story.title}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-3">
                    {story.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-full bg-[#fd4f00]/10 border border-[#fd4f00]/30 text-[#fd4f00] flex items-center justify-center font-bold text-xs uppercase">
                      {story.personName.charAt(0)}
                    </div>
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                      {story.personName}
                    </span>
                  </div>
                  {activeVideo !== story._id && (
                    <button
                      onClick={() => setActiveVideo(story._id)}
                      className="text-xs font-bold text-[#fd4f00] hover:underline uppercase tracking-wider flex items-center space-x-1"
                    >
                      <span>Watch</span>
                      <span>&rarr;</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SuccessStoriesPage;
