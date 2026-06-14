import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { Edit, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';

export default function AdminTeam() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentMemberId, setCurrentMemberId] = useState<string | null>(null);
  
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'teamMembers'), orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setMembers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter((m: any) => !m.isDeleted));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
          } else {
            if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const resized = await resizeImage(file);
      setImageUrl(resized);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (currentMemberId) {
        await updateDoc(doc(db, 'teamMembers', currentMemberId), {
          name, role, description, imageUrl
        });
      } else {
        await addDoc(collection(db, 'teamMembers'), {
          name, role, description, imageUrl, createdAt: Date.now()
        });
      }
      resetForm();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const editMember = (member: any) => {
    setCurrentMemberId(member.id);
    setName(member.name);
    setRole(member.role);
    setDescription(member.description);
    setImageUrl(member.imageUrl || '');
    setIsEditing(true);
  };

  const deleteMember = async (id: string) => {
    await updateDoc(doc(db, 'teamMembers', id), { isDeleted: true });
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentMemberId(null);
    setName('');
    setRole('');
    setDescription('');
    setImageUrl('');
  };

  if (loading) return <div>Lade Team...</div>;

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div>
        <h3 className="font-bold text-lg mb-4">{isEditing ? 'Team-Mitglied bearbeiten' : 'Neues Mitglied'}</h3>
        <form onSubmit={handleSubmit} className="bg-stone-50 p-6 rounded-3xl space-y-4 border border-stone-200">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Name</label>
            <input required value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2 rounded-xl border focus:ring-brand" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Rolle (z.B. Vorstand, Pflegestelle)</label>
            <input required value={role} onChange={e => setRole(e.target.value)} className="w-full px-4 py-2 rounded-xl border focus:ring-brand" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Bild</label>
            {imageUrl && <img src={imageUrl} className="w-32 h-32 object-cover rounded-xl mb-2" alt="Preview"/>}
            <input type="file" accept="image/*" onChange={handleImageUpload} className="block w-full text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-brand/10 file:text-brand hover:file:bg-brand/20 cursor-pointer" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Beschreibung</label>
            <textarea required value={description} onChange={e => setDescription(e.target.value)} rows={5} className="w-full px-4 py-2 rounded-xl border focus:ring-brand" />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={isSubmitting} className="flex-1 bg-brand hover:bg-brand-hover text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50">
              {isEditing ? 'Speichern' : 'Hinzufügen'}
            </button>
            {isEditing && (
              <button type="button" onClick={resetForm} className="px-6 bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold py-3 rounded-xl transition-colors">
                Abbrechen
              </button>
            )}
          </div>
        </form>
      </div>
      
      <div>
        <h3 className="font-bold text-lg mb-4">Veröffentlichte Mitglieder</h3>
        <div className="space-y-4">
          {members.length === 0 ? <p className="text-stone-500">Noch keine Mitglieder vorhanden.</p> : members.map(member => (
            <div key={member.id} className="bg-white p-4 rounded-3xl border shadow-sm flex items-center justify-between gap-4">
               {member.imageUrl ? <img src={member.imageUrl} className="w-16 h-16 rounded-xl object-cover" alt="" /> : <div className="w-16 h-16 rounded-xl bg-stone-100 flex items-center justify-center"><ImageIcon className="text-stone-400" /></div>}
               <div className="flex-1">
                 <h4 className="font-bold text-stone-900">{member.name}</h4>
                 <p className="text-sm text-stone-500">{member.role}</p>
               </div>
               <div className="flex items-center gap-2">
                 <button onClick={() => editMember(member)} className="p-2 text-stone-400 hover:text-brand"><Edit className="w-5 h-5"/></button>
                 <button onClick={() => deleteMember(member.id)} className="p-2 text-stone-400 hover:text-red-500"><Trash2 className="w-5 h-5"/></button>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
