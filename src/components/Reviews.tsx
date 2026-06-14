import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Send, Trash2 } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, Timestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

interface Review {
  id: string;
  name: string;
  rating: number;
  text: string;
  createdAt?: Timestamp;
  isDeleted?: boolean;
}

export default function Reviews() {
  const { isAdmin } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);

  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedReviews = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Review[];
      setReviews(fetchedReviews.filter(r => !r.isDeleted));
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !text.trim()) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'reviews'), {
        name,
        text,
        rating,
        createdAt: serverTimestamp()
      });
      setName('');
      setText('');
      setRating(5);
      setShowForm(false);
      setSuccessMsg('Ihre Bewertung wurde erfolgreich gesendet. Vielen Dank!');
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (error) {
      console.error("Error adding review: ", error);
      setError("Es gab einen Fehler beim Senden.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin) return;
    try {
      await updateDoc(doc(db, 'reviews', id), { isDeleted: true });
    } catch (error) {
      console.error("Error deleting review: ", error);
    }
  };

  return (
    <section className="py-24 relative z-10" id="bewertungen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl sm:text-4xl font-black text-stone-900 mb-4">Möchten Sie Ihre Erfahrungen teilen?</h2>
          <p className="text-stone-600 mb-8">Wir freuen uns über das Feedback unserer Adoptanten.</p>
          
          <button 
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 bg-brand hover:bg-brand-hover text-white px-8 py-4 rounded-full font-bold transition-colors"
          >
            {showForm ? 'Bewertung abbrechen' : 'Eigene Bewertung schreiben'}
          </button>
        </motion.div>

        <AnimatePresence>
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-2xl mx-auto mb-8 bg-green-50 text-green-700 p-4 rounded-xl text-center border border-green-200"
            >
              {successMsg}
            </motion.div>
          )}

          {showForm && (
            <motion.form 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleSubmit}
              className="max-w-2xl mx-auto mb-16 bg-stone-50 p-6 sm:p-8 rounded-3xl border border-stone-100 shadow-sm overflow-hidden"
            >
              <h3 className="font-bold text-xl mb-6">Wie waren Ihre Erfahrungen?</h3>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-stone-700 mb-2">Bewertung</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      className="focus:outline-none transition-transform hover:scale-110"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                    >
                      <Star 
                        className={`w-8 h-8 ${
                          (hoverRating || rating) >= star ? 'text-yellow-400 fill-current' : 'text-stone-300'
                        }`} 
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-stone-700 mb-2">Name</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent" 
                  placeholder="Ihr Name (z.B. Max Mustermann)"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-stone-700 mb-2">Erfahrungsbericht</label>
                <textarea 
                  required
                  rows={4}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent resize-none" 
                  placeholder="Erzählen Sie uns von Ihrer Erfahrung..."
                />
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-brand hover:bg-brand-hover text-white px-6 py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Wird gesendet...' : <><Send className="w-4 h-4" /> Bewertung absenden</>}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-8 border border-red-100 flex items-center gap-3 justify-center max-w-xl mx-auto">
            {error}
          </div>
        )}
      </div>
    </section>
  );
}
