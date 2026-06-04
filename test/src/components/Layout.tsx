import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Heart, Menu, X, LogOut, User as UserIcon, Instagram, Facebook, PawPrint } from 'lucide-react';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import CookieBanner from './CookieBanner';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin, logout } = useAuth();

  React.useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.substring(1));
      if (element) {
        setTimeout(() => element.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);

  const toggleMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <div className="min-h-screen flex flex-col font-sans w-full max-w-full relative bg-white">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-24 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-4 group">
            <div className="w-20 h-20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <img src="/Logo.png" alt="Pfötchenzauber Logo" className="w-full h-full object-contain" onError={(e) => { e.currentTarget.src = 'https://placehold.co/100x100/a81c25/ffffff?text=PZ'; }} />
            </div>
            <span className="font-display font-black text-xl sm:text-2xl md:text-3xl text-stone-900 tracking-tight">Pfötchenzauber e.V.</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-stone-600 hover:text-brand font-medium transition-colors">Startseite</Link>
            <Link to="/team" className="text-stone-600 hover:text-brand font-medium transition-colors">Unser Team</Link>
            <Link to="/tiere" className="text-stone-600 hover:text-brand font-medium transition-colors">Unsere Schützlinge</Link>
            <Link to="/spenden" className="bg-brand hover:bg-brand-hover text-white px-5 py-2.5 rounded-full font-medium transition-colors flex items-center gap-2 shadow-sm hover:shadow-md">
              <Heart className="w-4 h-4" /> Spenden
            </Link>
            {user ? (
               <div className="flex items-center gap-4 ml-4 pl-4 border-l border-stone-200">
                 {isAdmin ? (
                   <Link to="/admin/dashboard" className="flex items-center gap-2 text-stone-600 hover:text-brand font-medium transition-colors">
                     <UserIcon className="w-4 h-4" />
                     {user.displayName || user.email?.split('@')[0] || 'Admin'}
                   </Link>
                 ) : (
                   <span className="text-sm text-stone-500 font-medium">{user.displayName || user.email?.split('@')[0] || user.phoneNumber || 'Benutzer'}</span>
                 )}
                 <button onClick={() => logout()} className="text-stone-400 hover:text-stone-900 transition-colors" title="Abmelden">
                    <LogOut className="w-5 h-5" />
                 </button>
               </div>
            ) : (
              <Link to="/login" className="flex items-center gap-2 text-stone-500 hover:text-stone-900 font-medium transition-colors ml-4 pl-4 border-l border-stone-200">
                <UserIcon className="w-5 h-5" /> Login
              </Link>
            )}
          </nav>

          <button className="md:hidden p-2 text-stone-600" onClick={toggleMenu}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden bg-white border-t border-stone-100 px-4 py-4 space-y-4 shadow-lg absolute w-full overflow-hidden"
            >
              <Link to="/" onClick={toggleMenu} className="block text-stone-600 font-medium py-2">Startseite</Link>
              <Link to="/team" onClick={toggleMenu} className="block text-stone-600 font-medium py-2">Unser Team</Link>
              <Link to="/tiere" onClick={toggleMenu} className="block text-stone-600 font-medium py-2">Unsere Schützlinge</Link>
              <Link to="/spenden" onClick={toggleMenu} className="block text-brand font-medium py-2">Spenden</Link>
              {user ? (
                 <div className="pt-2 border-t border-stone-100 mt-2">
                   {isAdmin && <Link to="/admin/dashboard" onClick={toggleMenu} className="block text-stone-600 font-medium py-2">{user.displayName || user.email?.split('@')[0] || 'Admin'}</Link>}
                   <button onClick={() => { logout(); toggleMenu(); }} className="w-full text-left font-medium py-2 text-stone-500">Abmelden</button>
                 </div>
              ) : (
                 <Link to="/login" onClick={toggleMenu} className="block text-stone-500 font-medium py-2 border-t border-stone-100 mt-2 pt-4">Anmelden</Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key="page-wrap"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="h-full flex flex-col"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="bg-white border-t border-stone-200 text-stone-600 py-12 mt-auto relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div 
              className="flex items-center gap-3 mb-4 cursor-default" 
              onDoubleClick={() => navigate('/login')}
            >
               <div className="w-20 h-20 flex items-center justify-center shrink-0 opacity-90">
                  <img src="/Logo.png" alt="Pfötchenzauber Logo" className="w-full h-full object-contain" onError={(e) => { e.currentTarget.src = 'https://placehold.co/100x100/a81c25/ffffff?text=PZ'; }} />
               </div>
               <span className="font-display font-black text-xl sm:text-2xl text-stone-900 select-none">Pfötchenzauber e.V.</span>
            </div>
            <p className="text-sm border-l-2 border-stone-200 pl-4 py-1 italic">Wir kümmern uns mit ganz viel Herz um Notfälle und Schützlinge in Berlin. Die Spenden kommen zu 100 Prozent den Tieren zugute.</p>
          </div>
          <div>
            <h4 className="text-stone-900 font-bold mb-4 font-display">Kontakt</h4>
            <ul className="space-y-2 text-sm">
              <li>Berlin, Deutschland</li>
              <li>Telefon: 0178 5305137</li>
              <li>Email: Pfoetchenzauber_eV@outlook.com</li>
            </ul>
          </div>
          <div>
            <h4 className="text-stone-900 font-bold mb-4 font-display">Verein</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/team" className="hover:text-brand transition-colors">Unser Team</Link></li>
              <li><Link to="/impressum" className="hover:text-brand transition-colors">Impressum</Link></li>
              <li><Link to="/datenschutz" className="hover:text-brand transition-colors">Datenschutz</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-stone-900 font-bold mb-4 font-display">Folge uns</h4>
            <div className="flex gap-4">
              <a href="https://www.instagram.com/pfoetchenzauber_e.v/" target="_blank" rel="noopener noreferrer" title="Instagram" className="text-stone-500 hover:text-brand transition-colors p-2.5 bg-stone-100 rounded-full hover:bg-stone-200">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://www.facebook.com/profile.php?id=61567937905487" target="_blank" rel="noopener noreferrer" title="Facebook" className="text-stone-500 hover:text-brand transition-colors p-2.5 bg-stone-100 rounded-full hover:bg-stone-200">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://www.tiktok.com/@pfoetchenzauber.e.v" target="_blank" rel="noopener noreferrer" title="TikTok" className="text-stone-500 hover:text-brand transition-colors p-2.5 bg-stone-100 rounded-full hover:bg-stone-200 flex items-center justify-center">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-stone-100 text-sm text-center">
          &copy; 2026 Pfötchenzauber e.V. Alle Rechte vorbehalten.
        </div>
      </footer>
      <CookieBanner />
    </div>
  );
}
