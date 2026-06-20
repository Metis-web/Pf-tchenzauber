import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const DEFAULT_TEXTS = {
  homeHeroTitle: "Wir zaubern <span class='text-brand'>Pfötchen</span> ein<br/> neues Leben.",
  homeHeroSubV2: "<div class='flex flex-col gap-4 text-center'>\n  <p class='font-medium text-stone-800 text-2xl'>Seriöse Katzenvermittlung & Tierschutz in Berlin</p>\n  <p>Pfötchenzauber e.V. setzt sich mit großem Herz und Engagement für Katzen in Not ein. Unser Schwerpunkt liegt auf der Versorgung von Straßenkatzen, Fundkatzen, Muttertieren mit ihren Kitten sowie Katzenkindern, die ohne Hilfe keine Chance hätten.</p>\n  <p>Wir pflegen, versorgen und begleiten unsere Schützlinge liebevoll, bis sie bereit sind, in ein passendes und dauerhaftes Zuhause umzuziehen.</p>\n  <p>Gemeinsam schenken wir Katzen in Not eine zweite Chance und den Start in ein neues Leben.</p>\n  <p class='font-medium text-brand text-lg mt-2'>Für die, die leise leiden - wir schenken ihnen eine Stimme und ein Zuhause</p>\n</div>",
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
