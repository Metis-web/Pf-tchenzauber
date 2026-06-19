import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export function useMaintenanceMode() {
  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'maintenance'), (docSnap) => {
      if (docSnap.exists() && docSnap.data().active !== undefined) {
        setMaintenanceMode(docSnap.data().active);
      } else {
        setMaintenanceMode(false);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching maintenance mode:", error);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return { maintenanceMode, loading };
}
