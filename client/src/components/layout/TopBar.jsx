import React from 'react';
import { Link } from 'react-router-dom';

const TopBar = ({ settings }) => {
  const topMenu = settings?.menus?.top || [
    { label: 'Privacy Policy', path: '/privacy-policy' },
    { label: 'Contact Us', path: '/contact-us' },
    { label: 'About Us', path: '/about-us' }
  ];

  return (
    <div className="bg-[#111111] text-gray-300 text-xs py-1.5 px-4 border-b border-gray-800">
      <div className="max-w-[98%] mx-auto flex justify-between items-center">
        <div className="flex space-x-4">
          {topMenu.map((item, idx) => (
            <Link key={idx} to={item.path} className="hover:text-[#fd4f00] transition-colors">
              {item.label}
            </Link>
          ))}
        </div>
        <div className="flex space-x-3 items-center">
          {settings?.contactPhone && <span>Tel: {settings.contactPhone}</span>}
          {settings?.contactEmail && <span>| {settings.contactEmail}</span>}
        </div>
      </div>
    </div>
  );
};

export default TopBar;

