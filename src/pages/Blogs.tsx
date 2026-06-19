import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Newspaper, Calendar, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

function BlogImageSlider({ images, title }: { images: string[], title: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  const goToPrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    if (isLeftSwipe) {
      goToNext();
    }
    if (isRightSwipe) {
      goToPrev();
    }
    setTouchStart(0);
    setTouchEnd(0);
  };

  return (
    <div 
      className="h-64 sm:h-[500px] w-full relative group touch-pan-y"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <img src={images[currentIndex]} className="w-full h-full object-cover transition-all duration-300 pointer-events-none" alt={`${title} - ${currentIndex + 1}`} />
      
      <button 
        onClick={goToPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white text-stone-800 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      
      <button 
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white text-stone-800 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
      
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, i) => (
          <div 
            key={i} 
            className={`w-2 h-2 rounded-full transition-all ${i === currentIndex ? 'bg-white scale-125' : 'bg-white/50'}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function Blogs() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const q = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setBlogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter((blog: any) => !blog.isDeleted));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => {
    let day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // 0 = Monday, 6 = Sunday
  };

  const daysInMonth = getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth());
  const startingDay = getFirstDayOfMonth(currentMonth.getFullYear(), currentMonth.getMonth());

  const handlePrevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const monthNames = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

  const scrollToBlog = (blogId: string) => {
    const el = document.getElementById(`blog-${blogId}`);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <Link to="/" className="inline-flex items-center gap-2 text-stone-500 hover:text-brand font-medium mb-8 transition-colors">
              <ArrowLeft className="w-5 h-5" /> Zurück zur Startseite
            </Link>
            <Newspaper className="w-16 h-16 text-brand mx-auto mb-6" />
            <h1 className="font-display text-5xl font-black text-stone-900 mb-6">BLOG / NEWS</h1>
            <p className="text-xl text-stone-600 max-w-2xl mx-auto">
              News, Happy Ends und Geschichten aus dem Alltag des Tierschutzvereins.
            </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        {loading ? (
            <div className="text-center text-stone-500 py-12">Lade Beiträge...</div>
        ) : blogs.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-3xl border border-stone-200 shadow-sm">
                <Newspaper className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                <h3 className="font-bold text-xl text-stone-900 mb-2">Noch keine Einträge</h3>
                <p className="text-stone-500">Schauen Sie später wieder vorbei.</p>
            </div>
        ) : (
            <>
              {/* Blog Calendar */}
              <div className="bg-white rounded-[2rem] p-6 lg:p-8 border border-stone-200 shadow-sm mb-16">
                 <div className="flex justify-between items-center mb-6">
                    <h2 className="font-display text-2xl font-bold text-stone-900">Blog Kalender</h2>
                    <div className="flex items-center gap-4">
                        <button onClick={handlePrevMonth} className="p-2 hover:bg-stone-100 rounded-full transition-colors"><ChevronLeft className="w-5 h-5"/></button>
                        <span className="font-bold text-lg min-w-[120px] text-center">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
                        <button onClick={handleNextMonth} className="p-2 hover:bg-stone-100 rounded-full transition-colors"><ChevronRight className="w-5 h-5"/></button>
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-7 gap-2 sm:gap-4 mb-2 text-center text-sm font-bold text-stone-400">
                    <div>Mo</div><div>Di</div><div>Mi</div><div>Do</div><div>Fr</div><div>Sa</div><div>So</div>
                 </div>
                 
                 <div className="grid grid-cols-7 gap-2 sm:gap-4">
                    {Array.from({ length: startingDay }).map((_, i) => (
                        <div key={`empty-${i}`} className="aspect-square bg-stone-50 rounded-xl"></div>
                    ))}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const defaultBg = "bg-stone-100 hover:bg-stone-200 text-stone-500";
                        const hasBlogs = blogs.filter(b => {
                           const d = new Date(b.createdAt);
                           return d.getDate() === day && d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear();
                        });

                        return (
                            <div key={day} className="aspect-square relative group">
                               {hasBlogs.length > 0 ? (
                                  <button onClick={() => scrollToBlog(hasBlogs[0].id)} className="w-full h-full rounded-xl bg-brand hover:bg-brand-hover transition-colors text-white flex flex-col items-center justify-center p-1 shadow-sm">
                                      <span className="text-xs sm:text-sm font-medium opacity-80 mb-0.5">{day}</span>
                                      <span className="text-xs sm:text-sm font-black">#{blogs.length - blogs.findIndex(b => b.id === hasBlogs[0].id)}</span>
                                  </button>
                               ) : (
                                  <div className={`w-full h-full rounded-xl flex items-center justify-center font-medium ${defaultBg}`}>
                                      {day}
                                  </div>
                               )}
                            </div>
                        );
                    })}
                 </div>
              </div>

              <div className="space-y-16">
                  {blogs.map((blog, idx) => (
                      <motion.article 
                          id={`blog-${blog.id}`}
                          key={blog.id}
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: idx * 0.1 }}
                          className="bg-white rounded-[2.5rem] overflow-hidden border border-stone-100 shadow-xl scroll-mt-24"
                      >
                          {((blog.imageUrls && blog.imageUrls.length > 0) || blog.imageUrl) && (
                              <div className="w-full relative bg-stone-100">
                                  {blog.imageUrls && blog.imageUrls.length > 1 ? (
                                      <BlogImageSlider images={blog.imageUrls} title={blog.title} />
                                  ) : (
                                      <div className="h-64 sm:h-[500px] w-full relative">
                                          <img src={blog.imageUrls && blog.imageUrls.length > 0 ? blog.imageUrls[0] : blog.imageUrl} className="w-full h-full object-cover" alt={blog.title} />
                                      </div>
                                  )}
                              </div>
                          )}
                          <div className="p-8 sm:p-12">
                              <div className="flex items-center gap-4 text-sm mb-6">
                                  <span className="bg-brand/10 text-brand px-3 py-1 rounded-full font-black tracking-widest text-xs uppercase">
                                     BLOG #{blogs.length - idx}
                                  </span>
                                  <div className="flex items-center gap-2 text-stone-400 font-medium">
                                      <Calendar className="w-4 h-4" />
                                      {new Date(blog.createdAt).toLocaleDateString()}
                                  </div>
                              </div>
                              <h2 className="font-display text-3xl sm:text-4xl font-black text-stone-900 mb-8 leading-tight">
                                  {blog.title}
                              </h2>
                            <div className="prose prose-stone max-w-none text-stone-600 leading-loose whitespace-pre-wrap text-lg">
                                {blog.content}
                            </div>
                        </div>
                    </motion.article>
                ))}
            </div>
            </>
        )}
      </div>
    </div>
  );
}
