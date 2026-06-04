import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { Trash2, Edit2, X, Check } from 'lucide-react';

export default function UserInquiries() {
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const [editingInquiry, setEditingInquiry] = useState<any | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editMotivation, setEditMotivation] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'inquiries'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter((doc: any) => doc.status !== 'deleted');
      setInquiries(data);
      setLoading(false);
    }, (error) => {
      console.error(error);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [user]);

  const handleDelete = async (inquiryId: string) => {
    try {
      await updateDoc(doc(db, 'inquiries', inquiryId), { status: 'deleted' });
      setDeletingId(null);
    } catch (err: any) {
      console.error(err);
      setError("Fehler beim Löschen der Anfrage.");
      setDeletingId(null);
    }
  };

  const handleEdit = (inquiry: any) => {
    setEditingInquiry(inquiry);
    setEditName(inquiry.name);
    setEditEmail(inquiry.email);
    setEditPhone(inquiry.phone);
    setEditMotivation(inquiry.motivation);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInquiry) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'inquiries', editingInquiry.id), {
        name: editName,
        email: editEmail,
        phone: editPhone,
        motivation: editMotivation
      });
      setEditingInquiry(null);
    } catch (err: any) {
      console.error(err);
      setError("Fehler beim Speichern der Änderungen.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!user || inquiries.length === 0) return null;

  return (
    <section className="relative py-12 z-10">
      {editingInquiry && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center px-4 py-6">
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={() => setEditingInquiry(null)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-8 relative z-10 shadow-2xl"
          >
            <button onClick={() => setEditingInquiry(null)} className="absolute top-4 right-4 text-stone-400 hover:text-stone-900">
              <X className="w-6 h-6" />
            </button>
            <h3 className="font-display text-2xl font-black text-stone-900 mb-6">Anfrage bearbeiten</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1">Name</label>
                <input required type="text" value={editName} onChange={e => setEditName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-1 focus:ring-brand" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-1">E-Mail (optional)</label>
                  <input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-1 focus:ring-brand" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-1">Telefon</label>
                  <input required type="tel" value={editPhone} onChange={e => setEditPhone(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-1 focus:ring-brand" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1">Nachricht / Über uns</label>
                <textarea required rows={4} value={editMotivation} onChange={e => setEditMotivation(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-1 focus:ring-brand resize-none" />
              </div>
              <button type="submit" disabled={isSaving} className="w-full bg-brand text-white py-4 rounded-xl font-bold hover:bg-brand-hover mt-2">
                {isSaving ? "Speichert..." : "Änderungen speichern"}
              </button>
            </form>
          </motion.div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-display text-2xl font-black text-stone-900 mb-6">Meine Anfragen</h2>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-100 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 font-bold">X</button>
          </div>
        )}
        
        {loading ? (
          <p className="text-stone-500">Lade Anfragen...</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {inquiries.map((inquiry, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={inquiry.id} 
                className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 relative group flex flex-col"
              >
                <div className="flex justify-between items-start mb-4 gap-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-brand mb-1 block">Tier</span>
                    <h3 className="font-display font-bold text-lg text-stone-900 leading-tight">{inquiry.animalName}</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => handleEdit(inquiry)}
                      className="text-stone-300 hover:text-brand hover:bg-brand/10 p-2 rounded-full transition-colors"
                      title="Bearbeiten"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {deletingId === inquiry.id ? (
                      <div className="flex items-center gap-1 bg-red-50 p-1 rounded-full">
                        <button onClick={() => handleDelete(inquiry.id)} className="p-1 text-red-600 hover:bg-red-100 rounded-full" title="Bestätigen">
                           <Check className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeletingId(null)} className="p-1 text-stone-500 hover:bg-stone-200 rounded-full" title="Abbrechen">
                           <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setDeletingId(inquiry.id)}
                        className="text-stone-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                        title="Anfrage löschen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="text-sm text-stone-500 flex-1">
                  <p className="line-clamp-2 italic">"{inquiry.motivation}"</p>
                </div>
                <p className="mt-4 text-xs text-stone-400">Angefragt am {new Date(inquiry.createdAt || 0).toLocaleDateString()}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
