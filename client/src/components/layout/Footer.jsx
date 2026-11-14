import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getImageUrl } from '../../api/client';

const Footer = ({ settings, categories, recentPosts }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState({ loading: false, success: false, message: '' });

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setStatus({ loading: true, success: false, message: '' });
    try {
      const res = await api.post('/subscribe', { email, name });
      setStatus({ loading: false, success: true, message: res.data.message || 'Thank you for subscribing!' });
      setEmail('');
      setName('');
    } catch (err) {
      setStatus({
        loading: false,
        success: false,
        message: err.response?.data?.message || 'Failed to subscribe. Please try again.'
      });
    }
  };

  return (
    <footer id="footer" className="mt-16 text-gray-300">
      {/* 1. Original Black Social Icons Bar (Height 80px) */}
      <div className="footer-1 bg-black h-[80px] border-b border-[#444] flex items-center justify-center">
        <div className="container mx-auto max-w-[98%] text-center">
          <ul className="inline-flex items-center justify-center space-x-2 md:space-x-4">
            <li>
              <a
                href={settings?.socialLinks?.facebook || "https://www.facebook.com/waytoonerd/"}
                target="_blank"
                rel="noopener noreferrer"
                title="Facebook"
                className="inline-block p-3 hover:bg-[#fc4f00] transition duration-500 rounded transform hover:scale-110 hover:rotate-[360deg]"
              >
                <img src={getImageUrl('/uploads/2019/05/facebook.png')} alt="facebook" className="h-6 w-auto" />
              </a>
            </li>
            <li>
              <a
                href={settings?.socialLinks?.linkedin || "https://www.linkedin.com/company/waytoonerd/"}
                target="_blank"
                rel="noopener noreferrer"
                title="LinkedIn"
                className="inline-block p-3 hover:bg-[#fc4f00] transition duration-500 rounded transform hover:scale-110 hover:rotate-[360deg]"
              >
                <img src={getImageUrl('/uploads/2019/07/link.png')} alt="Linkedin" className="h-6 w-auto" />
              </a>
            </li>
            <li>
              <a
                href={settings?.socialLinks?.instagram || "https://www.instagram.com/waytoonerd_/"}
                target="_blank"
                rel="noopener noreferrer"
                title="Instagram"
                className="inline-block p-3 hover:bg-[#fc4f00] transition duration-500 rounded transform hover:scale-110 hover:rotate-[360deg]"
              >
                <img src={getImageUrl('/uploads/2019/05/instagram.png')} alt="instagram" className="h-6 w-auto" />
              </a>
            </li>
            <li>
              <a
                href={settings?.socialLinks?.twitter || "https://twitter.com/waytoonerd_in"}
                target="_blank"
                rel="noopener noreferrer"
                title="Twitter"
                className="inline-block p-3 hover:bg-[#fc4f00] transition duration-500 rounded transform hover:scale-110 hover:rotate-[360deg]"
              >
                <img src={getImageUrl('/uploads/2019/05/twitter.png')} alt="twitter" className="h-6 w-auto" />
              </a>
            </li>
            <li>
              <a
                href={settings?.socialLinks?.youtube || "https://www.youtube.com/channel/UC03Dea7inYwgaAifNat1oZg"}
                target="_blank"
                rel="noopener noreferrer"
                title="YouTube"
                className="inline-block p-3 hover:bg-[#fc4f00] transition duration-500 rounded transform hover:scale-110 hover:rotate-[360deg]"
              >
                <img src={getImageUrl('/uploads/2019/05/utube.png')} alt="youtube" className="h-6 w-auto" />
              </a>
            </li>
            <li>
              <a
                href={settings?.socialLinks?.pinterest || "https://in.pinterest.com/waytoonerd/"}
                target="_blank"
                rel="noopener noreferrer"
                title="Pinterest"
                className="inline-block p-3 hover:bg-[#fc4f00] transition duration-500 rounded transform hover:scale-110 hover:rotate-[360deg]"
              >
                <img src={getImageUrl('/uploads/2019/05/pin.png')} alt="pinterest" className="h-6 w-auto" />
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* 2. Original 4-Column Footer Widgets (Dark theme) */}
      <div className="bg-[#1b1b1b] py-12 px-6 border-b border-gray-800">
        <div className="max-w-[98%] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: About Us + footer-logo.png */}
          <div>
            <span className="text-white text-base font-bold tracking-wide uppercase block">About Us</span>
            <div className="w-12 h-0.5 bg-[#fd4f00] mt-2 mb-4"></div>
            <h1 className="text-sm font-bold text-gray-200 mb-2">Waytoonerd</h1>
            <p className="text-xs text-gray-400 leading-relaxed mb-4">
              Through WayTooNerd, we intend to make our readers mindful of any latest tech news concerning Android, iOS, MacOS or Windows OS. We are determined to resolve any sort of technical issues via this platform.
            </p>
            <img
              src={getImageUrl('/uploads/2019/05/footer-logo.png')}
              alt="waytoonerd"
              className="w-[200px] h-auto object-contain mt-2"
            />
          </div>

          {/* Col 2: Categories Menu */}
          <div>
            <span className="text-white text-base font-bold tracking-wide uppercase block">Categories</span>
            <div className="w-12 h-0.5 bg-[#fd4f00] mt-2 mb-4"></div>
            <ul className="space-y-2 text-xs text-gray-400">
              {categories.map((c, idx) => (
                <li key={idx}>
                  <Link to={`/category/${c.slug}`} className="hover:text-[#fd4f00] transition-colors">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Recent Posts with Thumbnails */}
          <div>
            <span className="text-white text-base font-bold tracking-wide uppercase block">Recent Posts</span>
            <div className="w-12 h-0.5 bg-[#fd4f00] mt-2 mb-4"></div>
            <ul className="space-y-3">
              {recentPosts.slice(0, 3).map((p, idx) => (
                <li key={idx} className="flex space-x-3 items-center border-b border-[#333] pb-2">
                  {p.featuredImage?.url && (
                    <img
                      src={getImageUrl(p.featuredImage.url)}
                      alt={p.title}
                      className="w-12 h-12 object-cover rounded shrink-0"
                    />
                  )}
                  <Link to={`/${p.slug}`} className="text-xs text-gray-300 hover:text-[#fd4f00] line-clamp-2 transition-colors">
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Subscribe with Us */}
          <div>
            <span className="text-white text-base font-bold tracking-wide uppercase block">Subscribe With Us</span>
            <div className="w-12 h-0.5 bg-[#fd4f00] mt-2 mb-4"></div>
            <p className="text-xs text-gray-400 mb-4">Subscribe to our newsletter to get latest news about us.</p>
            {status.success ? (
              <div className="bg-green-900/40 border border-green-600 text-green-300 p-3 rounded text-xs">
                ✓ {status.message}
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col space-y-2.5">
                {status.message && !status.success && (
                  <div className="text-red-400 text-xs">{status.message}</div>
                )}
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name (Optional)"
                  className="px-4 py-2 rounded-full bg-[#2a2a2a] text-white text-xs border border-gray-700 focus:outline-none focus:border-[#fd4f00]"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your Email *"
                  required
                  className="px-4 py-2 rounded-full bg-[#2a2a2a] text-white text-xs border border-gray-700 focus:outline-none focus:border-[#fd4f00]"
                />
                <button
                  type="submit"
                  disabled={status.loading}
                  className="bg-[#fd4f00] text-white py-2 rounded-full font-bold text-xs hover:bg-[#cb3f00] transition disabled:opacity-50 uppercase tracking-wider"
                >
                  {status.loading ? 'Subscribing...' : 'Subscribe'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* 3. Original Absolute Footer */}
      <div className="bg-[#111111] py-4 text-center text-xs text-gray-500 border-t border-gray-900">
        <div className="max-w-[98%] mx-auto flex flex-col md:flex-row justify-between items-center text-gray-500">
          <div>Copyright {new Date().getFullYear()} &copy; <strong>Waytoonerd</strong>. All rights reserved.</div>
          <div className="flex space-x-4 mt-2 md:mt-0 text-xs">
            <Link to="/privacy-policy" className="hover:text-[#fd4f00]">Privacy Policy</Link>
            <span>|</span>
            <Link to="/contact-us" className="hover:text-[#fd4f00]">Contact Us</Link>
            <span>|</span>
            <Link to="/about-us" className="hover:text-[#fd4f00]">About Us</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
