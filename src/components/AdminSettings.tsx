import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

const DEFAULT_DATENSCHUTZ = `Datenschutzerklärung

1. Datenschutz auf einen Blick
Allgemeine Hinweise
Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie unsere Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können. Ausführliche Informationen zum Thema Datenschutz entnehmen Sie unserer unter diesem Text aufgeführten Datenschutzerklärung.

2. Allgemeine Hinweise und Pflichtinformationen
Datenschutz
Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.

Verantwortliche Stelle
Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:
Pfötchenzauber e.V.
Berlin, Deutschland
Telefon: 0178 5305137
E-Mail: Pfoetchenzauber_eV@outlook.com

Speicherdauer
Soweit innerhalb dieser Datenschutzerklärung keine speziellere Speicherdauer genannt wurde, verbleiben Ihre personenbezogenen Daten bei uns, bis der Zweck für die Datenverarbeitung entfällt. Wenn Sie ein berechtigtes Löschersuchen geltend machen oder eine Einwilligung zur Datenverarbeitung widerrufen, werden Ihre Daten gelöscht, sofern wir keine anderen rechtlich zulässigen Gründe für die Speicherung Ihrer personenbezogenen Daten haben (z. B. steuer- oder handelsrechtliche Aufbewahrungsfristen); im letztgenannten Fall erfolgt die Löschung nach Fortfall dieser Gründe.

3. Datenerfassung auf unserer Website
Cookies und lokaler Speicher
Unsere Website verwendet Local Storage und Cookies (oder vergleichbare Technologien), um Kernfunktionalitäten (z. B. den Anmeldestatus) sicherzustellen. Dies geschieht auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO. Wir haben ein berechtigtes Interesse an der fehlerfreien und optimierten Bereitstellung unserer Dienste.

Registrierung, Nutzerkonten & Tier-Anfragen
Wenn Sie sich registrieren oder Tier-Anfragen stellen, speichern wir Ihre E-Mail-Adresse, den angegebenen Namen und Ihre Anfragen zur Bearbeitung bei uns. Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO, sofern Ihre Anfrage mit der Erfüllung eines Vertrags zusammenhängt oder zur Durchführung vorvertraglicher Maßnahmen erforderlich ist. Ansonsten beruht die Verarbeitung auf unserem berechtigten Interesse (Art. 6 Abs. 1 lit. f DSGVO) an der effektiven Bearbeitung der an uns gerichteten Anfragen.

4. Spenden und Zahlungsanbieter
PayPal
Auf dieser Website bieten wir u. a. die Bezahlung von Spenden via PayPal an. Anbieter dieses Zahlungsdienstes ist die PayPal (Europe) S.à.r.l. et Cie, S.C.A., 22-24 Boulevard Royal, L-2449 Luxembourg (im Folgenden "PayPal").
Wenn Sie die Bezahlung via PayPal auswählen, werden die von Ihnen eingegebenen Zahlungsdaten an PayPal übermittelt.
Die Übermittlung Ihrer Daten an PayPal erfolgt auf Grundlage von Art. 6 Abs. 1 lit. a DSGVO (Einwilligung) und Art. 6 Abs. 1 lit. b DSGVO (Verarbeitung zur Erfüllung eines Vertrags). Sie haben die Möglichkeit, Ihre Einwilligung zur Datenverarbeitung jederzeit zu widerrufen. Ein Widerruf wirkt sich auf die Wirksamkeit von in der Vergangenheit liegenden Datenverarbeitungsvorgängen nicht aus.
Weitere Details entnehmen Sie der Datenschutzerklärung von PayPal: https://www.paypal.com/de/webapps/mpp/ua/privacy-full.

Banküberweisung (Spenden)
Wenn Sie uns Spenden per Banküberweisung zukommen lassen, verarbeiten wir die Daten, die uns Ihre und unsere Bank übermitteln (z.B. Name, Kontonummer/IBAN, Verwendungszweck, Betrag). Diese Verarbeitung erfolgt zur Erfüllung des Spendenvertrags bzw. aufgrund unseres berechtigten Interesses an der reibungslosen Zahlungsabwicklung gemäß Art. 6 Abs. 1 lit. b und f DSGVO. Die Daten werden gemäß den gesetzlichen (insbesondere steuerrechtlichen) Aufbewahrungsfristen gespeichert.

5. Hosting und Backend
Google Firebase
Wir nutzen für Backend, Datenbank (Firestore) und Authentifizierung Google Firebase. Anbieter ist die Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland.
Firebase verarbeitet IP-Adressen und Metadaten zu Sicherheitszwecken, um die Funktionalität und Sicherheit unserer Website zu gewährleisten. Wir haben mit Google einen Vertrag zur Auftragsverarbeitung (AVV) abgeschlossen. Die Datenverarbeitung kann teilweise auf Servern in den USA erfolgen. Der Datentransfer in die USA stützt sich auf die Standardvertragsklauseln der EU-Kommission und den Angemessenheitsbeschluss (Data Privacy Framework). Bei Anmeldung über Firebase Authentication wird Ihre E-Mail-Adresse und ggf. Ihr Passwort sicher verschlüsselt von Google verwaltet. Die Nutzung von Firebase erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO. Wir haben ein berechtigtes Interesse an einer möglichst zuverlässigen Darstellung und Sicherheit unserer Website.

6. Ihre Rechte
Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft, Empfänger und Zweck Ihrer gespeicherten personenbezogenen Daten zu erhalten. Sie haben außerdem ein Recht, die Berichtigung oder Löschung dieser Daten zu verlangen. Wenn Sie eine Einwilligung zur Datenverarbeitung erteilt haben, können Sie diese Einwilligung jederzeit für die Zukunft widerrufen. Außerdem haben Sie das Recht, unter bestimmten Umständen die Einschränkung der Verarbeitung Ihrer personenbezogenen Daten zu verlangen. Des Weiteren steht Ihnen ein Beschwerderecht bei der zuständigen Aufsichtsbehörde zu.`;


export default function AdminSettings() {
  const [status, setStatus] = useState<'accepting' | 'full'>('accepting');
  const [adoptedCount, setAdoptedCount] = useState<string>('');
  const [impressumText, setImpressumText] = useState<string>('');
  const [datenschutzText, setDatenschutzText] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingTexts, setIsSavingTexts] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'emergency'), (docSnap) => {
      if (docSnap.exists()) {
        setStatus(docSnap.data().status as 'accepting' | 'full');
      }
    });
    const unsubStats = onSnapshot(doc(db, 'settings', 'stats'), (docSnap) => {
      if (docSnap.exists() && docSnap.data().adoptedCount) {
        setAdoptedCount(docSnap.data().adoptedCount.toString());
      }
    });
    const unsubDocs = onSnapshot(doc(db, 'settings', 'legal'), (docSnap) => {
      if (docSnap.exists()) {
        setImpressumText(docSnap.data().impressum || '');
        setDatenschutzText(docSnap.data().datenschutz || '');
      }
    });

    return () => {
      unsub();
      unsubStats();
      unsubDocs();
    };
  }, []);

  const handleChange = async (newStatus: 'accepting' | 'full') => {
    await setDoc(doc(db, 'settings', 'emergency'), { status: newStatus }, { merge: true });
    setStatus(newStatus);
  };

  const handleSaveCount = async () => {
    setIsSaving(true);
    await setDoc(doc(db, 'settings', 'stats'), { adoptedCount: Number(adoptedCount) }, { merge: true });
    setIsSaving(false);
  };

  const handleSaveLegal = async () => {
    setIsSavingTexts(true);
    await setDoc(doc(db, 'settings', 'legal'), { 
      impressum: impressumText,
      datenschutz: datenschutzText
    }, { merge: true });
    setIsSavingTexts(false);
  };

  return (
    <div className="space-y-8 max-w-2xl bg-white p-6 sm:p-8 rounded-3xl border shadow-sm">
      <h2 className="font-display text-2xl font-bold text-stone-900 border-b pb-4">Einstellungen</h2>
      
      <div>
        <h3 className="font-bold text-lg mb-2">Notfall Anzeige</h3>
        <p className="text-stone-600 mb-4">Hier kannst du einstellen, ob der Tierschutzverein aktuell Kapazitäten für neue Notfälle hat oder ob ein Aufnahmestopp besteht.</p>
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <label className={`flex-1 flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-colors ${status === 'accepting' ? 'border-green-500 bg-green-50' : 'border-stone-200 hover:bg-stone-50'}`}>
            <input type="radio" name="emergency_status" value="accepting" checked={status === 'accepting'} onChange={() => handleChange('accepting')} className="text-green-500 focus:ring-green-500" />
            <div>
              <div className="font-bold text-stone-900">Wir nehmen Tiere auf</div>
              <div className="text-sm text-stone-500">Es gibt Platz für weitere Tiere.</div>
            </div>
          </label>
          <label className={`flex-1 flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-colors ${status === 'full' ? 'border-red-500 bg-red-50' : 'border-stone-200 hover:bg-stone-50'}`}>
            <input type="radio" name="emergency_status" value="full" checked={status === 'full'} onChange={() => handleChange('full')} className="text-red-500 focus:ring-red-500" />
            <div>
              <div className="font-bold text-stone-900">Aufnahmestopp</div>
              <div className="text-sm text-stone-500">Aktuell ist jeder Platz belegt.</div>
            </div>
          </label>
        </div>
      </div>

      <div className="pt-8 border-t border-stone-200">
        <h3 className="font-bold text-lg mb-2">Vermittelte Tiere</h3>
        <p className="text-stone-600 mb-4">Zeige auf der Startseite an, wie vielen Tieren bereits geholfen werden konnte.</p>
        <div className="flex gap-4 items-center">
            <input 
                type="number" 
                value={adoptedCount}
                onChange={(e) => setAdoptedCount(e.target.value)}
                className="flex-1 max-w-[200px] border border-stone-300 rounded-xl px-4 py-2 focus:ring-brand focus:border-brand"
                placeholder="Zahl eingeben"
            />
            <button 
                onClick={handleSaveCount}
                disabled={isSaving}
                className="bg-brand text-white px-6 py-2 rounded-xl font-bold hover:bg-brand-hover transition-colors"
            >
                {isSaving ? 'Speichert...' : 'Speichern'}
            </button>
        </div>
      </div>

      <div className="pt-8 border-t border-stone-200 space-y-6">
        <div>
          <h3 className="font-bold text-lg mb-2">Impressum</h3>
          <p className="text-stone-600 mb-4 text-sm">Der Text wird 1:1 auf der Impressum-Seite angezeigt (Markdown wird nicht direkt unterstützt, Zeilenumbrüche bleiben erhalten).</p>
          <textarea
            value={impressumText}
            onChange={(e) => setImpressumText(e.target.value)}
            rows={10}
            className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:ring-brand focus:border-brand"
            placeholder="Impressumstext hier einfügen..."
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-lg">Datenschutzerklärung</h3>
            <button 
                onClick={() => setDatenschutzText(DEFAULT_DATENSCHUTZ)}
                className="text-xs font-bold text-brand hover:text-brand-hover bg-brand/10 hover:bg-brand/20 px-3 py-1.5 rounded-lg transition-colors"
                title="Generiert einen Standardtext für die Datenschutzerklärung"
            >
                Standardtext laden
            </button>
          </div>
          <p className="text-stone-600 mb-4 text-sm">Der Text wird auf der Datenschutz-Seite angezeigt.</p>
          <textarea
            value={datenschutzText}
            onChange={(e) => setDatenschutzText(e.target.value)}
            rows={15}
            className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:ring-brand focus:border-brand"
            placeholder="Datenschutztext hier einfügen..."
          />
        </div>
        <button 
            onClick={handleSaveLegal}
            disabled={isSavingTexts}
            className="bg-brand text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-hover transition-colors w-full sm:w-auto"
        >
            {isSavingTexts ? 'Speichert...' : 'Impressum & Datenschutz speichern'}
        </button>
      </div>
    </div>
  );
}
