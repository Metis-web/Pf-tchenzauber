import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, logOut, signInWithGoogle } from '../firebase';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Check if admin
        try {
          const adminDoc = await getDoc(doc(db, 'admins', user.uid));
          const userEmail = user.email?.toLowerCase();
          setIsAdmin(user.uid === 'ADMIN' || user.uid === '6WUCGpYVWISBcpTJZ5UrBjWhMBC3' || user.uid === 'OlcgSswPiuQC8xffrs9d9gfrojp1' || adminDoc.exists() || (user.emailVerified && (userEmail === 'beniboygalaxy@gmail.com' || userEmail === 'websociety.group@gmail.com' || userEmail === 'davisdaehne89@gmail.com')));
        } catch (e) {
          const userEmail = user.email?.toLowerCase();
          setIsAdmin(user.uid === 'ADMIN' || user.uid === '6WUCGpYVWISBcpTJZ5UrBjWhMBC3' || user.uid === 'OlcgSswPiuQC8xffrs9d9gfrojp1' || (user.emailVerified && (userEmail === 'beniboygalaxy@gmail.com' || userEmail === 'websociety.group@gmail.com' || userEmail === 'davisdaehne89@gmail.com')));
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      await signInWithGoogle();
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const logout = async () => {
    await logOut();
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
