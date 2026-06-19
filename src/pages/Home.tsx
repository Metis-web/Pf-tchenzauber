import { Heart, Star, Phone, PawPrint } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import UserInquiries from '../components/UserInquiries';
import FeaturedReviewsScroll from '../components/FeaturedReviewsScroll';
import Reviews from '../components/Reviews';
import BlogPreview from '../components/BlogPreview';
import EmergencyStatus from '../components/EmergencyStatus';
import AdoptedBadge from '../components/AdoptedBadge';
import { useSiteTexts } from '../hooks/useSiteTexts';

export default function Home() {
  const texts = useSiteTexts();
  
  const generatePath = (startX: number, startY: number, endX: number, endY: number, count: number, startDelay: number, curveIntensity: number = 20) => {
    return Array.from({ length: count }).map((_, i) => {
      const progress = i / (count - 1);
      const curve = Math.sin(progress * Math.PI) * curveIntensity;
      
      const x = startX + progress * (endX - startX) + curve;
      const y = startY + progress * (endY - startY) - curve;
      
      const dx = (endX - startX);
      const dy = (endY - startY);
      const baseRotation = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
      
      const rotate = baseRotation + (i % 2 === 0 ? -12 : 12);
      const offset = i % 2 === 0 ? -15 : 15;
      
      return { x, y, offset, rotate, delay: startDelay + i * 0.4 };
    });
  };

  const walkingPaws = [
    ...generatePath(15, 20, 85, 30, 3, 0, 15),
    ...generatePath(85, 35, 25, 75, 4, 2.5, -25),
    ...generatePath(45, 85, 80, 50, 3, 5, 20)
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#fff1f2] via-[#fafaf9] to-[#fee2e2]">
      {/* Aesthetic ambient blurs for the whole page */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div 
          animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0], opacity: [0.3, 0.4, 0.3] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#fecaca] rounded-full blur-[150px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.1, 1], x: [0, -30, 0], y: [0, 40, 0], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-[40%] left-[-10%] w-[900px] h-[900px] bg-[#f87171] rounded-full blur-[180px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, -10, 5, 0], y: [0, -50, 0], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute bottom-0 right-[20%] w-[700px] h-[700px] bg-[#fca5a5] rounded-full blur-[150px]" 
        />
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 pb-32">
        {/* Animated Cat Paw Prints Walking Sequence */}
        {walkingPaws.map((paw, i) => (
          <motion.div
            key={`paw-${i}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: [0, 0.4, 0], scale: [0.8, 1, 0.9] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: paw.delay,
              repeatDelay: 2.5,
              ease: "easeInOut"
            }}
            className="absolute text-brand/20"
            style={{
              top: `calc(${paw.y}% + ${paw.offset}px)`,
              left: `calc(${paw.x}% + ${paw.offset * 0.5}px)`,
              rotate: `${paw.rotate}deg`
            }}
          >
            <PawPrint size={64} strokeWidth={1.5} />
          </motion.div>
        ))}
      </div>

      <UserInquiries />
      
      {/* Hero Section */}
      <section className="relative py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <AdoptedBadge />
          </motion.div>
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-4xl sm:text-6xl font-black text-stone-900 tracking-tight mb-8"
            dangerouslySetInnerHTML={{ __html: texts.homeHeroTitle }}
          />
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-stone-600 max-w-2xl mx-auto mb-10"
          >
            {texts.homeHeroSub}
          </motion.p>
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/tiere" className="bg-stone-900 text-white px-8 py-4 rounded-full font-medium hover:bg-stone-800 transition-colors shadow-lg">
              Katze oder Kätzchen finden
            </Link>
            <Link to="/spenden" className="bg-white text-stone-900 border-2 border-stone-200 px-8 py-4 rounded-full font-medium hover:border-brand hover:text-brand transition-colors flex items-center justify-center gap-2">
              <Heart className="w-5 h-5 text-brand" /> Projekt unterstützen
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Reviews Effect */}
      <FeaturedReviewsScroll />

      {/* Review Form section */}
      <Reviews />

      {/* Blog Preview Section */}
      <BlogPreview />

      {/* Quick Contact */}
      <section className="py-16 relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center bg-white/40 backdrop-blur-md rounded-3xl p-12 border border-white/50 shadow-xl relative"
        >
            <EmergencyStatus />
            <h2 className="font-display text-3xl font-black mb-6 text-stone-900 mt-8 sm:mt-0">{texts.homeEmergencyTitle}</h2>
            <p className="text-stone-600 mb-8 max-w-xl text-lg">{texts.homeEmergencySub}</p>
            <a href="tel:01785305137" className="inline-flex items-center gap-3 bg-brand text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-brand-hover transition-colors shadow-lg hover:-translate-y-1 transform duration-200">
                <Phone className="w-5 h-5" /> 0178 5305137
            </a>
        </motion.div>
      </section>
    </div>
  );
}
