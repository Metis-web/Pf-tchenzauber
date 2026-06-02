import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, MotionValue } from 'motion/react';
import { Star } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface Review {
  id: string;
  name: string;
  rating: number;
  text: string;
  isDeleted?: boolean;
}

function ReviewCard({ 
  review, 
  index, 
  totalCards, 
  smoothProgress 
}: { 
  review: Review;
  index: number;
  totalCards: number; 
  smoothProgress: MotionValue<number>;
  key?: React.Key;
}) {
  const sectionProgress = 1 / totalCards;
  
  // Card flies away when scroll progress reaches its slice
  const flyAwayStart = index * sectionProgress;
  const flyAwayEnd = flyAwayStart + sectionProgress;

  // Stagger the initial resting positions slightly to look like a messy deck
  const offsetX = [-10, 15, -5, 20, -15, 10, -20, 5, -25, 30][index % 10];
  const offsetY = [5, -10, 15, -5, 20, -15, 10, -20, 5, -25][index % 10];
  const baseRotate = [-3, 4, -5, 2, -4, 5, -2, 3, -6, 1][index % 10];

  // Y moves from offsetY (resting) to -800 (flying up)
  const y = useTransform(smoothProgress, [flyAwayStart, flyAwayEnd], [offsetY, -800]);
  
  // X moves a bit extra when flying away for a tossed effect
  const x = useTransform(smoothProgress, [flyAwayStart, flyAwayEnd], [offsetX, offsetX + (index % 2 === 0 ? 50 : -50)]);

  // Opacity fades out slightly as it flies away
  const opacity = useTransform(smoothProgress, [flyAwayStart, flyAwayEnd], [1, 0]);

  // Rotation increases as you toss it
  const rotate = useTransform(smoothProgress, [flyAwayStart, flyAwayEnd], [baseRotate, baseRotate + (index % 2 === 0 ? 15 : -15)]);

  // zIndex ensures the first card is on top
  const zIndex = totalCards - index;

  return (
    <motion.div
      style={{ y, x, opacity, zIndex, rotate }}
      className="absolute inset-x-0 top-0 max-w-md mx-auto flex flex-col justify-center bg-white rounded-3xl p-6 sm:p-10 border-2 border-stone-200 shadow-xl origin-center max-h-[60vh] sm:max-h-[450px]"
    >
      <div className="flex gap-1 text-yellow-400 mb-4 sm:mb-6 justify-center shrink-0">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className={`w-4 h-4 sm:w-5 sm:h-5 ${i < review.rating ? 'fill-current' : 'text-stone-200'}`} />
        ))}
      </div>
      <div className="mb-4 sm:mb-8 shrink min-h-0 px-1">
        <p className={`${review.text.length > 250 ? 'text-sm sm:text-base' : review.text.length > 150 ? 'text-base sm:text-lg' : 'text-lg sm:text-xl'} text-stone-800 italic leading-relaxed text-center font-serif whitespace-pre-wrap break-words line-clamp-[12]`}>
          "{review.text}"
        </p>
      </div>
      <div className="font-medium text-brand text-center text-xs sm:text-sm uppercase tracking-widest font-bold shrink-0">
        — {review.name}
      </div>
    </motion.div>
  );
}

function FeaturedReviewsScrollContent({ reviews }: { reviews: Review[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 300,
    damping: 40,
    restDelta: 0.001
  });

  return (
    <section 
      ref={containerRef} 
      className="relative z-10"
      style={{ height: `${Math.max(reviews.length * 50, 100)}vh` }}
    >
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden pt-12">
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
          <h2 className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-[7vw] font-black text-stone-900 whitespace-nowrap px-4">
            ERFAHRUNGEN
          </h2>
        </div>

        <div className="relative w-full max-w-4xl mx-auto px-4 perspective-1000">
          <div className="text-center mb-16 relative z-20">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-stone-900 mb-4">Das sagen unsere Adoptanten</h2>
            <p className="text-stone-500">Blättern Sie durch ein paar unserer liebsten Rückmeldungen.</p>
          </div>

          <div className="relative h-[65vh] min-h-[350px] max-h-[480px] w-full max-w-2xl mx-auto flex justify-center pb-12">
            {reviews.map((review, index) => (
              <ReviewCard 
                key={review.id} 
                review={review} 
                index={index} 
                totalCards={reviews.length} 
                smoothProgress={smoothProgress} 
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function FeaturedReviewsScroll() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const q = query(
          collection(db, 'reviews'),
          where('featured', '==', true)
        );
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Review[];
        setReviews(data.filter(r => !r.isDeleted));
      } catch (error) {
        console.error("Error fetching featured reviews: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  if (loading || reviews.length === 0) return null;

  return <FeaturedReviewsScrollContent reviews={reviews} />;
}
