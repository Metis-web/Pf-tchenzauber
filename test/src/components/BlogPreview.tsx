import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Newspaper } from 'lucide-react';

export default function BlogPreview() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'), limit(10));
    const unsub = onSnapshot(q, (snapshot) => {
      const activeBlogs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter((blog: any) => !blog.isDeleted);
      setBlogs(activeBlogs.slice(0, 3));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading || blogs.length === 0) return null;

  return (
    <section className="py-24 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="font-display text-4xl sm:text-5xl font-black text-stone-900 mb-4 flex items-center gap-4">
              <Newspaper className="w-10 h-10 text-brand" /> BLOG/NEWS
            </h2>
            <p className="text-xl text-stone-600 max-w-2xl">Aktuelles aus dem Tierschutzalltag, Erfolgsgeschichten und Neuigkeiten.</p>
          </div>
          <Link to="/blog" className="hidden sm:inline-flex items-center gap-2 bg-white text-stone-900 px-6 py-3 rounded-full font-bold hover:bg-stone-50 border border-stone-200 transition-colors shadow-sm">
            Alle Beiträge lesen
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {blogs.map((blog, idx) => (
            <motion.div
              key={blog.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <Link to={`/blog`} className="group flex flex-col h-full bg-white/60 backdrop-blur-md rounded-3xl overflow-hidden border border-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                {(blog.imageUrls && blog.imageUrls.length > 0) || blog.imageUrl ? (
                   <div className="h-64 overflow-hidden relative">
                     <img src={blog.imageUrls && blog.imageUrls.length > 0 ? blog.imageUrls[0] : blog.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={blog.title} />
                     <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 to-transparent opacity-60" />
                   </div>
                ) : (
                   <div className="h-48 bg-stone-100 flex items-center justify-center text-stone-300 relative">
                     <Newspaper className="w-12 h-12" />
                   </div>
                )}
                <div className="p-8 flex flex-col flex-1">
                  <span className="text-sm font-bold tracking-wider text-brand mb-3 uppercase">Blog</span>
                  <h3 className="font-display text-2xl font-bold text-stone-900 mb-4">{blog.title}</h3>
                  <p className="text-stone-600 leading-relaxed line-clamp-3 mb-6">{blog.content}</p>
                  <div className="mt-auto flex items-center justify-between text-sm font-medium text-stone-500 pt-4 border-t border-stone-100">
                    <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                    <span className="text-brand group-hover:underline">Weiterlesen</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-8 text-center sm:hidden">
            <Link to="/blog" className="inline-flex items-center gap-2 bg-white text-stone-900 px-8 py-4 rounded-full font-bold hover:bg-stone-50 border border-stone-200 transition-colors shadow-sm w-full justify-center">
              Alle Beiträge lesen
            </Link>
        </div>
      </div>
    </section>
  );
}
