import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Animal, Inquiry, BundleAnimal } from "../types";
import { LogOut, Trash2, Plus, Image as ImageIcon, View, MessageSquare, Edit, BookOpen, Settings } from "lucide-react";
import { collection, deleteDoc, doc, onSnapshot, getDocs, query, orderBy, setDoc, updateDoc, where } from 'firebase/firestore';
import { db, storage } from '../firebase';
import { useAuth } from '../context/AuthContext';
import AdminBlogs from '../components/AdminBlogs';
import AdminTeam from '../components/AdminTeam';
import AdminSettings from '../components/AdminSettings';
import AdminVisualEditor from '../components/AdminVisualEditor';

export default function AdminDashboard() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'animals' | 'inquiries' | 'reviews' | 'blogs' | 'team' | 'settings' | 'visual-editor' | 'trash'>('animals');
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading, logout } = useAuth();

  // Form State
  const [bundleSize, setBundleSize] = useState<number>(1);
  const [bundleData, setBundleData] = useState<BundleAnimal[]>([{
    name: "", age: "", weight: "", gender: "", castrated: false, dewormed: false, chipped: false, vaccinated: false
  }]);
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Sucht Zuhause");
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [animalToDelete, setAnimalToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingAnimalId, setEditingAnimalId] = useState<string | null>(null);

  const [inquiryToDelete, setInquiryToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user || !isAdmin) {
        navigate("/login");
      } else {
        const unsubscribeAnimals = onSnapshot(query(collection(db, 'animals'), orderBy('createdAt', 'desc')), (snapshot) => {
          setAnimals(snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Animal[]);
          setLoading(false);
        }, (error) => {
          console.error(error);
          setLoading(false);
        });

        const unsubscribeInquiries = onSnapshot(query(collection(db, 'inquiries'), orderBy('createdAt', 'desc')), (snapshot) => {
          setInquiries(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        }, (error) => {
          console.error(error);
        });

        const unsubscribeReviews = onSnapshot(query(collection(db, 'reviews'), orderBy('createdAt', 'desc')), (snapshot) => {
          setReviews(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        }, (error) => {
          console.error(error);
        });

        const unsubscribeBlogs = onSnapshot(query(collection(db, 'blogs'), orderBy('createdAt', 'desc')), (snapshot) => {
          setBlogs(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        }, (error) => {
          console.error(error);
        });

        return () => {
          unsubscribeAnimals();
          unsubscribeInquiries();
          unsubscribeReviews();
          unsubscribeBlogs();
        };
      }
    }
  }, [user, isAdmin, authLoading, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      await updateDoc(doc(db, 'animals', id), { isDeleted: true });
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsDeleting(false);
      setAnimalToDelete(null);
    }
  };

  const handleRestoreAnimal = async (id: string) => {
    try {
      await updateDoc(doc(db, 'animals', id), { isDeleted: false });
    } catch (err) {
      console.error(err);
    }
  };

  const handlePermanentDeleteAnimal = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'animals', id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleRestoreBlog = async (id: string) => {
    try {
      await updateDoc(doc(db, 'blogs', id), { isDeleted: false });
    } catch (err) {
      console.error(err);
    }
  };

  const handlePermanentDeleteBlog = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'blogs', id));
    } catch (err) {
      console.error(err);
    }
  };

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
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleEditClick = (animal: Animal) => {
    setEditingAnimalId(animal.id);
    setBundleSize(animal.bundleSize || 1);
    if (animal.bundleAnimals && animal.bundleAnimals.length > 0) {
      setBundleData(animal.bundleAnimals);
    } else {
      setBundleData([{
        name: animal.name,
        age: animal.age,
        weight: animal.weight || "",
        gender: animal.gender || "",
        castrated: animal.castrated || false,
        dewormed: animal.dewormed || false,
        chipped: animal.chipped || false,
        vaccinated: animal.vaccinated || false,
      }]);
    }
    setDescription(animal.description);
    setStatus(animal.status);
    setImages([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingAnimalId(null);
    setBundleSize(1);
    setBundleData([{
      name: "", age: "", weight: "", gender: "", castrated: false, dewormed: false, chipped: false, vaccinated: false
    }]);
    setDescription("");
    setStatus("Sucht Zuhause");
    setImages([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    setIsSubmitting(true);
    setUploadMessage("");
    
    try {
      let imageUrls: string[] = [];
      if (images.length > 0) {
        setUploadMessage("Verarbeite Bilder...");
        const imagePromises = images.slice(0, 5).map(async (img: File) => {
          try {
             return await resizeImage(img);
          } catch (e) {
             console.error("Failed to resize and convert image", e);
             return null;
          }
        });
        const results = await Promise.all(imagePromises);
        imageUrls = results.filter((url): url is string => url !== null);
      }

      setUploadMessage("Speichere Daten...");
      const relevantBundleData = bundleData.slice(0, bundleSize);
      const combinedName = relevantBundleData.map(b => b.name).join(" & ");
      const combinedAge = bundleSize === 1 ? relevantBundleData[0].age : relevantBundleData.map(b => b.age).join(", ");
      
      const updateData: any = {
        name: combinedName,
        description,
        age: combinedAge,
        gender: relevantBundleData[0].gender,
        weight: relevantBundleData[0].weight,
        status,
        castrated: relevantBundleData[0].castrated,
        dewormed: relevantBundleData[0].dewormed,
        chipped: relevantBundleData[0].chipped,
        vaccinated: relevantBundleData[0].vaccinated,
        bundleSize: bundleSize,
        bundleAnimals: relevantBundleData
      };

      let animalDocId = editingAnimalId;

      if (editingAnimalId) {
        if (imageUrls.length > 0) {
          updateData.imageUrl = imageUrls[0];
          updateData.imageUrls = imageUrls;
        }
        await updateDoc(doc(db, 'animals', editingAnimalId), updateData);
      } else {
        const newAnimalRef = doc(collection(db, 'animals'));
        animalDocId = newAnimalRef.id;
        await setDoc(newAnimalRef, {
          ...updateData,
          imageUrl: imageUrls.length > 0 ? imageUrls[0] : null,
          imageUrls: imageUrls,
          createdAt: Date.now()
        });
      }

      // Reset form
      handleCancelEdit();
      // Removed manual fetch since onSnapshot triggers automatically
      setUploadMessage("");
    } catch (err) {
      console.error(err);
      setUploadMessage("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteInquiry = async (id: string) => {
    try {
      await updateDoc(doc(db, 'inquiries', id), { status: 'deleted' });
      setInquiryToDelete(null);
    } catch (err: any) {
      console.error(err);
      setInquiryToDelete(null);
    }
  };

  const handleRestoreInquiry = async (id: string) => {
    try {
      await updateDoc(doc(db, 'inquiries', id), { status: 'pending' });
    } catch (err) {
      console.error(err);
    }
  };

  const handlePermanentDeleteInquiry = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'inquiries', id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleFeatureReview = async (id: string, currentStatus: boolean) => {
    try {
      if (!currentStatus) {
        const featuredCount = reviews.filter(r => r.featured).length;
        if (featuredCount >= 10) {
          return;
        }
      }
      await updateDoc(doc(db, 'reviews', id), { featured: !currentStatus });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteReview = async (id: string) => {
    try {
      await updateDoc(doc(db, 'reviews', id), { isDeleted: true });
    } catch (err) {
      console.error(err);
    }
  };

  const handleRestoreReview = async (id: string) => {
    try {
      await updateDoc(doc(db, 'reviews', id), { isDeleted: false });
    } catch (err) {
      console.error(err);
    }
  };

  const handlePermanentDeleteReview = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'reviews', id));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || authLoading) return <div className="p-8 text-center text-stone-500">Lade Dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
            <h1 className="font-display text-3xl font-bold text-stone-900 mb-2">Admin Dashboard</h1>
            <p className="text-stone-500">Tiere verwalten und neue Inserate erstellen.</p>
        </div>
        <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg font-medium transition-colors"
        >
          <LogOut className="w-4 h-4" /> Abmelden
        </button>
      </div>

      <div className="flex gap-2 sm:gap-4 mb-8 border-b border-stone-200 overflow-x-auto whitespace-nowrap -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
        <button 
          onClick={() => setActiveTab('animals')}
          className={`py-3 px-4 font-bold border-b-2 transition-colors shrink-0 ${activeTab === 'animals' ? 'border-brand text-brand font-black' : 'border-transparent text-stone-500 hover:text-stone-700'}`}
        >
          Tiere verwalten
        </button>
        <button 
          onClick={() => setActiveTab('inquiries')}
          className={`py-3 px-4 font-bold border-b-2 transition-colors flex items-center gap-2 shrink-0 ${activeTab === 'inquiries' ? 'border-brand text-brand font-black' : 'border-transparent text-stone-500 hover:text-stone-700'}`}
        >
          Anfragen <span className="bg-stone-100 text-stone-600 text-xs px-2 py-0.5 rounded-full">{inquiries.length}</span>
        </button>
        <button 
          onClick={() => setActiveTab('reviews')}
          className={`py-3 px-4 font-bold border-b-2 transition-colors flex items-center gap-2 shrink-0 ${activeTab === 'reviews' ? 'border-brand text-brand font-black' : 'border-transparent text-stone-500 hover:text-stone-700'}`}
        >
          Bewertungen
        </button>
        <button 
          onClick={() => setActiveTab('blogs')}
          className={`py-3 px-4 font-bold border-b-2 transition-colors flex items-center gap-2 shrink-0 ${activeTab === 'blogs' ? 'border-brand text-brand font-black' : 'border-transparent text-stone-500 hover:text-stone-700'}`}
        >
          Blog
        </button>
        <button 
          onClick={() => setActiveTab('team')}
          className={`py-3 px-4 font-bold border-b-2 transition-colors flex items-center gap-2 shrink-0 ${activeTab === 'team' ? 'border-brand text-brand font-black' : 'border-transparent text-stone-500 hover:text-stone-700'}`}
        >
          Team
        </button>
        <button 
          onClick={() => setActiveTab('visual-editor')}
          className={`py-3 px-4 font-bold border-b-2 transition-colors flex items-center gap-2 shrink-0 ${activeTab === 'visual-editor' ? 'border-brand text-brand font-black' : 'border-transparent text-stone-500 hover:text-stone-700'}`}
        >
          Website-Bearbeiten
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`py-3 px-4 font-bold border-b-2 transition-colors flex items-center gap-2 shrink-0 ${activeTab === 'settings' ? 'border-brand text-brand font-black' : 'border-transparent text-stone-500 hover:text-stone-700'}`}
        >
          Einstellungen
        </button>
        <button 
          onClick={() => setActiveTab('trash')}
          className={`py-3 px-4 font-bold border-b-2 transition-colors flex items-center gap-2 shrink-0 ${activeTab === 'trash' ? 'border-brand text-brand font-black' : 'border-transparent text-stone-500 hover:text-stone-700'}`}
        >
          Papierkorb
        </button>
      </div>

      {activeTab === 'animals' ? (
        <div className="flex flex-col-reverse lg:grid lg:grid-cols-3 gap-12 items-start">
          {/* Add/Edit Animal Form */}
          <div className="lg:col-span-1 bg-white p-6 sm:p-8 rounded-3xl border border-stone-100 shadow-sm lg:sticky lg:top-24 w-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-display text-xl font-bold text-stone-900 flex items-center gap-2">
                    {editingAnimalId ? <Edit className="w-5 h-5 text-brand" /> : <Plus className="w-5 h-5 text-brand" />} 
                    {editingAnimalId ? "Tier bearbeiten" : "Neues Tier"}
                </h2>
                {editingAnimalId && (
                  <button onClick={handleCancelEdit} type="button" className="text-sm text-stone-500 hover:text-stone-900">
                    Abbrechen
                  </button>
                )}
              </div>
              <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Anzahl der Tiere (Bundle)</label>
                      <select value={bundleSize} onChange={e => {
                        const newSize = parseInt(e.target.value);
                        setBundleSize(newSize);
                        setBundleData(prev => {
                          const newData = [...prev];
                          while (newData.length < newSize) {
                            newData.push({ name: "", age: "", weight: "", gender: "", castrated: false, dewormed: false, chipped: false, vaccinated: false });
                          }
                          return newData.slice(0, newSize);
                        });
                      }} className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand bg-white">
                        <option value={1}>1 Tier</option>
                        <option value={2}>2 Tiere</option>
                        <option value={3}>3 Tiere</option>
                        <option value={4}>4 Tiere</option>
                        <option value={5}>5 Tiere</option>
                      </select>
                  </div>

                  {bundleData.slice(0, bundleSize).map((animal, index) => (
                    <div key={index} className="space-y-4 p-4 bg-stone-50 rounded-2xl border border-stone-100">
                      <h4 className="font-bold text-stone-900 border-b border-stone-200 pb-2">
                        {bundleSize > 1 ? `Tier ${index + 1}` : "Tier Details"}
                      </h4>
                      <div>
                          <label className="block text-sm font-medium text-stone-700 mb-1">Name *</label>
                          <input type="text" required value={animal.name} onChange={e => {
                            const newBundle = [...bundleData];
                            newBundle[index].name = e.target.value;
                            setBundleData(newBundle);
                          }}
                                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-medium text-stone-700 mb-1">Alter</label>
                              <input type="text" value={animal.age} onChange={e => {
                                const newBundle = [...bundleData];
                                newBundle[index].age = e.target.value;
                                setBundleData(newBundle);
                              }} placeholder="z.B. 2 Jahre"
                                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand" />
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-stone-700 mb-1">Gewicht</label>
                              <input type="text" value={animal.weight} onChange={e => {
                                const newBundle = [...bundleData];
                                newBundle[index].weight = e.target.value;
                                setBundleData(newBundle);
                              }} placeholder="z.B. 4 kg"
                                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand" />
                          </div>
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-stone-700 mb-1">Geschlecht</label>
                          <select value={animal.gender} onChange={e => {
                                const newBundle = [...bundleData];
                                newBundle[index].gender = e.target.value;
                                setBundleData(newBundle);
                          }}
                                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand bg-white">
                              <option value="">Keine Angabe</option>
                              <option value="Männlich">Männlich</option>
                              <option value="Weiblich">Weiblich</option>
                          </select>
                      </div>

                      {/* Medical Checkboxes */}
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-stone-700 cursor-pointer">
                          <input type="checkbox" checked={animal.castrated} onChange={e => {
                                const newBundle = [...bundleData];
                                newBundle[index].castrated = e.target.checked;
                                setBundleData(newBundle);
                          }} className="rounded text-brand focus:ring-brand" />
                          Kastriert
                        </label>
                        <label className="flex items-center gap-2 text-sm font-medium text-stone-700 cursor-pointer">
                          <input type="checkbox" checked={animal.dewormed} onChange={e => {
                                const newBundle = [...bundleData];
                                newBundle[index].dewormed = e.target.checked;
                                setBundleData(newBundle);
                          }} className="rounded text-brand focus:ring-brand" />
                          Entwurmt
                        </label>
                        <label className="flex items-center gap-2 text-sm font-medium text-stone-700 cursor-pointer">
                          <input type="checkbox" checked={animal.chipped} onChange={e => {
                                const newBundle = [...bundleData];
                                newBundle[index].chipped = e.target.checked;
                                setBundleData(newBundle);
                          }} className="rounded text-brand focus:ring-brand" />
                          Gechipt
                        </label>
                        <label className="flex items-center gap-2 text-sm font-medium text-stone-700 cursor-pointer">
                          <input type="checkbox" checked={animal.vaccinated} onChange={e => {
                                const newBundle = [...bundleData];
                                newBundle[index].vaccinated = e.target.checked;
                                setBundleData(newBundle);
                          }} className="rounded text-brand focus:ring-brand" />
                          Geimpft
                        </label>
                      </div>
                    </div>
                  ))}

                  <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Status</label>
                      <select value={status} onChange={e => setStatus(e.target.value)}
                              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand bg-white">
                          <option>Sucht Zuhause</option>
                          <option>Reserviert</option>
                          <option>Vermittelt</option>
                          <option>Vermittlungshilfe</option>
                          <option>Notfall</option>
                      </select>
                  </div>

                  <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Beschreibung</label>
                      <textarea required rows={4} value={description} onChange={e => setDescription(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand resize-none" />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Bilder hochladen (bis zu 5 Katzen im Bundle)</label>
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-stone-200 border-dashed rounded-xl hover:bg-stone-50 transition-colors">
                          <div className="space-y-1 text-center">
                              <ImageIcon className="mx-auto h-12 w-12 text-stone-300" />
                              <div className="flex text-sm text-stone-600 justify-center">
                                  <label className="relative cursor-pointer bg-white rounded-md font-medium text-brand hover:text-brand-hover">
                                      <span>Dateien auswählen</span>
                                      <input type="file" className="sr-only" multiple accept="image/*" onChange={e => {
                                        if (e.target.files) {
                                          const selectedFiles = Array.from(e.target.files).slice(0, 5);
                                          setImages(selectedFiles);
                                        }
                                      }} />
                                  </label>
                              </div>
                              <p className="text-xs text-stone-500">{images.length > 0 ? `${images.length} Bild(er) ausgewählt` : "PNG, JPG bis 10MB (max 5 Bilder)"}</p>
                          </div>
                      </div>
                  </div>
                  <button type="submit" disabled={isSubmitting}
                          className="w-full bg-brand text-white py-3 rounded-xl font-bold hover:bg-brand-hover transition-colors disabled:opacity-50 mt-4">
                      {isSubmitting ? (uploadMessage || "Wird gespeichert...") : (editingAnimalId ? "Änderungen speichern" : "Tier hinzufügen")}
                  </button>
              </form>
          </div>

          {/* Animals List */}
          <div className="lg:col-span-2 w-full">
              <h2 className="font-display text-xl font-bold text-stone-900 mb-6 border-b border-stone-100 pb-4">Alle Tiere ({animals.filter(a => !a.isDeleted).length})</h2>
              <div className="space-y-4">
                  {animals.filter(a => !a.isDeleted).length === 0 ? (
                      <div className="text-center py-12 text-stone-500 bg-stone-50 rounded-2xl border border-stone-100">
                          Noch keine Tiere vorhanden.
                      </div>
                  ) : (
                      animals.filter(a => !a.isDeleted).map(animal => (
                          <div key={animal.id} className="bg-white p-4 rounded-2xl border border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:shadow-sm transition-all text-sm">
                              <div className="flex items-center gap-4 w-full sm:flex-1 min-w-0">
                                  {animal.imageUrl ? (
                                      <img src={animal.imageUrl} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" />
                                  ) : (
                                      <div className="w-16 h-16 rounded-xl bg-stone-100 flex items-center justify-center text-stone-300 shrink-0">
                                          <ImageIcon className="w-6 h-6" />
                                      </div>
                                  )}
                                  <div className="min-w-0 flex-1 relative pr-4">
                                      <h3 className="font-bold text-stone-900 truncate text-base">{animal.name}</h3>
                                      <div className="flex items-center gap-2 text-stone-500 mt-1 flex-wrap">
                                          {animal.age && <span className="whitespace-nowrap">{animal.age}</span>}
                                          {animal.age && <span className="w-1 h-1 bg-stone-300 rounded-full shrink-0" />}
                                          <span className="whitespace-nowrap">{animal.status}</span>
                                      </div>
                                  </div>
                              </div>
                              <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t border-stone-100 sm:border-0 pt-3 sm:pt-0">
                                  {animalToDelete === animal.id ? (
                                      <>
                                          <button 
                                              onClick={() => setAnimalToDelete(null)}
                                              disabled={isDeleting}
                                              className="px-3 py-1.5 text-xs font-medium text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors disabled:opacity-50"
                                          >
                                              Abbrechen
                                          </button>
                                          <button 
                                              onClick={() => handleDelete(animal.id)}
                                              disabled={isDeleting}
                                              className="px-3 py-1.5 text-xs font-bold text-white bg-brand hover:bg-brand-hover rounded-lg transition-colors disabled:opacity-50"
                                          >
                                              {isDeleting ? "Lösche..." : "Wirklich löschen?"}
                                          </button>
                                      </>
                                  ) : (
                                      <>
                                          <button 
                                              onClick={() => handleEditClick(animal)}
                                              className="p-2 text-stone-400 hover:text-brand hover:bg-brand-light rounded-lg transition-colors"
                                              title="Bearbeiten"
                                          >
                                              <Edit className="w-5 h-5" />
                                          </button>
                                          <button 
                                              onClick={() => setAnimalToDelete(animal.id)}
                                              className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                              title="Löschen"
                                          >
                                              <Trash2 className="w-5 h-5" />
                                          </button>
                                      </>
                                  )}
                              </div>
                          </div>
                      ))
                  )}
              </div>
          </div>
        </div>
      ) : activeTab === 'inquiries' ? (
        <div className="space-y-12 max-w-4xl">
          <div>
            <h2 className="font-display text-2xl font-bold text-stone-900 mb-6">Offene Anfragen</h2>
            {inquiries.filter(i => i.status !== 'deleted').length === 0 ? (
              <div className="text-center py-12 text-stone-500 bg-stone-50 rounded-2xl border border-stone-100">
                  Zurzeit keine offenen Anfragen vorhanden.
              </div>
            ) : (
              <div className="space-y-6">
                {inquiries.filter(i => i.status !== 'deleted').map(inquiry => (
                  <div key={inquiry.id} className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm relative pr-4">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 mb-6">
                      <div className="flex justify-between items-start gap-3 w-full sm:w-auto">
                        <div className="flex-1">
                          <h3 className="font-display font-bold text-xl text-stone-900 mb-1">{inquiry.name}</h3>
                          <div className="text-stone-500 text-sm flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                            <span>Interesse an: <span className="font-bold text-brand">{inquiry.animalName}</span></span>
                            <span className="hidden sm:inline text-stone-300">•</span>
                            <span>{new Date(inquiry.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        {/* Mobile Delete Button inline */}
                        <div className="sm:hidden shrink-0 mt-1">
                          {inquiryToDelete === inquiry.id ? (
                            <div className="flex items-center gap-1.5 bg-red-50 p-1 rounded-xl border border-red-100 shadow-sm">
                              <button 
                                onClick={() => setInquiryToDelete(null)}
                                className="px-2 py-1 text-2xs font-medium text-stone-500 hover:text-stone-700 hover:bg-stone-200 rounded"
                              >
                                X
                              </button>
                              <button 
                                onClick={() => handleDeleteInquiry(inquiry.id)}
                                className="px-2 py-1 text-2xs font-bold text-white bg-red-500 hover:bg-red-600 rounded"
                              >
                                Ja
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => setInquiryToDelete(inquiry.id)}
                              className="p-1.5 text-stone-400 hover:text-brand hover:bg-brand-light rounded bg-stone-50 transition-colors"
                              title="Anfrage löschen"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full sm:w-auto">
                        <div className="flex flex-col text-sm text-stone-600 bg-stone-50 p-3 rounded-xl border border-stone-100 w-full sm:w-auto">
                          <span className="font-medium text-stone-950 mb-1">Kontaktdaten:</span>
                          {inquiry.email && <a href={`mailto:${inquiry.email}`} className="hover:text-brand transition-colors break-all">{inquiry.email}</a>}
                          <a href={`tel:${inquiry.phone}`} className="hover:text-brand transition-colors">{inquiry.phone}</a>
                        </div>
                        {/* Desktop Delete Button */}
                        <div className="hidden sm:block shrink-0">
                          {inquiryToDelete === inquiry.id ? (
                            <div className="flex items-center gap-2 bg-red-50 p-1.5 rounded-xl border border-red-100 shadow-sm">
                              <button 
                                onClick={() => setInquiryToDelete(null)}
                                className="px-2.5 py-1 text-xs font-medium text-stone-500 hover:text-stone-700 hover:bg-stone-200 rounded-lg transition-colors"
                              >
                                Abbrechen
                              </button>
                              <button 
                                onClick={() => handleDeleteInquiry(inquiry.id)}
                                className="px-2.5 py-1 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                              >
                                Löschen
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => setInquiryToDelete(inquiry.id)}
                              className="p-2 text-stone-400 hover:text-brand hover:bg-brand-light rounded-lg transition-colors"
                              title="Anfrage löschen"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-stone-900 mb-2 text-sm uppercase tracking-wider">Nachricht / Über uns</h4>
                      <p className="text-stone-700 bg-white border border-stone-100 p-4 rounded-xl whitespace-pre-wrap leading-relaxed text-sm">
                        {inquiry.motivation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : activeTab === 'reviews' ? (
        <div className="space-y-6 max-w-4xl">
          <div>
            <h2 className="font-display text-2xl font-bold text-stone-900 mb-2">Bewertungen verwalten</h2>
            <p className="text-stone-500 mb-6">Wählen Sie bis zu 10 Bewertungen aus, die auf der Startseite mit einem speziellen Animationseffekt hervorgehoben werden sollen.</p>
            <div className="mb-6 bg-stone-50 p-4 rounded-xl border border-stone-200">
              <span className="font-bold text-brand">{reviews.filter(r => r.featured).length} / 10</span> Bewertungen hervorgehoben
            </div>
            
            {reviews.filter(r => !r.isDeleted).length === 0 ? (
              <div className="text-center py-12 text-stone-500 bg-stone-50 rounded-2xl border border-stone-100">
                  Noch keine Bewertungen vorhanden.
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.filter(r => !r.isDeleted).map(review => (
                  <div key={review.id} className={`bg-white p-6 rounded-3xl border shadow-sm flex flex-col sm:flex-row gap-4 transition-colors ${review.featured ? 'border-brand' : 'border-stone-100'}`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-stone-900">{review.name}</span>
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-stone-200'}`} viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                          ))}
                        </div>
                      </div>
                      <p className="text-stone-600 text-sm italic">"{review.text}"</p>
                    </div>
                    <div className="grid grid-cols-2 sm:flex sm:flex-col gap-2 w-full sm:w-auto shrink-0 border-t border-stone-100 sm:border-t-0 pt-4 sm:pt-0">
                      <button
                        onClick={() => handleToggleFeatureReview(review.id, review.featured)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors w-full ${review.featured ? 'bg-brand text-white hover:bg-brand-hover' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
                      >
                        {review.featured ? 'Hervorgehoben' : 'Hervorheben'}
                      </button>
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        className="px-4 py-2 rounded-xl text-sm font-bold transition-colors bg-red-50 text-red-600 hover:bg-red-100 w-full"
                      >
                        Löschen
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : activeTab === 'blogs' ? (
        <AdminBlogs />
      ) : activeTab === 'team' ? (
        <AdminTeam />
      ) : activeTab === 'settings' ? (
        <AdminSettings />
      ) : activeTab === 'trash' ? (
        <div className="space-y-12 max-w-4xl">
          <div>
            <h2 className="font-display text-2xl font-bold text-stone-900 mb-6 flex items-center gap-2">
              <Trash2 className="w-6 h-6 text-stone-400" />
              Gelöschte Elemente
            </h2>
            
            {/* Deleted Animals */}
            <h3 className="font-bold text-lg text-stone-900 mb-4 border-b border-stone-200 pb-2">Tiere ({animals.filter(a => a.isDeleted).length})</h3>
            {animals.filter(a => a.isDeleted).length === 0 ? (
              <p className="text-stone-500 mb-8 text-sm">Keine gelöschten Tiere.</p>
            ) : (
              <div className="space-y-4 mb-8">
                {animals.filter(a => a.isDeleted).map(animal => (
                   <div key={animal.id} className="bg-stone-50 p-4 rounded-2xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm">
                   <div className="flex items-center gap-4 w-full sm:w-auto">
                       {animal.imageUrl ? (
                           <img src={animal.imageUrl} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0" />
                       ) : (
                           <div className="w-12 h-12 rounded-xl bg-stone-200 flex items-center justify-center text-stone-400 shrink-0">
                               <ImageIcon className="w-5 h-5" />
                           </div>
                       )}
                       <div className="min-w-0 flex-1">
                           <h3 className="font-bold text-stone-900 truncate">{animal.name}</h3>
                           <span className="text-xs text-red-500 font-medium">Gelöscht</span>
                       </div>
                   </div>
                   <div className="flex gap-2 w-full sm:w-auto justify-end border-t border-stone-150 sm:border-0 pt-3 sm:pt-0 shrink-0">
                        <button onClick={() => handleRestoreAnimal(animal.id)} className="flex-1 sm:flex-initial px-3 py-1.5 text-xs font-bold bg-white border border-stone-200 hover:bg-stone-100 rounded-lg transition-colors whitespace-nowrap">Wiederherstellen</button>
                        <button onClick={() => handlePermanentDeleteAnimal(animal.id)} className="flex-1 sm:flex-initial px-3 py-1.5 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors whitespace-nowrap">Endgültig Löschen</button>
                   </div>
               </div>
                ))}
              </div>
            )}

            {/* Deleted Inquiries */}
            <h3 className="font-bold text-lg text-stone-900 mb-4 border-b border-stone-200 pb-2">Anfragen ({inquiries.filter(i => i.status === 'deleted').length})</h3>
            {inquiries.filter(i => i.status === 'deleted').length === 0 ? (
              <p className="text-stone-500 mb-8 text-sm">Keine gelöschten Anfragen.</p>
            ) : (
              <div className="space-y-4 mb-8">
                {inquiries.filter(i => i.status === 'deleted').map(inquiry => (
                   <div key={inquiry.id} className="bg-stone-50 p-4 rounded-2xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-stone-900 truncate">{inquiry.name} <span className="text-stone-500 font-normal">({inquiry.email || 'Keine E-Mail'})</span></h3>
                        <p className="text-xs text-stone-500 truncate">Interesse an: {inquiry.animalName}</p>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto justify-end border-t border-stone-150 sm:border-0 pt-3 sm:pt-0 shrink-0">
                        <button onClick={() => handleRestoreInquiry(inquiry.id)} className="flex-1 sm:flex-initial px-3 py-1.5 text-xs font-bold bg-white border border-stone-200 hover:bg-stone-100 rounded-lg transition-colors whitespace-nowrap">Wiederherstellen</button>
                        <button onClick={() => handlePermanentDeleteInquiry(inquiry.id)} className="flex-1 sm:flex-initial px-3 py-1.5 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors whitespace-nowrap">Endgültig Löschen</button>
                      </div>
                   </div>
                ))}
              </div>
            )}

            {/* Deleted Reviews */}
            <h3 className="font-bold text-lg text-stone-900 mb-4 border-b border-stone-200 pb-2">Bewertungen ({reviews.filter(r => r.isDeleted).length})</h3>
            {reviews.filter(r => r.isDeleted).length === 0 ? (
              <p className="text-stone-500 mb-8 text-sm">Keine gelöschten Bewertungen.</p>
            ) : (
              <div className="space-y-4 mb-8">
                  {reviews.filter(r => r.isDeleted).map(review => (
                   <div key={review.id} className="bg-stone-50 p-4 rounded-2xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-stone-900 truncate">{review.name}</h3>
                        <p className="text-xs text-stone-500 italic max-w-md truncate">"{review.text}"</p>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto justify-end border-t border-stone-150 sm:border-0 pt-3 sm:pt-0 shrink-0">
                        <button onClick={() => handleRestoreReview(review.id)} className="flex-1 sm:flex-initial px-3 py-1.5 text-xs font-bold bg-white border border-stone-200 hover:bg-stone-100 rounded-lg transition-colors whitespace-nowrap">Wiederherstellen</button>
                        <button onClick={() => handlePermanentDeleteReview(review.id)} className="flex-1 sm:flex-initial px-3 py-1.5 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors whitespace-nowrap">Endgültig Löschen</button>
                      </div>
                   </div>
                ))}
              </div>
            )}

            {/* Deleted Blogs */}
            <h3 className="font-bold text-lg text-stone-900 mb-4 border-b border-stone-200 pb-2">Blog ({blogs.filter(b => b.isDeleted).length})</h3>
            {blogs.filter(b => b.isDeleted).length === 0 ? (
              <p className="text-stone-500 text-sm">Keine gelöschten Blog-Einträge.</p>
            ) : (
              <div className="space-y-4">
                  {blogs.filter(b => b.isDeleted).map(blog => (
                   <div key={blog.id} className="bg-stone-50 p-4 rounded-2xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-stone-900 truncate">{blog.title}</h3>
                        <p className="text-xs text-stone-500 italic max-w-md truncate">"{blog.content}"</p>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto justify-end border-t border-stone-150 sm:border-0 pt-3 sm:pt-0 shrink-0">
                        <button onClick={() => handleRestoreBlog(blog.id)} className="flex-1 sm:flex-initial px-3 py-1.5 text-xs font-bold bg-white border border-stone-200 hover:bg-stone-100 rounded-lg transition-colors whitespace-nowrap">Wiederherstellen</button>
                        <button onClick={() => handlePermanentDeleteBlog(blog.id)} className="flex-1 sm:flex-initial px-3 py-1.5 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors whitespace-nowrap">Endgültig Löschen</button>
                      </div>
                   </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}

      {activeTab === 'visual-editor' && (
        <AdminVisualEditor />
      )}
    </div>
  );
}
