import React, { useState } from 'react';
import { Animal } from '../types';
import { motion } from 'motion/react';
import { Check, Send, X, LogIn } from 'lucide-react';
import { collection, doc, setDoc, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ImageSlider } from './ImageSlider';

export default function AnimalModal({ animal, onClose }: { animal: Animal; onClose: () => void }) {
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [existingInquiry, setExistingInquiry] = useState<any>(null);
  const [loadingExisting, setLoadingExisting] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [motivation, setMotivation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    if (user && animal) {
      setLoadingExisting(true);
        const q = query(
          collection(db, 'inquiries'), 
          where('userId', '==', user.uid),
          where('animalId', '==', animal.id)
        );
        unsubscribe = onSnapshot(q, (snap) => {
          if (!snap.empty) {
            const activeInquiry = snap.docs.map(d => d.data()).find((doc: any) => doc.status !== 'deleted');
            setExistingInquiry(activeInquiry || null);
          } else {
            setExistingInquiry(null);
          }
          setLoadingExisting(false);
        }, (err) => {
          console.error(err);
          setLoadingExisting(false);
        });
    }
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    }
  }, [user, animal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const wordCount = motivation.trim().split(/\s+/).filter(word => word.length > 0).length;
    if (wordCount > 500) {
      setError(`Bitte kürzen Sie Ihre Vorstellung auf maximal 500 Wörter. Aktuell: ${wordCount} Wörter.`);
      return;
    }

    setIsSubmitting(true);
    setError('');
    
    try {
      const newInquiryRef = doc(collection(db, 'inquiries'));
      const inquiryData: any = {
        animalId: animal.id,
        animalName: animal.name,
        name,
        email,
        phone,
        motivation,
        createdAt: Date.now()
      };
      
      if (user) {
        inquiryData.userId = user.uid;
      }

      await setDoc(newInquiryRef, inquiryData);

      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError('Ein Fehler ist aufgetreten: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const BooleanCheck = ({ label, value }: { label: string, value?: boolean }) => (
    <div className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl border bg-white ${value ? 'border-brand text-brand shadow-sm' : 'border-stone-200 text-stone-400'}`}>
        <span className="text-xs sm:text-sm font-bold mb-1">{label}</span>
        {value ? <Check className="w-5 h-5 sm:w-6 sm:h-6" /> : <X className="w-5 h-5 sm:w-6 sm:h-6" />}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 sm:px-6 py-6 sm:py-12">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="bg-white rounded-3xl w-full max-w-4xl max-h-full overflow-y-auto relative z-10 shadow-2xl flex flex-col md:flex-row"
      >
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-10 h-10 bg-white rounded-full flex items-center justify-center text-stone-600 hover:text-stone-900 shadow-sm"
        >
            <X className="w-6 h-6" />
        </button>

        {!showInquiryForm ? (
          <>
            <div className={`w-full md:w-2/5 aspect-square relative shrink-0 overflow-hidden ${animal.imageUrls && animal.imageUrls.length > 1 ? 'md:aspect-auto' : 'md:aspect-auto'} bg-stone-100`}>
                {animal.imageUrls && animal.imageUrls.length > 1 ? (
                  <ImageSlider 
                    imageUrls={animal.imageUrls} 
                    alt={animal.name} 
                  />
                ) : animal.imageUrl || (animal.imageUrls && animal.imageUrls.length === 1) ? (
                  <img 
                    src={animal.imageUrls && animal.imageUrls.length === 1 ? animal.imageUrls[0] : animal.imageUrl || ''} 
                    alt={animal.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-400">
                    Kein Bild vorhanden
                  </div>
                )}
            </div>
            <div className="p-6 sm:p-8 md:p-10 w-full flex flex-col">
                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="bg-stone-100 text-stone-600 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase">
                            {animal.status}
                        </span>
                    </div>
                    <h2 className="font-display text-3xl sm:text-4xl font-black text-stone-900 mb-2">{animal.name}</h2>
                    
                    {animal.bundleSize && animal.bundleSize > 1 && animal.bundleAnimals ? (
                        <div className="flex flex-col gap-4 mt-6">
                          {animal.bundleAnimals.map((bundleAnimal, index) => (
                            <div key={index} className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
                               <h3 className="font-bold text-lg text-stone-900 mb-2">{bundleAnimal.name}</h3>
                               <div className="flex flex-wrap gap-4 text-stone-500 font-medium text-sm mb-4">
                                  {bundleAnimal.gender && (
                                    <span className="flex items-center gap-1.5">
                                      {bundleAnimal.gender === 'Männlich' && (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-sky-400">
                                          <circle cx="10" cy="14" r="5" />
                                          <path d="m14 10 7-7" />
                                          <path d="M16 3h5v5" />
                                        </svg>
                                      )}
                                      {bundleAnimal.gender === 'Weiblich' && (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-pink-400">
                                          <circle cx="12" cy="9" r="5" />
                                          <path d="M12 14v7" />
                                          <path d="M9 18h6" />
                                        </svg>
                                      )}
                                      {bundleAnimal.gender !== 'Männlich' && bundleAnimal.gender !== 'Weiblich' && '⚧️ '}
                                      {bundleAnimal.gender}
                                    </span>
                                  )}
                                  {bundleAnimal.age && <span>🐾 Alter: {bundleAnimal.age}</span>}
                                  {bundleAnimal.weight && <span>⚖️ Gewicht: {bundleAnimal.weight}</span>}
                               </div>
                               <div className="grid grid-cols-4 gap-2">
                                  <BooleanCheck label="Kastriert" value={bundleAnimal.castrated} />
                                  <BooleanCheck label="Entwurmt" value={bundleAnimal.dewormed} />
                                  <BooleanCheck label="Gechipt" value={bundleAnimal.chipped} />
                                  <BooleanCheck label="Geimpft" value={bundleAnimal.vaccinated} />
                               </div>
                            </div>
                          ))}
                        </div>
                    ) : (
                      <>
                        <div className="flex flex-wrap gap-4 text-stone-500 font-medium text-sm sm:text-base mb-6">
                            {animal.gender && (
                              <span className="flex items-center gap-1.5">
                                {animal.gender === 'Männlich' && (
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-sky-400">
                                    <circle cx="10" cy="14" r="5" />
                                    <path d="m14 10 7-7" />
                                    <path d="M16 3h5v5" />
                                  </svg>
                                )}
                                {animal.gender === 'Weiblich' && (
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-pink-400">
                                    <circle cx="12" cy="9" r="5" />
                                    <path d="M12 14v7" />
                                    <path d="M9 18h6" />
                                  </svg>
                                )}
                                {animal.gender !== 'Männlich' && animal.gender !== 'Weiblich' && '⚧️ '}
                                {animal.gender}
                              </span>
                            )}
                            {animal.age && <span>🐾 Alter: {animal.age}</span>}
                            {animal.weight && <span>⚖️ Gewicht: {animal.weight}</span>}
                        </div>
                        <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-8">
                            <BooleanCheck label="Kastriert" value={animal.castrated} />
                            <BooleanCheck label="Entwurmt" value={animal.dewormed} />
                            <BooleanCheck label="Gechipt" value={animal.chipped} />
                            <BooleanCheck label="Geimpft" value={animal.vaccinated} />
                        </div>
                      </>
                    )}
                </div>

                <div className="prose prose-stone prose-sm sm:prose-base mb-8 flex-1 w-full max-w-none">
                    <p className="whitespace-pre-wrap">{animal.description}</p>
                </div>

                {loadingExisting ? (
                    <div className="w-full text-center py-4 text-stone-500">Prüfe Status...</div>
                ) : existingInquiry ? (
                    <div className="w-full bg-brand/10 text-brand py-4 rounded-2xl font-bold text-center border border-brand/20 flex flex-col items-center gap-2 mt-auto">
                        <Check className="w-6 h-6" />
                        Sie haben bereits eine Anfrage für dieses Tier gesendet.
                        <span className="text-xs font-medium text-stone-600 mt-1">Gehen Sie zu "Meine Anfragen", um diese zu bearbeiten.</span>
                    </div>
                ) : (
                    <button 
                        onClick={() => {
                               setShowInquiryForm(true);
                        }}
                        className="w-full bg-brand text-white py-4 rounded-2xl font-bold text-lg hover:bg-brand-hover transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform duration-200 mt-auto flex items-center justify-center gap-2"
                    >
                        Ich möchte {animal.name} adoptieren
                    </button>
                )}
            </div>
          </>
        ) : (
          <div className="p-6 sm:p-10 w-full relative">
              <button 
                  onClick={() => setShowInquiryForm(false)}
                  className="mb-8 text-stone-500 hover:text-stone-900 font-medium text-sm flex items-center gap-2 transition-colors"
                  disabled={success}
              >
                  ← Zurück zu {animal.name}
              </button>
              
              {success ? (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12">
                      <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Check className="w-10 h-10" />
                      </div>
                      <h3 className="font-display text-2xl font-bold text-stone-900 mb-4">Vielen Dank für Ihre Anfrage!</h3>
                      <p className="text-stone-600 max-w-md mx-auto mb-8">
                          Wir haben Ihre Nachricht erhalten und melden uns so schnell wie möglich bei Ihnen bezüglich {animal.name}. Sie können Ihre Anfrage jederzeit unter Profil/Home einsehen und verwalten.
                      </p>
                      <button onClick={onClose} className="px-8 py-3 bg-stone-900 text-white rounded-xl font-bold hover:bg-stone-800 transition-colors">
                          Fenster schließen
                      </button>
                  </motion.div>
              ) : (
                  <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleSubmit} className="w-full max-w-lg mx-auto">
                      <h3 className="font-display text-2xl font-black text-stone-900 mb-2">Anfrage für {animal.name}</h3>
                      <p className="text-stone-500 text-sm mb-6">Erzählen Sie uns etwas über sich und warum Sie der perfekten Platz für {animal.name} sind.</p>
                      
                      {error && <p className="mb-4 text-red-600 font-medium bg-red-50 p-3 rounded-lg text-sm">{error}</p>}
                      
                      <div className="space-y-5">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                              <div>
                                  <label className="block text-sm font-bold text-stone-700 mb-2">Ihr Name *</label>
                                  <input type="text" required value={name} onChange={e => setName(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand bg-stone-50" />
                              </div>
                              <div>
                                  <label className="block text-sm font-bold text-stone-700 mb-2">Telefonnummer *</label>
                                  <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand bg-stone-50" />
                              </div>
                          </div>
                          <div>
                              <label className="block text-sm font-bold text-stone-700 mb-2">Ihre E-Mail (optional)</label>
                              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand bg-stone-50" />
                          </div>
                          <div>
                              <div className="flex justify-between items-baseline mb-2">
                                  <label className="block text-sm font-bold text-stone-700">Kurze Vorstellung *</label>
                                  <span className={`text-xs ${motivation.trim().split(/\s+/).filter(w => w.length > 0).length > 500 ? 'text-red-500 font-bold' : 'text-stone-500'}`}>
                                      {motivation.trim().split(/\s+/).filter(w => w.length > 0).length} / 500 Wörter
                                  </span>
                              </div>
                              <p className="text-xs text-stone-500 mb-2">Wer gehört zur Familie? Wie leben Sie (Haus/Wohnung)? Warum {animal.name}?</p>
                              <textarea required rows={5} value={motivation} onChange={e => setMotivation(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand bg-stone-50 resize-none" />
                          </div>
                          <button type="submit" disabled={isSubmitting} className="w-full bg-brand text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-brand-hover transition-colors disabled:opacity-50">
                              {isSubmitting ? "Wird gesendet..." : <><Send className="w-5 h-5" /> Anfrage absenden</>}
                          </button>
                      </div>
                  </motion.form>
              )}
          </div>
        )}

      </motion.div>
    </div>
  );
}
