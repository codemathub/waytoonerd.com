import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { getImageUrl } from '../../api/client';

const Header = ({ settings, categories }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const rawMenu = (settings?.menus?.main && settings.menus.main.length > 0)
    ? settings.menus.main
    : categories.map(c => ({
        label: c.name,
        path: `/category/${c.slug}`
      }));

  // Ensure "Success Story" is included in main navbar
  const mainMenu = [...rawMenu];
  if (!mainMenu.some(item => item.path === '/success-stories')) {
    mainMenu.push({ label: 'Success Story', path: '/success-stories' });
  }

  const topMenu = [
    { label: 'Privacy Policy', path: '/privacy-policy' },
    { label: 'Contact Us', path: '/contact-us' },
    { label: 'About Us', path: '/about-us' }
  ];

  return (
    <header className="bg-white shadow-xs sticky top-0 z-50">
      {/* Top Main Row */}
      <div className="max-w-[98%] mx-auto py-3 px-4 flex justify-between items-center min-h-[85px]">
        {/* Official Brand Logo */}
        <Link to="/" className="flex items-center space-x-2 shrink-0">
          <img
            src={getImageUrl('/uploads/2019/05/footer-logo.png')}
            alt="WayTooNerd"
            className="h-11 md:h-12 w-auto object-contain"
          />
        </Link>

        {/* Center Search Bar */}
        <form onSubmit={handleSearch} className="hidden md:flex items-center relative w-[460px] mx-6">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Here"
            className="w-full px-5 py-2 rounded-full border border-gray-300 focus:outline-none focus:border-[#fd4f00] text-sm pr-12 shadow-inner"
          />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#fd4f00] transition">
            <Search size={18} />
          </button>
        </form>

        {/* Right: Social Icons + Top Links (Privacy Policy, Contact Us, About Us) */}
        <div className="flex flex-col items-end space-y-1.5">
          <div className="hidden sm:flex items-center space-x-3 text-gray-700">
            {settings?.socialLinks?.facebook && (
              <a href={settings.socialLinks.facebook} target="_blank" rel="noopener noreferrer" title="Facebook" className="hover:opacity-80 transition">
                <img src={getImageUrl('/uploads/2019/05/facebook.png')} alt="Facebook" className="header-social-icon w-4 h-4 object-contain" />
              </a>
            )}
            {settings?.socialLinks?.linkedin && (
              <a href={settings.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" title="LinkedIn" className="hover:opacity-80 transition">
                <img src={getImageUrl('/uploads/2019/07/link.png')} alt="LinkedIn" className="header-social-icon w-4 h-4 object-contain" />
              </a>
            )}
            {settings?.socialLinks?.instagram && (
              <a href={settings.socialLinks.instagram} target="_blank" rel="noopener noreferrer" title="Instagram" className="hover:opacity-80 transition">
                <img src={getImageUrl('/uploads/2019/05/instagram.png')} alt="Instagram" className="header-social-icon w-4 h-4 object-contain" />
              </a>
            )}
            {settings?.socialLinks?.twitter && (
              <a href={settings.socialLinks.twitter} target="_blank" rel="noopener noreferrer" title="Twitter" className="hover:opacity-80 transition">
                <img src={getImageUrl('/uploads/2019/05/twitter.png')} alt="Twitter" className="header-social-icon w-4 h-4 object-contain" />
              </a>
            )}
            {settings?.socialLinks?.youtube && (
              <a href={settings.socialLinks.youtube} target="_blank" rel="noopener noreferrer" title="YouTube" className="hover:opacity-80 transition">
                <img src={getImageUrl('/uploads/2019/05/utube.png')} alt="YouTube" className="header-social-icon w-4 h-4 object-contain" />
              </a>
            )}
            {settings?.socialLinks?.pinterest && (
              <a href={settings.socialLinks.pinterest} target="_blank" rel="noopener noreferrer" title="Pinterest" className="hover:opacity-80 transition">
                <img src={getImageUrl('/uploads/2019/05/pin.png')} alt="Pinterest" className="header-social-icon w-4 h-4 object-contain" />
              </a>
            )}
          </div>

          {/* Top Links in exact order: Privacy Policy, Contact Us, About Us */}
          <div className="hidden sm:flex items-center space-x-3 text-xs text-gray-400 font-medium pt-0.5">
            {topMenu.map((item, idx) => (
              <Link key={idx} to={item.path} className="hover:text-[#fd4f00] transition-colors">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <nav className="bg-white border-t border-b border-gray-200 min-h-[44px] flex items-center overflow-x-auto">
        <div className="max-w-[98%] mx-auto px-4 flex items-center space-x-1 text-[15px] font-semibold text-gray-800">
          {mainMenu.map((item, idx) => {
            const isActive = location.pathname === item.path;
            return (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-gray-600 px-1 py-2 select-none">|</span>}
                <Link
                  to={item.path}
                  className={`relative px-3 py-2 transition-colors whitespace-nowrap ${
                    isActive ? 'text-[#fd4f00] font-bold' : 'hover:text-[#fd4f00]'
                  }`}
                >
                  {isActive && (
                    <span className="absolute top-0 inset-x-0 h-[3px] bg-[#fd4f00]" />
                  )}
                  {item.label}
                </Link>
              </React.Fragment>
            );
          })}
        </div>
      </nav>
    </header>
  );
};

export default Header;

