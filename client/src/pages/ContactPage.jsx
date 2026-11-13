import React, { useState } from 'react';
import api from '../api/client';

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/contact', formData);
      setSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit form');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded border border-gray-200 overflow-hidden shadow-sm grid grid-cols-1 md:grid-cols-2">
        {/* Left Side: Contact Info */}
        <div className="bg-gradient-to-br from-gray-900 to-black text-white p-8 flex flex-col justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-4 border-b-2 border-[#fd4f00] pb-2 inline-block">Contact Us</h1>
            <p className="text-sm text-gray-300 leading-relaxed mb-8">
              Have questions, feedback, or a partnership inquiry? Get in touch with the WayTooNerd team.
            </p>
            <div className="space-y-4 text-sm text-gray-300">
              <div>
                <strong className="block text-white text-xs uppercase text-[#fd4f00]">Phone:</strong>
                +919953609096
              </div>
              <div>
                <strong className="block text-white text-xs uppercase text-[#fd4f00]">Email:</strong>
                info@waytoonerd.com
              </div>
            </div>
          </div>
          <div className="mt-8 text-xs text-gray-500">
            WayTooNerd Tech Support & Media
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="p-8">
          <h2 className="text-lg font-bold text-gray-800 mb-6">Submit Your Query</h2>
          {submitted ? (
            <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded text-sm">
              Thank you for your message. It has been sent successfully.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="text-red-500 text-xs">{error}</div>}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Your Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded text-xs focus:outline-none focus:border-[#fd4f00]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Your Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded text-xs focus:outline-none focus:border-[#fd4f00]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Your Message *</label>
                <textarea
                  rows="4"
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded text-xs focus:outline-none focus:border-[#fd4f00]"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-[#fd4f00] text-white py-2.5 rounded font-bold text-xs uppercase hover:bg-[#cb3f00] transition"
              >
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactPage;

