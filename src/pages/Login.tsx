import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import bcrypt from 'bcryptjs';

export default function Login() {
  const { user, isAdmin, login, loading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  
  // Email state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      if (isAdmin) {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    }
  }, [user, isAdmin, loading, navigate]);

  const handleGoogleLogin = async () => {
    try {
      setError(null);
      await login();
    } catch (e: any) {
      if (e.code === 'auth/operation-not-allowed') {
        setError('Diese Anmeldemethode (Google) ist in der Firebase Console noch nicht aktiviert.');
      } else {
        setError('Fehler bei der Anmeldung mit Google: ' + e.message);
      }
    }
  };

  const hashPassword = async (pwd: string) => {
    const salt = '$2a$10$w1D6OEv3WjG18A/sP.1eLO';
    return bcrypt.hashSync(pwd, salt);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    try {
      setError(null);
      const hashedPassword = await hashPassword(password);
      
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, hashedPassword);
      } else {
        await signInWithEmailAndPassword(auth, email, hashedPassword);
      }
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Diese E-Mail wird bereits verwendet.');
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setError('E-Mail oder Passwort ist falsch.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('E-Mail/Passwort Anmeldung ist in Firebase noch nicht aktiviert.');
      } else {
        setError('Fehler: ' + err.message);
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh] py-16 px-4">
      <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-sm border border-stone-100 max-w-md w-full text-center">
        <h1 className="font-display text-2xl font-bold text-stone-900 mb-2">
          {isRegistering ? "Registrieren" : "Anmelden"}
        </h1>
        <p className="text-stone-500 text-sm mb-8">
          {isRegistering 
            ? "Erstelle ein neues Konto." 
            : "Melde dich an, um deine Anfragen zu verwalten."}
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm text-left">
            {error}
          </div>
        )}
        
        <form onSubmit={handleEmailAuth} className="flex flex-col gap-3 mb-6">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-Mail Adresse"
            className="w-full px-4 py-3 rounded-xl border border-stone-200 outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all text-sm text-left"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Passwort"
            className="w-full px-4 py-3 rounded-xl border border-stone-200 outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all text-sm text-left"
            required
          />
          <button
            type="submit"
            className="w-full bg-brand text-white py-3 rounded-xl font-medium hover:bg-brand-hover transition-colors"
          >
            {isRegistering ? "Registrieren" : "Anmelden"}
          </button>
          <button
            type="button"
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-sm text-stone-500 hover:text-stone-900 mt-2"
          >
            {isRegistering ? "Bereits ein Konto? Anmelden" : "Noch kein Konto? Registrieren"}
          </button>
        </form>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-stone-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-stone-500">Oder über Drittanbieter</span>
          </div>
        </div>
        
        <div className="flex flex-col gap-3">
          <button
            onClick={handleGoogleLogin}
            className="w-full bg-white border border-stone-200 text-stone-900 py-3 rounded-xl font-medium hover:bg-stone-50 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Mit Google anmelden
          </button>
        </div>
      </div>
    </div>
  );
}
