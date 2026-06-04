import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function EmergencyStatus() {
  const [status, setStatus] = useState<'accepting' | 'full'>('accepting');

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'emergency'), (docSnap) => {
      if (docSnap.exists()) {
        setStatus(docSnap.data().status as 'accepting' | 'full');
      }
    });
    return () => unsub();
  }, []);

  return (
    <div className="mb-8 flex justify-center w-full">
      {status === 'accepting' ? (
        <div className="flex items-center gap-1.5 bg-green-100 text-green-800 px-4 py-2 rounded-full font-bold shadow-sm border border-green-200">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm">Wir nehmen aktuell Tiere auf</span>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 bg-red-100 text-red-800 px-4 py-2 rounded-full font-bold shadow-sm border border-red-200">
          <XCircle className="w-5 h-5" />
          <span className="text-sm">Aktuell leider Aufnahmestopp</span>
        </div>
      )}
    </div>
  );
}
