import React, { useState, useEffect, useRef } from 'react';
import { Save, RotateCcw, Plus, AlignLeft, AlignCenter, AlignRight, X, Copy, MousePointer2 } from 'lucide-react';
import { db } from '../firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

const DEFAULT_TEXTS = {
  homeHeroTitle: "Wir zaubern <span class='text-brand'>Pfötchen</span> ein<br/> neues Leben.",
  homeHeroSub: "Seriöse Katzenvermittlung & Tierschutz e.V. in Berlin mit großem Herzen. Wir kümmern uns professionell um Straßenkatzen, Fundkatzen und Notfälle aus dem Auslandstierschutz in Berlin und Umgebung. Finden und adoptieren Sie bei uns Ihr neues Familienmitglied!",
  homeEmergencyTitle: "Sie haben eine Frage oder einen Notfall?",
  homeEmergencySub: "Zögern Sie nicht, uns anzurufen. Wir sind in Berlin und Umgebung für unsere Tiere im Einsatz.",
  teamTitle: "Unser Team",
  teamSub: "Das Herz und die Seele von Pfötchenzauber e.V. - Wir sind mit Leidenschaft und Expertise im Einsatz für Tiere in Not.",
  animalsTitle: "Unsere Schützlinge",
  animalsSub: "Diese wundervollen Seelen warten auf ihr Für-Immer-Zuhause. Kontaktieren Sie uns, wenn Sie einem Tier einen Platz in Ihrem Herzen schenken möchten.",
  donateTitle: "Ihre Spende hilft Leben zu retten",
  donateSub: "Als kleiner gemeinnütziger Verein finanzieren wir uns ausschließlich über Spenden. Jeder Beitrag hilft uns, Futter, Tierarztkosten und Pflegeplätze für unsere Schützlinge zu bezahlen.",
  footerAbout: "Wir kümmern uns mit ganz viel Herz um Notfälle und Schützlinge in Berlin. Die Spenden kommen zu 100 Prozent den Tieren zugute.",
  footerAddress: "Berlin, Deutschland",
  footerPhone: "Telefon: 0178 5305137",
  footerEmail: "Email: Pfoetchenzauber_eV@outlook.com",
  footerRights: "&copy; 2026 Pfötchenzauber e.V. Alle Rechte vorbehalten.",
  navHome: "Startseite",
  navTeam: "Unser Team",
  navAnimals: "Unsere Schützlinge",
  navDonate: "Spenden",
  navLogin: "Login"
};

const EditorContext = React.createContext<any>(null);

const EditableText = ({ id, content, className, isNew = false, wrapperTag: Tag = 'div' }: any) => {
  const { activeEditId, setActiveEditId, setToolbarPos, updateNewElementText, setTexts, handleSaveFunc } = React.useContext(EditorContext);
  const isActive = activeEditId === id;
  const contentRef = useRef<HTMLElement>(null);
  const initialMount = useRef(true);

  useEffect(() => {
    if (initialMount.current && contentRef.current) {
      contentRef.current.innerHTML = content || '';
      initialMount.current = false;
    } else if (!isActive && contentRef.current && contentRef.current.innerHTML !== content) {
      contentRef.current.innerHTML = content || '';
    }
  }, [content, isActive]);
  
  useEffect(() => {
    if (isActive && contentRef.current) {
        contentRef.current.focus();
    }
  }, [isActive]);

  return (
    <Tag
      id={id}
      ref={contentRef}
      className={`${className || ''} ${isActive ? 'outline-none ring-2 ring-blue-500 rounded z-50' : 'hover:outline hover:outline-2 hover:outline-blue-400 hover:rounded cursor-text'} transition-all pointer-events-auto relative`}
      contentEditable={isActive}
      suppressContentEditableWarning={true}
      onClick={(e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isActive) {
          setActiveEditId(id);
          const rect = e.currentTarget.getBoundingClientRect();
          setToolbarPos({ x: rect.left, y: rect.top - 50 }); // toolbar slightly above
        }
      }}
      onInput={(e: React.FormEvent<HTMLElement>) => {
         // Optionally, let them type freely without saving state right away
      }}
      onBlur={(e: React.FocusEvent<HTMLElement>) => {
        const newHtml = (e.currentTarget as HTMLElement).innerHTML;
        if (isNew) {
          updateNewElementText(id, newHtml);
        } else {
          setTexts((prev: any) => ({ ...prev, [id]: newHtml }));
        }
        if (handleSaveFunc) {
          setTimeout(() => handleSaveFunc(id, newHtml, isNew), 150);
        }
      }}
    />
  );
};

const DraggableElement = ({ element }: any) => {
   const { activeEditId, updateNewElementPos } = React.useContext(EditorContext);
   const [pos, setPos] = useState({ x: element.x, y: element.y });
   const isDragging = useRef(false);
   const isActive = activeEditId === element.id;

   useEffect(() => {
      const handleMouseMove = (e: MouseEvent) => {
         if (isDragging.current && !isActive) {
            setPos(p => ({ x: p.x + e.movementX, y: p.y + e.movementY }));
         }
      };
      const handleMouseUp = () => {
         if (isDragging.current) {
            isDragging.current = false;
            updateNewElementPos(element.id, pos.x, pos.y);
         }
      };
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
         window.removeEventListener('mousemove', handleMouseMove);
         window.removeEventListener('mouseup', handleMouseUp);
      }
   }, [pos, isActive, element.id, updateNewElementPos]);

   return (
      <div 
        style={{ position: 'absolute', left: pos.x, top: pos.y, ...element.styles, cursor: isActive ? 'text' : 'grab' }}
        onMouseDown={() => { if (!isActive) isDragging.current = true; }}
        className="z-50"
      >
         <EditableText 
           id={element.id} 
           content={element.text} 
           isNew={true} 
           className="whitespace-pre-wrap" 
         />
      </div>
   );
};

export default function AdminVisualEditor() {
  const [texts, setTexts] = useState<Record<string, string>>(DEFAULT_TEXTS);
  const [newElements, setNewElements] = useState<any[]>([]);
  const [activeEditId, setActiveEditId] = useState<string | null>(null);
  const [activePage, setActivePage] = useState<'home' | 'team' | 'animals' | 'donate'>('home');
  const [toolbarPos, setToolbarPos] = useState({ x: 0, y: 0 });
  const [saveMessage, setSaveMessage] = useState('');
  const savedRangeRef = useRef<Range | null>(null);

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0 && activeEditId) {
        savedRangeRef.current = selection.getRangeAt(0);
      }
    };
    document.addEventListener('selectionchange', handleSelection);
    return () => document.removeEventListener('selectionchange', handleSelection);
  }, [activeEditId]);

  const editorRef = useRef<HTMLDivElement>(null);

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('website-visual-editor-save');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.texts) setTexts(parsed.texts);
      if (parsed.newElements) setNewElements(parsed.newElements);
    }
  }, []);

  const textsRef = useRef(texts);
  const newElementsRef = useRef(newElements);
  
  useEffect(() => {
    textsRef.current = texts;
    newElementsRef.current = newElements;
  }, [texts, newElements]);

  // Save functionality
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'siteTexts'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const { newElements: loadedNew, ...loadedTexts } = data;
        setTexts({ ...DEFAULT_TEXTS, ...loadedTexts });
        if (loadedNew) setNewElements(loadedNew);
      } else {
        setTexts(DEFAULT_TEXTS);
        setNewElements([]);
      }
    });

    return () => unsub();
  }, []);

  const handleSave = async (passedId?: string, passedHtml?: string, passedIsNew?: boolean) => {
    setSaveMessage('Speichere...');
    
    let currentTexts = { ...textsRef.current };
    let currentNewElements = [...newElementsRef.current];
    
    if (passedId && passedHtml !== undefined) {
         if (passedIsNew) {
            currentNewElements = currentNewElements.map(el => el.id === passedId ? { ...el, text: passedHtml } : el);
         } else {
            currentTexts = { ...currentTexts, [passedId]: passedHtml };
         }
    } else if (activeEditId) {
      const activeEl = document.getElementById(activeEditId);
      if (activeEl) {
         const newHtml = activeEl.innerHTML;
         const isNew = currentNewElements.some(el => el.id === activeEditId);
         if (isNew) {
            currentNewElements = currentNewElements.map(el => el.id === activeEditId ? { ...el, text: newHtml } : el);
         } else {
            currentTexts = { ...currentTexts, [activeEditId]: newHtml };
         }
      }
    }

    try {
      await setDoc(doc(db, 'settings', 'siteTexts'), { ...currentTexts, newElements: currentNewElements }, { merge: true });
      
      const saveData = { texts: currentTexts, newElements: currentNewElements };
      localStorage.setItem('website-visual-editor-save', JSON.stringify(saveData));
      
      setSaveMessage('Speichern erfolgreich!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setSaveMessage('Fehler beim Speichern');
    }
  };

  const handleReset = () => {
    if (confirm("Wirklich alles auf den Original-Zustand zurücksetzen?")) {
      setTexts(DEFAULT_TEXTS);
      setNewElements([]);
      localStorage.removeItem('website-visual-editor-save');
    }
  };
  
  const handleExport = () => {
     if (editorRef.current) {
        navigator.clipboard.writeText(editorRef.current.innerHTML);
        setSaveMessage('HTML kopiert!');
        setTimeout(() => setSaveMessage(''), 3000);
     }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') setActiveEditId(null);
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleAddNewText = (type: string) => {
    const newEl = {
      id: 'new_' + Date.now(),
      type,
      text: type === 'h1' ? 'Neue Überschrift' : 'Neuer Textblock',
      x: 100,
      y: 100,
      page: activePage,
      styles: {
        fontSize: type === 'h1' ? '2.5rem' : '1rem',
        fontWeight: type === 'h1' ? 'bold' : 'normal',
        color: '#1c1917'
      }
    };
    setNewElements([...newElements, newEl]);
  };

  const updateNewElementText = (id: string, newText: string) => {
    setNewElements(prev => prev.map(el => el.id === id ? { ...el, text: newText } : el));
  };
  
  const updateNewElementPos = (id: string, x: number, y: number) => {
    setNewElements(prev => prev.map(el => el.id === id ? { ...el, x, y } : el));
  };



  return (
    <EditorContext.Provider value={{ activeEditId, setActiveEditId, setToolbarPos, updateNewElementPos, updateNewElementText, setTexts, handleSaveFunc: handleSave }}>
    <div className="flex flex-col h-[calc(100vh-140px)] bg-stone-100 rounded-3xl overflow-hidden shadow-sm border border-stone-200" onClick={() => setActiveEditId(null)}>
      
      {/* TOOLBAR TOP */}
      <div className="bg-stone-900 border-b border-stone-800 p-4 flex flex-col items-start gap-4" onClick={e => e.stopPropagation()}>
         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-4">
           <div className="flex flex-wrap items-center gap-4">
              <h2 className="text-white font-bold text-lg flex items-center gap-2">
                <MousePointer2 className="w-5 h-5 text-brand" /> Website-Bearbeiten
              </h2>
              <div className="hidden sm:block h-6 w-px bg-stone-700 mx-2"></div>
              <div className="flex gap-2">
                 <button onClick={() => handleAddNewText('h1')} className="flex items-center gap-1 bg-stone-800 hover:bg-stone-700 text-stone-200 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border border-stone-700">
                    <Plus className="w-4 h-4"/> H1 Titel
                 </button>
                 <button onClick={() => handleAddNewText('p')} className="flex items-center gap-1 bg-stone-800 hover:bg-stone-700 text-stone-200 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border border-stone-700">
                    <Plus className="w-4 h-4"/> Textfeld
                 </button>
              </div>
           </div>

           <div className="flex flex-wrap items-center gap-3">
              <span className="text-green-400 text-sm font-medium mr-2">{saveMessage}</span>
              <button onClick={handleReset} className="flex items-center gap-2 text-stone-400 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                <RotateCcw className="w-4 h-4" /> Zurücksetzen
              </button>
              <button onClick={handleExport} className="flex items-center gap-2 text-stone-400 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                <Copy className="w-4 h-4" /> HTML exportieren
              </button>
              <button onClick={handleSave} className="flex items-center gap-2 bg-brand hover:bg-brand-hover text-white px-5 py-2 rounded-xl text-sm font-bold transition-colors shadow-lg">
                <Save className="w-4 h-4" /> Speichern
              </button>
           </div>
         </div>
         {/* PAGE SWITCHER */}
         <div className="flex items-center gap-2 text-sm">
            <span className="text-stone-400 font-medium mr-2">Vorschau-Seite:</span>
            {['home', 'team', 'animals', 'donate'].map(page => (
               <button 
                  key={page}
                  className={`px-3 py-1.5 rounded-full font-medium transition-colors ${activePage === page ? 'bg-brand text-white' : 'bg-stone-800 text-stone-300 hover:bg-stone-700'}`}
                  onClick={() => setActivePage(page as any)}
               >
                  {page === 'home' && 'Startseite'}
                  {page === 'team' && 'Unser Team'}
                  {page === 'animals' && 'Schützlinge'}
                  {page === 'donate' && 'Spenden'}
               </button>
            ))}
         </div>
      </div>

      {/* FLOATING TEXT STYLE TOOLBAR */}
      {activeEditId && (
         <div 
           className="fixed bg-gray-900 text-white rounded-lg shadow-2xl flex items-center p-1.5 gap-1 z-[100] border border-gray-700 animate-in fade-in zoom-in duration-200"
           style={{ top: Math.max(10, toolbarPos.y), left: Math.max(10, toolbarPos.x) }}
           onClick={e => e.stopPropagation()}
           onMouseDown={e => {
             const target = e.target as HTMLElement;
             if (target.tagName !== 'INPUT' && target.tagName !== 'SELECT') {
               e.preventDefault();
             }
           }}
         >
            <button className="p-2 hover:bg-gray-700 hover:text-brand rounded font-serif font-bold w-9 h-9 flex items-center justify-center transition-colors" onClick={() => document.execCommand('bold')}>B</button>
            <button className="p-2 hover:bg-gray-700 hover:text-brand rounded font-serif italic w-9 h-9 flex items-center justify-center transition-colors" onClick={() => document.execCommand('italic')}>I</button>
            <button className="p-2 hover:bg-gray-700 hover:text-brand rounded font-serif underline w-9 h-9 flex items-center justify-center transition-colors" onClick={() => document.execCommand('underline')}>U</button>
            <div className="w-px h-6 bg-gray-700 mx-1"></div>
            
            <button className="p-2 hover:bg-gray-700 rounded text-stone-300 transition-colors" onClick={() => document.execCommand('justifyLeft')}><AlignLeft className="w-4 h-4"/></button>
            <button className="p-2 hover:bg-gray-700 rounded text-stone-300 transition-colors" onClick={() => document.execCommand('justifyCenter')}><AlignCenter className="w-4 h-4"/></button>
            <button className="p-2 hover:bg-gray-700 rounded text-stone-300 transition-colors" onClick={() => document.execCommand('justifyRight')}><AlignRight className="w-4 h-4"/></button>
            <div className="w-px h-6 bg-gray-700 mx-1"></div>

            <div className="relative group px-1 flex items-center">
              <input 
                type="color" 
                className="w-6 h-6 rounded cursor-pointer border-0 p-0 bg-transparent" 
                title="Farbe ändern" 
                onChange={(e) => {
                  if (savedRangeRef.current) {
                    const sel = window.getSelection();
                    sel?.removeAllRanges();
                    sel?.addRange(savedRangeRef.current);
                  }
                  document.execCommand('foreColor', false, e.target.value);
                  // Force an update to the active EditableText since focus was lost
                  const el = document.getElementById(activeEditId);
                  if (el) el.dispatchEvent(new Event('blur', { bubbles: true }));
                }} 
              />
            </div>
            
            <div className="w-px h-6 bg-gray-700 mx-1"></div>
            <select 
              className="bg-gray-800 text-xs px-2 py-1.5 rounded hover:bg-gray-700 outline-none border-none cursor-pointer"
              onChange={(e) => {
                if (savedRangeRef.current) {
                  const sel = window.getSelection();
                  sel?.removeAllRanges();
                  sel?.addRange(savedRangeRef.current);
                }
                document.execCommand('fontSize', false, e.target.value);
                const el = document.getElementById(activeEditId);
                if (el) el.dispatchEvent(new Event('blur', { bubbles: true }));
              }}
              defaultValue="3"
            >
              <option value="1">Small</option>
              <option value="3">Normal</option>
              <option value="5">Large</option>
              <option value="7">Huge</option>
            </select>

            <div className="w-px h-6 bg-gray-700 mx-1"></div>
            {activeEditId.startsWith('new_') && (
              <button 
                className="p-2 hover:bg-red-500/20 text-red-400 hover:text-red-500 rounded transition-colors mr-1"
                title="Löschen"
                onClick={() => {
                  setNewElements(newElements.filter(el => el.id !== activeEditId));
                  setActiveEditId(null);
                }}
              >
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
              </button>
            )}
            <button className="p-2 hover:bg-gray-700 text-gray-400 hover:text-white rounded transition-colors" title="Schließen" onClick={() => setActiveEditId(null)}>
               <X className="w-4 h-4" />
            </button>
         </div>
      )}

      {/* VISUAL EDITOR CANVAS (The 1:1 Clone) */}
      <div className="flex-1 overflow-auto bg-stone-300/50 relative p-4 sm:p-8">
        <div 
           ref={editorRef}
           className="w-full max-w-7xl mx-auto bg-white min-h-[1000px] shadow-2xl rounded-2xl overflow-hidden relative"
        >
           {/* Draggable New Elements */}
           {newElements.filter(el => !el.page || el.page === activePage).map(el => (
             <DraggableElement key={el.id} element={el} />
           ))}

           {/* --- START OF 1:1 CLONE HTML (Home Page structure) --- */}
           <div className="relative min-h-screen bg-gradient-to-br from-[#fff1f2] via-[#fafaf9] to-[#fee2e2]">
              {/* Aesthetic ambient blurs for the whole page */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#fecaca] rounded-full blur-[150px] opacity-30" />
                <div className="absolute top-[40%] left-[-10%] w-[900px] h-[900px] bg-[#f87171] rounded-full blur-[180px] opacity-10" />
                <div className="absolute bottom-0 right-[20%] w-[700px] h-[700px] bg-[#fca5a5] rounded-full blur-[150px] opacity-20" />
              </div>

             {/* Navbar Mock */}
             <header className="bg-white shadow-sm sticky top-0 z-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-24 flex items-center justify-between">
                <div className="flex items-center gap-4 group pointer-events-none">
                  <div className="w-20 h-20 flex items-center justify-center shrink-0">
                    <img src="/Logo.png" alt="Pfötchenzauber Logo" className="w-full h-full object-contain" onError={(e) => { e.currentTarget.src = 'https://placehold.co/100x100/a81c25/ffffff?text=PZ'; }} />
                  </div>
                  <span className="font-display font-black text-xl sm:text-2xl md:text-3xl text-stone-900 tracking-tight">Pfötchenzauber e.V.</span>
                </div>
                
                <nav className="hidden md:flex items-center gap-6">
                  <div onClick={() => setActivePage('home')} className={`cursor-pointer font-medium transition-colors ${activePage === 'home' ? 'text-brand' : 'text-stone-600 hover:text-brand'}`}>
                    <EditableText id="navHome" content={texts.navHome} wrapperTag="span" />
                  </div>
                  <div onClick={() => setActivePage('team')} className={`cursor-pointer font-medium transition-colors ${activePage === 'team' ? 'text-brand' : 'text-stone-600 hover:text-brand'}`}>
                    <EditableText id="navTeam" content={texts.navTeam} wrapperTag="span" />
                  </div>
                  <div onClick={() => setActivePage('animals')} className={`cursor-pointer font-medium transition-colors ${activePage === 'animals' ? 'text-brand' : 'text-stone-600 hover:text-brand'}`}>
                    <EditableText id="navAnimals" content={texts.navAnimals} wrapperTag="span" />
                  </div>
                  <div onClick={() => setActivePage('donate')} className="cursor-pointer bg-brand text-white px-5 py-2.5 rounded-full font-medium transition-colors flex items-center gap-2 shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                    <EditableText id="navDonate" content={texts.navDonate} wrapperTag="span" />
                  </div>
                  <div className="flex items-center gap-2 text-stone-500 font-medium ml-4 pl-4 border-l border-stone-200">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    <EditableText id="navLogin" content={texts.navLogin} wrapperTag="span" />
                  </div>
                </nav>
              </div>
             </header>

             {/* Home Page Edit Mock */}
             {activePage === 'home' && (
               <>
                 <section className="relative py-24 sm:py-32 flex flex-col items-center">
                   <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center flex flex-col items-center">
                  
                  {/* Badge */}
                  <div className="pointer-events-none mb-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-brand/20 shadow-sm backdrop-blur-sm">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-brand"></span>
                      </span>
                      <span className="text-sm font-medium text-stone-700">12 Tiere haben diesen Monat ein Zuhause gefunden</span>
                    </div>
                  </div>

                  <EditableText 
                    id="homeHeroTitle" 
                    wrapperTag="h1"
                    content={texts.homeHeroTitle} 
                    className="font-display text-4xl sm:text-6xl font-black text-stone-900 tracking-tight mb-8" 
                  />
                  
                  <EditableText 
                    id="homeHeroSub" 
                    wrapperTag="p"
                    content={texts.homeHeroSub} 
                    className="text-xl text-stone-600 max-w-2xl mx-auto mb-10" 
                  />

                  <div className="flex flex-col sm:flex-row gap-4 justify-center pointer-events-none">
                    <span className="bg-stone-900 text-white px-8 py-4 rounded-full font-medium hover:bg-stone-800 transition-colors shadow-lg cursor-pointer">
                      Katze oder Kätzchen finden
                    </span>
                    <span className="bg-white text-stone-900 border-2 border-stone-200 px-8 py-4 rounded-full font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg> Projekt unterstützen
                    </span>
                  </div>
               </div>
             </section>

             {/* Emergency / Contact Section */}
             <section className="py-16 relative z-10 flex flex-col items-center">
               <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center bg-white/40 backdrop-blur-md rounded-3xl p-12 border border-white/50 shadow-xl relative">
                  
                  <div className="pointer-events-none mb-6">
                    <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-full border border-red-100 font-bold mb-4 shadow-sm mx-auto">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                      </span>
                      Aktuell 3 Notfälle in Betreuung
                    </div>
                  </div>

                  <EditableText 
                    id="homeEmergencyTitle" 
                    wrapperTag="h2"
                    content={texts.homeEmergencyTitle} 
                    className="font-display text-3xl font-black mb-6 text-stone-900 mt-8 sm:mt-0" 
                  />
                  <EditableText 
                    id="homeEmergencySub" 
                    wrapperTag="p"
                    content={texts.homeEmergencySub} 
                    className="text-stone-600 mb-8 max-w-xl text-lg" 
                  />
                  <span className="inline-flex items-center gap-3 bg-brand text-white px-8 py-4 rounded-full font-bold text-lg pointer-events-none shadow-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg> 0178 5305137
                  </span>
               </div>
             </section>
             </>
             )}

             {/* Team Page Edit Mock */}
             {activePage === 'team' && (
               <div className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
                  <div className="inline-flex items-center justify-center p-4 bg-brand/10 rounded-full mb-6 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  </div>
                  <EditableText 
                    id="teamTitle" 
                    wrapperTag="h1"
                    content={texts.teamTitle} 
                    className="font-display text-4xl md:text-5xl lg:text-6xl font-black text-stone-900 mb-6 tracking-tight" 
                  />
                  <EditableText 
                    id="teamSub" 
                    wrapperTag="p"
                    content={texts.teamSub} 
                    className="text-xl text-stone-600 max-w-2xl mx-auto mb-16" 
                  />
                  
                  {/* Placeholder for Team Members */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pointer-events-none opacity-60 w-full max-w-4xl mx-auto">
                    {[1,2].map(i => (
                       <div key={i} className="bg-white rounded-3xl p-6 sm:p-8 border shrink-0 text-left">
                         <div className="flex gap-6">
                           <div className="w-24 h-24 bg-stone-200 rounded-full shrink-0"></div>
                           <div className="flex-1">
                             <div className="h-6 w-3/4 bg-stone-200 rounded mb-2"></div>
                             <div className="h-4 w-1/2 bg-stone-100 rounded mb-4"></div>
                             <div className="h-4 w-full bg-stone-100 rounded"></div>
                           </div>
                         </div>
                       </div>
                    ))}
                  </div>
               </div>
             )}

             {/* Animals Page Edit Mock */}
             {activePage === 'animals' && (
               <div className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
                  <EditableText 
                    id="animalsTitle" 
                    wrapperTag="h1"
                    content={texts.animalsTitle} 
                    className="font-display text-4xl font-black text-stone-900 mb-4" 
                  />
                  <EditableText 
                    id="animalsSub" 
                    wrapperTag="p"
                    content={texts.animalsSub} 
                    className="text-stone-600 max-w-2xl mx-auto text-lg mb-12" 
                  />

                  {/* Placeholder for Animals filter and list */}
                   <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 pointer-events-none opacity-60 w-full">
                    {[1,2,3].map(i => (
                       <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-stone-100 text-left">
                         <div className="h-64 bg-stone-200 relative overflow-hidden">
                         </div>
                         <div className="p-6 sm:p-8">
                           <div className="h-6 w-3/4 bg-stone-200 rounded mb-4"></div>
                           <div className="flex gap-2">
                             <div className="h-6 w-16 bg-stone-100 rounded-full"></div>
                             <div className="h-6 w-16 bg-stone-100 rounded-full"></div>
                           </div>
                         </div>
                       </div>
                    ))}
                  </div>
               </div>
             )}

             {/* Donate Page Edit Mock */}
             {activePage === 'donate' && (
               <div className="py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
                  <div className="inline-flex items-center justify-center p-4 bg-brand/10 rounded-full mb-6 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                  </div>
                  <EditableText 
                    id="donateTitle" 
                    wrapperTag="h1"
                    content={texts.donateTitle} 
                    className="font-display text-4xl font-black text-stone-900 mb-4" 
                  />
                  <EditableText 
                    id="donateSub" 
                    wrapperTag="p"
                    content={texts.donateSub} 
                    className="text-stone-600 max-w-2xl mx-auto text-lg leading-relaxed mb-16" 
                  />

                  {/* Placeholder for PayPal / Bank details */}
                  <div className="bg-white p-8 rounded-3xl border border-stone-200 text-left w-full pointer-events-none opacity-60">
                     <div className="h-8 w-1/2 bg-stone-200 rounded mb-6"></div>
                     <div className="h-4 w-full bg-stone-100 rounded mb-2"></div>
                     <div className="h-4 w-3/4 bg-stone-100 rounded mb-8"></div>
                     <div className="h-12 w-full bg-stone-200 rounded"></div>
                  </div>
               </div>
             )}

             {/* Footer Mock */}
             <footer className="bg-white border-t border-stone-200 text-stone-600 py-12 mt-auto relative z-10">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-4 gap-8">
                <div className="md:col-span-1">
                  <div className="flex items-center gap-3 mb-4 pointer-events-none">
                     <div className="w-20 h-20 flex items-center justify-center shrink-0 opacity-90">
                        <img src="/Logo.png" alt="Pfötchenzauber Logo" className="w-full h-full object-contain" onError={(e) => { e.currentTarget.src = 'https://placehold.co/100x100/a81c25/ffffff?text=PZ'; }} />
                     </div>
                     <span className="font-display font-black text-xl sm:text-2xl text-stone-900 select-none">Pfötchenzauber e.V.</span>
                  </div>
                  <EditableText id="footerAbout" content={texts.footerAbout} wrapperTag="p" className="text-sm border-l-2 border-stone-200 pl-4 py-1 italic" />
                </div>
                <div>
                  <h4 className="text-stone-900 font-bold mb-4 font-display pointer-events-none">Kontakt</h4>
                  <ul className="space-y-2 text-sm">
                    <li><EditableText id="footerAddress" content={texts.footerAddress} wrapperTag="span" /></li>
                    <li><EditableText id="footerPhone" content={texts.footerPhone} wrapperTag="span" /></li>
                    <li><EditableText id="footerEmail" content={texts.footerEmail} wrapperTag="span" /></li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-stone-900 font-bold mb-4 font-display pointer-events-none">Verein</h4>
                  <ul className="space-y-2 text-sm pointer-events-none">
                    <li>Unser Team</li>
                    <li>Impressum</li>
                    <li>Datenschutz</li>
                  </ul>
                </div>
                <div className="pointer-events-none">
                  <h4 className="text-stone-900 font-bold mb-4 font-display">Folge uns</h4>
                  <div className="flex gap-4">
                    <span className="text-stone-500 hover:text-brand transition-colors p-2.5 bg-stone-100 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                    </span>
                    <span className="text-stone-500 hover:text-brand transition-colors p-2.5 bg-stone-100 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                    </span>
                  </div>
                </div>
              </div>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-stone-100 text-sm text-center">
                 <EditableText id="footerRights" content={texts.footerRights} wrapperTag="div" />
              </div>
             </footer>
           </div>
           {/* --- END OF CLONE HTML --- */}
        </div>
      </div>
    </div>
    </EditorContext.Provider>
  );
}
