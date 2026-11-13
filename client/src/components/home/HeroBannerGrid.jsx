import React from 'react';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import { getImageUrl } from '../../api/client';

const HeroBannerGrid = ({ posts = [] }) => {
  if (!posts || posts.length === 0) return null;

  // Take first 6 featured posts for a 2x3 or 1x3 responsive grid matching old Flatsome style
  const heroPosts = posts.slice(0, 6);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-1 mb-8">
      {heroPosts.map((post) => (
        <div key={post._id} className="relative h-[250px] md:h-[270px] overflow-hidden group bg-gray-900 border border-gray-200">
          <img
            src={getImageUrl(post.featuredImage?.url)}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />
          {/* Centered / Lower Translucent Dark Overlay with Title & Play Icon */}
          <div className="absolute inset-x-0 bottom-0 top-1/2 bg-black/65 flex flex-col justify-center items-center px-4 py-3 text-center transition group-hover:bg-black/80">
            <h3 className="text-white text-xs md:text-sm font-bold uppercase tracking-wide line-clamp-2 mb-2 leading-tight drop-shadow-sm">
              <Link to={`/${post.slug}`} className="hover:text-[#fd4f00] transition-colors">
                {post.title}
              </Link>
            </h3>
            <div className="w-8 h-8 rounded-full border-2 border-white/80 flex items-center justify-center text-white/90 group-hover:scale-110 group-hover:border-[#fd4f00] group-hover:text-[#fd4f00] transition">
              <Play size={14} className="fill-current ml-0.5" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HeroBannerGrid;
