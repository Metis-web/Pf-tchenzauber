import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { Edit, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';

export default function AdminBlogs() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBlogId, setCurrentBlogId] = useState<string | null>(null);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setBlogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter((blog: any) => !blog.isDeleted));
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
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      const newImages: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const resized = await resizeImage(files[i]);
        newImages.push(resized);
      }
      setImageUrls(prev => [...prev, ...newImages]);
    } catch (err) {
      console.error(err);
    }
  };

  const removeImage = (index: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (currentBlogId) {
        await updateDoc(doc(db, 'blogs', currentBlogId), {
          title, content, imageUrls, imageUrl: imageUrls.length > 0 ? (imageUrls[0] || null) : null
        });
      } else {
        await addDoc(collection(db, 'blogs'), {
          title, content, imageUrls, imageUrl: imageUrls.length > 0 ? (imageUrls[0] || null) : null, createdAt: Date.now()
        });
      }
      resetForm();
    } catch (err) {
      console.error(err);
    } finally { setIsSubmitting(false); }
  };

  const editBlog = (blog: any) => {
    setCurrentBlogId(blog.id);
    setTitle(blog.title);
    setContent(blog.content);
    if (blog.imageUrls && blog.imageUrls.length > 0) {
      setImageUrls(blog.imageUrls);
    } else if (blog.imageUrl) {
      setImageUrls([blog.imageUrl]);
    } else {
      setImageUrls([]);
    }
    setIsEditing(true);
  };

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const deleteBlog = async (id: string) => {
    await updateDoc(doc(db, 'blogs', id), { isDeleted: true });
    setDeletingId(null);
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentBlogId(null);
    setTitle('');
    setContent('');
    setImageUrls([]);
  };

  if (loading) return <div>Lade Blogs...</div>;

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex justify-between items-center">
        <h2 className="font-display text-2xl font-bold text-stone-900">Blog verwalten</h2>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="bg-brand text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold hover:bg-brand-hover">
            <Plus className="w-4 h-4" /> Neuer Eintrag
          </button>
        )}
      </div>

      {isEditing && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border shadow-sm space-y-4">
          <h3 className="font-bold text-lg">{currentBlogId ? 'Eintrag bearbeiten' : 'Neuer Eintrag'}</h3>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Titel</label>
            <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-2 rounded-xl border focus:ring-brand" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Bilder</label>
            {imageUrls.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {imageUrls.map((url, i) => (
                  <div key={i} className="relative">
                    <img src={url} className="w-32 h-32 object-cover rounded-xl" alt="Preview"/>
                    <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"><Trash2 className="w-3 h-3"/></button>
                  </div>
                ))}
              </div>
            )}
            <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="block w-full text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-brand/10 file:text-brand hover:file:bg-brand/20 cursor-pointer" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Inhalt</label>
            <textarea required rows={5} value={content} onChange={e => setContent(e.target.value)} className="w-full px-4 py-2 rounded-xl border focus:ring-brand" />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={isSubmitting} className="bg-brand text-white px-6 py-2 rounded-xl font-bold hover:bg-brand-hover">{isSubmitting ? 'Speichert...' : 'Speichern'}</button>
            <button type="button" onClick={resetForm} className="bg-stone-100 text-stone-700 px-6 py-2 rounded-xl font-bold">Abbrechen</button>
          </div>
        </form>
      )}

      {!isEditing && (
        <div className="space-y-4">
          {blogs.length === 0 ? <p className="text-stone-500">Noch keine Blogeinträge vorhanden.</p> : blogs.map(blog => (
            <div key={blog.id} className="bg-white p-4 rounded-3xl border shadow-sm flex items-center justify-between gap-4">
               {((blog.imageUrls && blog.imageUrls.length > 0) || blog.imageUrl) ? <img src={blog.imageUrls && blog.imageUrls.length > 0 ? blog.imageUrls[0] : blog.imageUrl} className="w-16 h-16 rounded-xl object-cover" alt="" /> : <div className="w-16 h-16 rounded-xl bg-stone-100 flex items-center justify-center"><ImageIcon className="text-stone-400" /></div>}
               <div className="flex-1">
                 <h4 className="font-bold text-stone-900">{blog.title}</h4>
                 <p className="text-sm text-stone-500">{new Date(blog.createdAt).toLocaleDateString()}</p>
               </div>
               <div className="flex gap-2">
                 <button onClick={() => editBlog(blog)} className="p-2 text-stone-400 hover:text-brand"><Edit className="w-5 h-5"/></button>
                 {deletingId === blog.id ? (
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-red-500">Wirklich?</span>
                        <button onClick={() => deleteBlog(blog.id)} className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">Ja</button>
                        <button onClick={() => setDeletingId(null)} className="bg-stone-200 text-stone-700 px-2 py-1 rounded text-xs font-bold">Nein</button>
                    </div>
                 ) : (
                    <button onClick={() => setDeletingId(blog.id)} className="p-2 text-stone-400 hover:text-red-500"><Trash2 className="w-5 h-5"/></button>
                 )}
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
