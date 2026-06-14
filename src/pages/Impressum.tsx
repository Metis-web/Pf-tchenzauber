import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function Impressum() {
  const [content, setContent] = useState<string>("Lädt...");

  useEffect(() => {
    window.scrollTo(0, 0);
    getDoc(doc(db, 'settings', 'legal')).then((docSnap) => {
      if (docSnap.exists() && docSnap.data().impressum) {
        setContent(docSnap.data().impressum);
      } else {
        setContent("Kein Impressum hinterlegt.");
      }
    }).catch((err) => {
      console.error(err);
      setContent("Fehler beim Laden.");
    });
  }, []);

  return (
    <div className="py-16 sm:py-24 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 bg-white min-h-[60vh]">
      <h1 className="font-display text-4xl font-black text-stone-900 mb-8">Impressum</h1>
      
      <div className="prose prose-stone max-w-none whitespace-pre-wrap leading-relaxed">
        {content !== "Lädt..." && content !== "Fehler beim Laden." && content !== "Kein Impressum hinterlegt." ? (
            content
        ) : (
            <div className="text-stone-500">{content}</div>
        )}
      </div>
    </div>
  );
}
