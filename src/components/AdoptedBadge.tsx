import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { Cat, Sparkles } from 'lucide-react';

export default function AdoptedBadge() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'stats'), (docSnap) => {
      if (docSnap.exists() && docSnap.data().adoptedCount) {
        setCount(Number(docSnap.data().adoptedCount));
      }
    });
    return () => unsub();
  }, []);

  if (!count) return null;

  return (
    <div className="inline-flex items-center gap-3 bg-sky-50 text-stone-800 px-6 py-3 rounded-full font-bold text-sm shadow-sm border border-sky-100 mb-6 group hover:border-brand/30 transition-colors">
      <div className="relative flex items-center justify-center text-brand">
        <Cat className="w-5 h-5 z-10" />
        <Sparkles className="w-4 h-4 absolute -top-2 -right-3 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        <Sparkles className="w-3 h-3 absolute -bottom-1 -left-3 text-sky-400 opacity-0 group-hover:opacity-100 transition-opacity delay-75" />
      </div>
      <span>Bisher <span className="text-brand font-black text-base">{count}</span> Tiere glücklich vermittelt</span>
    </div>
  );
}
