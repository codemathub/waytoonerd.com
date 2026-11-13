import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/client';

const StaticPage = ({ defaultSlug }) => {
  const { slug } = useParams();
  const targetSlug = defaultSlug || slug;
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPage = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/pages/${targetSlug}`);
        setPage(res.data);
      } catch (err) {
        console.error('Failed to load page', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPage();
  }, [targetSlug]);

  if (loading) return <div className="text-center py-20 text-gray-500">Loading...</div>;
  if (!page) return <div className="text-center py-20 text-red-500">Page not found.</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded border border-gray-200 p-8 md:p-12 shadow-sm">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-6 border-b-2 border-[#fd4f00] pb-2 inline-block">
          {page.title}
        </h1>
        <div
          className="prose max-w-none text-gray-700 text-sm leading-relaxed space-y-4"
          dangerouslySetInnerHTML={{ __html: page.content || '<p>Content coming soon.</p>' }}
        />
      </div>
    </div>
  );
};

export default StaticPage;

