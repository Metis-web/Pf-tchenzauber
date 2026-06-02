import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(() => {
    return !localStorage.getItem('cookieConsent');
  });

  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true, // Always true
    analytics: false,
    marketing: false,
    functional: false
  });

  const acceptAll = () => {
    localStorage.setItem('cookieConsent', 'all');
    localStorage.setItem('cookiePreferences', JSON.stringify({
      essential: true,
      analytics: true,
      marketing: true,
      functional: true
    }));
    setIsVisible(false);
  };

  const acceptNecessary = () => {
    localStorage.setItem('cookieConsent', 'necessary');
    localStorage.setItem('cookiePreferences', JSON.stringify({
      essential: true,
      analytics: false,
      marketing: false,
      functional: false
    }));
    setIsVisible(false);
  };

  const savePreferences = () => {
    localStorage.setItem('cookieConsent', 'custom');
    localStorage.setItem('cookiePreferences', JSON.stringify(preferences));
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 inset-x-0 pb-2 sm:pb-5 z-[999]"
      >
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <div className="p-4 sm:p-5 bg-stone-900 rounded-2xl shadow-xl border border-stone-800">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="text-white max-w-3xl">
                <p className="font-bold text-lg mb-1">Ihre Privatsphäre ist uns wichtig</p>
                <p className="text-stone-300 text-sm mb-2">
                  Wir verwenden Cookies und ähnliche Technologien, um unsere Webseite optimal zu gestalten und fortlaufend zu verbessern. Dabei verarbeiten wir personenbezogene Daten, um Funktionen für soziale Medien anbieten zu können und die Zugriffe auf unsere Website zu analysieren.
                </p>
                <p className="text-stone-400 text-xs">
                  Durch Klicken auf „Alle akzeptieren“ willigen Sie (jederzeit widerruflich) in diese Datenverarbeitungen ein. Unter „Einstellungen“ können Sie Ihre bevorzugten Einstellungen vornehmen oder die Datenverarbeitungen ablehnen. Sie können Ihre Auswahl jederzeit ändern. Weitere Informationen finden Sie in unserer <a href="/datenschutz" className="text-brand hover:underline">Datenschutzerklärung</a> und im <a href="/impressum" className="text-brand hover:underline">Impressum</a>.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0 md:self-end">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 rounded-xl transition-colors flex items-center justify-center gap-1"
                >
                  Einstellungen {showSettings ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                <button
                  onClick={acceptNecessary}
                  className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 rounded-xl transition-colors"
                >
                  Nur notwendige
                </button>
                <button
                  onClick={acceptAll}
                  className="w-full sm:w-auto px-4 py-2 text-sm font-bold text-white bg-brand hover:bg-brand-hover rounded-xl transition-colors"
                >
                  Alle akzeptieren
                </button>
              </div>
            </div>

            {showSettings && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                className="mt-6 pt-6 border-t border-stone-800 text-stone-200"
              >
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-stone-800/50 rounded-xl border border-stone-800">
                    <div className="flex items-center justify-between mb-2">
                      <label className="font-bold flex items-center gap-2 cursor-not-allowed text-white">
                        <input type="checkbox" checked disabled className="w-4 h-4 rounded appearance-none border border-stone-600 bg-brand relative after:content-['✓'] after:absolute after:text-white after:text-xs after:top-0.5 after:left-0.5" />
                        Essentiell
                      </label>
                    </div>
                    <p className="text-xs text-stone-400">
                      Diese Cookies sind für die grundlegenden Funktionen der Website zwingend erforderlich und können nicht deaktiviert werden. Sie speichern keine personenbezogenen Daten.
                    </p>
                  </div>

                  <div className="p-4 bg-stone-800/50 rounded-xl border border-stone-800">
                    <div className="flex items-center justify-between mb-2">
                      <label className="font-bold flex items-center gap-2 cursor-pointer text-white">
                        <input 
                          type="checkbox" 
                          checked={preferences.functional}
                          onChange={(e) => setPreferences({...preferences, functional: e.target.checked})}
                          className="w-4 h-4 rounded text-brand focus:ring-brand accent-brand"
                        />
                        Funktional
                      </label>
                    </div>
                    <p className="text-xs text-stone-400">
                      Ermöglichen es der Website, erweiterte Funktionalitäten und Personalisierung bereitzustellen, z.B. das Speichern Ihrer Einstellungen.
                    </p>
                  </div>

                  <div className="p-4 bg-stone-800/50 rounded-xl border border-stone-800">
                    <div className="flex items-center justify-between mb-2">
                      <label className="font-bold flex items-center gap-2 cursor-pointer text-white">
                        <input 
                          type="checkbox" 
                          checked={preferences.analytics}
                          onChange={(e) => setPreferences({...preferences, analytics: e.target.checked})}
                          className="w-4 h-4 rounded text-brand focus:ring-brand accent-brand"
                        />
                        Analyse
                      </label>
                    </div>
                    <p className="text-xs text-stone-400">
                      Helfen uns zu verstehen, wie Besucher mit unserer Website interagieren, indem Informationen anonymisiert gesammelt und gemeldet werden.
                    </p>
                  </div>

                  <div className="p-4 bg-stone-800/50 rounded-xl border border-stone-800">
                    <div className="flex items-center justify-between mb-2">
                      <label className="font-bold flex items-center gap-2 cursor-pointer text-white">
                        <input 
                          type="checkbox" 
                          checked={preferences.marketing}
                          onChange={(e) => setPreferences({...preferences, marketing: e.target.checked})}
                          className="w-4 h-4 rounded text-brand focus:ring-brand accent-brand"
                        />
                        Marketing
                      </label>
                    </div>
                    <p className="text-xs text-stone-400">
                      Werden verwendet, um Besuchern auf Websites zu folgen. Die Absicht ist, Anzeigen zu zeigen, die relevant und ansprechend für den Benutzer sind.
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={savePreferences}
                    className="px-4 py-2 text-sm font-medium text-white bg-stone-700 hover:bg-stone-600 rounded-xl transition-colors"
                  >
                    Auswahl speichern
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
