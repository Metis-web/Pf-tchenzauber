import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Heart, Menu, X, LogOut, User as UserIcon, Instagram, Facebook, PawPrint } from 'lucide-react';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import CookieBanner from './CookieBanner';
import { useAuth } from '../context/AuthContext';
import { useSiteTexts } from '../hooks/useSiteTexts';
import { useMaintenanceMode } from '../hooks/useMaintenanceMode';

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin, logout } = useAuth();
  const texts = useSiteTexts() || {};
  const { maintenanceMode } = useMaintenanceMode();

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

  const getActivePage = () => {
    if (location.pathname === '/') return 'home';
    if (location.pathname === '/team') return 'team';
    if (location.pathname === '/tiere') return 'animals';
    if (location.pathname === '/spenden') return 'donate';
    return 'other';
  };
  const activePage = getActivePage();
  const currentPageElements = (texts.newElements || []).filter((el: any) => !el.page || el.page === activePage);

  const isLoginRoute = location.pathname === '/login';
  const showMaintenance = maintenanceMode && !isAdmin && !isLoginRoute;

  return (
    <div className="min-h-screen flex flex-col font-sans w-full max-w-full relative bg-white">
      {currentPageElements.length > 0 && (
         <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden flex justify-center">
            <div className="w-full max-w-7xl relative h-full">
               {currentPageElements.map((el: any) => (
                  <div 
                    key={el.id}
                    style={{ position: 'absolute', left: el.x, top: el.y, ...el.styles }}
                    dangerouslySetInnerHTML={{ __html: el.text }}
                  />
               ))}
            </div>
         </div>
      )}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-24 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-4 group">
            <div className="w-20 h-20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <img src="/Logo.png" alt="Pfötchenzauber Logo" className="w-full h-full object-contain" onError={(e) => { e.currentTarget.src = 'https://placehold.co/100x100/a81c25/ffffff?text=PZ'; }} />
            </div>
            <span className="font-display font-black text-xl sm:text-2xl md:text-3xl text-stone-900 tracking-tight">Pfötchenzauber e.V.</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-stone-600 hover:text-brand font-medium transition-colors" dangerouslySetInnerHTML={{ __html: texts.navHome || "Startseite" }} />
            <Link to="/team" className="text-stone-600 hover:text-brand font-medium transition-colors" dangerouslySetInnerHTML={{ __html: texts.navTeam || "Unser Team" }} />
            <Link to="/tiere" className="text-stone-600 hover:text-brand font-medium transition-colors" dangerouslySetInnerHTML={{ __html: texts.navAnimals || "Unsere Schützlinge" }} />
            <Link to="/spenden" className="bg-brand hover:bg-brand-hover text-white px-5 py-2.5 rounded-full font-medium transition-colors flex items-center gap-2 shadow-sm hover:shadow-md">
              <Heart className="w-4 h-4" /> <span dangerouslySetInnerHTML={{ __html: texts.navDonate || "Spenden" }} />
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
                <UserIcon className="w-5 h-5" /> <span dangerouslySetInnerHTML={{ __html: texts.navLogin || "Login" }} />
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
              <Link to="/" onClick={toggleMenu} className="block text-stone-600 font-medium py-2" dangerouslySetInnerHTML={{ __html: texts.navHome || "Startseite" }} />
              <Link to="/team" onClick={toggleMenu} className="block text-stone-600 font-medium py-2" dangerouslySetInnerHTML={{ __html: texts.navTeam || "Unser Team" }} />
              <Link to="/tiere" onClick={toggleMenu} className="block text-stone-600 font-medium py-2" dangerouslySetInnerHTML={{ __html: texts.navAnimals || "Unsere Schützlinge" }} />
              <Link to="/spenden" onClick={toggleMenu} className="block text-brand font-medium py-2" dangerouslySetInnerHTML={{ __html: texts.navDonate || "Spenden" }} />
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

      <main className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          {showMaintenance ? (
            <motion.div
              key="maintenance-wrap"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[60vh]"
            >
              <div className="bg-stone-50 p-12 rounded-3xl max-w-2xl border border-stone-200">
                <svg className="w-16 h-16 mx-auto text-amber-500 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-stone-900 mb-4 tracking-tight">Wartungsarbeiten</h1>
                <p className="text-xl text-stone-600 mb-6 font-medium">Es tut uns Leid für die Umstände.</p>
                <p className="text-stone-500 leading-relaxed text-lg">
                  Wir befinden uns aktuell in Wartungsarbeiten, um unsere Website für euch und unsere Schützlinge noch besser zu machen. <br/><br/>
                  Bitte versucht es später noch einmal. Danke für euer Verständnis!
                </p>
              </div>
            </motion.div>
          ) : (
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
          )}
        </AnimatePresence>
      </main>

      {!showMaintenance && (
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
            <p className="text-sm border-l-2 border-stone-200 pl-4 py-1 italic" dangerouslySetInnerHTML={{ __html: texts.footerAbout || "Wir kümmern uns mit ganz viel Herz um Notfälle und Schützlinge in Berlin. Die Spenden kommen zu 100 Prozent den Tieren zugute." }} />
          </div>
          <div>
            <h4 className="text-stone-900 font-bold mb-4 font-display">Kontakt</h4>
            <ul className="space-y-2 text-sm">
              <li dangerouslySetInnerHTML={{ __html: texts.footerAddress || "Berlin, Deutschland" }} />
              <li dangerouslySetInnerHTML={{ __html: texts.footerPhone || "Telefon: 0178 5305137" }} />
              <li dangerouslySetInnerHTML={{ __html: texts.footerEmail || "Email: Pfoetchenzauber_eV@outlook.com" }} />
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-stone-100 text-sm text-center" dangerouslySetInnerHTML={{ __html: texts.footerRights || "&copy; 2026 Pfötchenzauber e.V. Alle Rechte vorbehalten." }} />
      </footer>
      )}
      <CookieBanner />
    </div>
  );
}
