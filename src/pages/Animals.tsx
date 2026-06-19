import React, { useEffect, useState } from "react";
import { Animal } from "../types";
import { motion, AnimatePresence } from "motion/react";
import AnimalModal from "../components/AnimalModal";
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';
import { ImageSlider } from '../components/ImageSlider';
import { useSiteTexts } from '../hooks/useSiteTexts';

export default function Animals() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const texts = useSiteTexts();
  const [loading, setLoading] = useState(true);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'animals'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Animal[];
      setAnimals(fetched.filter(a => !a.isDeleted));
      setLoading(false);
    }, (error) => {
      console.error("Failed to fetch animals:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-stone-500">Lade unsere Tiere...</p>
      </div>
    );
  }

  const containerParams = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemParams = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="font-display text-4xl font-black text-stone-900 mb-4">{texts.animalsTitle || "Unsere Schützlinge"}</h1>
        <p className="text-stone-600 max-w-2xl mx-auto text-lg">
          {texts.animalsSub || "Diese wundervollen Seelen warten auf ihr Für-Immer-Zuhause."}
        </p>
      </motion.div>

      {animals.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-center py-12 bg-white rounded-3xl border border-stone-100 shadow-sm"
        >
          <p className="text-stone-500 text-lg">Derzeit haben wir alle unsere Tiere erfolgreich vermittelt!</p>
          <p className="text-stone-400 mt-2">Schauen Sie bald wieder vorbei.</p>
        </motion.div>
      ) : (
        <motion.div 
          variants={containerParams}
          initial="hidden"
          animate="show"
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {animals.map(animal => (
            <motion.div variants={itemParams} key={animal.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-stone-100 flex flex-col group hover:shadow-md transition-shadow">
              <div className="aspect-[4/3] bg-stone-100 overflow-hidden relative">
                <div className="w-full h-full cursor-pointer" onClick={() => setSelectedAnimal(animal)}>
                  <ImageSlider 
                    imageUrls={animal.imageUrls && animal.imageUrls.length > 0 ? animal.imageUrls : (animal.imageUrl ? [animal.imageUrl] : [])} 
                    alt={animal.name} 
                  />
                </div>
                {animal.status && (
                  <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-xs font-bold text-brand shadow-sm">
                    {animal.status}
                  </div>
                )}
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4 gap-2">
                  <h3 className="font-display text-2xl font-black text-stone-900 flex flex-wrap items-center gap-x-2">
                    {animal.name}
                    {animal.gender === 'Männlich' && (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-sky-400">
                        <circle cx="10" cy="14" r="5" />
                        <path d="m14 10 7-7" />
                        <path d="M16 3h5v5" />
                      </svg>
                    )}
                    {animal.gender === 'Weiblich' && (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-pink-400">
                        <circle cx="12" cy="9" r="5" />
                        <path d="M12 14v7" />
                        <path d="M9 18h6" />
                      </svg>
                    )}
                  </h3>
                  {animal.age && <span className="text-sm font-medium text-stone-500 bg-stone-100 px-2 py-1 rounded-md shrink-0 mt-1">{animal.age}</span>}
                </div>
                <p className="text-stone-600 flex-1 whitespace-pre-wrap line-clamp-4">{animal.description}</p>
                <button 
                  onClick={() => setSelectedAnimal(animal)}
                  className="mt-6 w-full py-3 bg-brand-light text-brand font-medium rounded-xl hover:bg-brand hover:text-white transition-colors"
                >
                  <span className="hidden sm:inline">Weitere Infos & Anfrage</span>
                  <span className="sm:hidden">Infos & Anfrage</span>
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      <AnimatePresence>
        {selectedAnimal && (
          <AnimalModal animal={selectedAnimal} onClose={() => setSelectedAnimal(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
