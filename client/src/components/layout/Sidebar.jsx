import React from 'react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../../api/client';

const Sidebar = ({ categories, recentPosts }) => {
  return (
    <aside className="space-y-8">
      {/* Recent Posts Widget */}
      <div className="bg-white p-5 rounded border border-gray-200 shadow-sm">
        <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 border-b-2 border-[#fd4f00] pb-2 inline-block">
          Recent Posts
        </h4>
        <div className="space-y-4">
          {recentPosts.slice(0, 5).map((p, idx) => (
            <div key={idx} className="flex space-x-3 items-center">
              {p.featuredImage?.url && (
                <img
                  src={getImageUrl(p.featuredImage.url)}
                  alt={p.title}
                  className="w-16 h-14 object-cover rounded shadow-xs"
                />
              )}
              <div>
                <Link to={`/${p.slug}`} className="text-xs font-semibold text-gray-800 hover:text-[#fd4f00] line-clamp-2 transition-colors">
                  {p.title}
                </Link>
                <span className="text-[10px] text-gray-400">
                  {new Date(p.publishedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Categories Widget */}
      <div className="bg-white p-5 rounded border border-gray-200 shadow-sm">
        <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 border-b-2 border-[#fd4f00] pb-2 inline-block">
          Categories
        </h4>
        <ul className="space-y-2 text-xs">
          {categories.map((c, idx) => (
            <li key={idx} className="flex justify-between border-b border-gray-100 pb-1.5">
              <Link to={`/category/${c.slug}`} className="text-gray-700 hover:text-[#fd4f00] transition-colors">
                {c.name}
              </Link>
              <span className="text-gray-400">({c.postCount})</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
