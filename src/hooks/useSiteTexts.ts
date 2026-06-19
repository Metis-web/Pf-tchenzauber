import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const DEFAULT_TEXTS = {
  homeHeroTitle: "Wir zaubern <span class='text-brand'>Pfötchen</span> ein<br/> neues Leben.",
  homeHeroSub: "Seriöse Katzenvermittlung & Tierschutz e.V. in Berlin mit großem Herzen. Wir kümmern uns professionell um Straßenkatzen, Fundkatzen und Notfälle aus dem Auslandstierschutz in Berlin und Umgebung. Finden und adoptieren Sie bei uns Ihr neues Familienmitglied!",
  homeEmergencyTitle: "Sie haben eine Frage oder einen Notfall?",
  homeEmergencySub: "Zögern Sie nicht, uns anzurufen. Wir sind in Berlin und Umgebung für unsere Tiere im Einsatz.",
  animalsTitle: "Unsere Schützlinge",
  animalsSub: "Diese wundervollen Seelen warten auf ihr Für-Immer-Zuhause. Kontaktieren Sie uns, wenn Sie einem Tier einen Platz in Ihrem Herzen schenken möchten.",
  teamTitle: "Unser Team",
  teamSub: "Das Herz und die Seele von Pfötchenzauber e.V. - Wir sind mit Leidenschaft und Expertise im Einsatz für Tiere in Not.",
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

export function useSiteTexts() {
  const [texts, setTexts] = useState<any>(DEFAULT_TEXTS);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'siteTexts'), (docSnap) => {
      if (docSnap.exists()) {
        setTexts({ ...DEFAULT_TEXTS, ...docSnap.data() });
      } else {
        setTexts(DEFAULT_TEXTS);
      }
    });

    return () => unsub();
  }, []);

  return texts;
}
