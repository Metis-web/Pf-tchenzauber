import { CreditCard, Heart } from "lucide-react";
import { motion } from "motion/react";

export default function Donate() {
  return (
    <div className="py-16 sm:py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="font-display text-4xl font-black text-stone-900 mb-4">Helfen Sie unseren Tieren</h1>
        <p className="text-stone-600 max-w-2xl mx-auto text-lg leading-relaxed">
          Als kleiner Verein finanzieren wir uns ausschließlich durch Spenden. Jeder Euro hilft uns, 
          Tierarztkosten, Futter und die Unterbringung unserer Schützlinge zu decken.
          Ihre Spende kommt zu 100% bei den Tieren an.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Bank Transfer Card */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-8 text-stone-100 opacity-50 group-hover:scale-110 transition-transform">
             <CreditCard className="w-24 h-24" />
          </div>
          
          <h2 className="font-display text-2xl font-black text-stone-900 mb-8 relative z-10">Direktüberweisung</h2>
          
          {/* Bank Card UI element */}
          <div className="bg-gradient-to-br from-stone-800 to-stone-900 rounded-2xl p-6 text-white shadow-xl relative z-10 mb-6 group-hover:-translate-y-1 transition-transform duration-300">
            <div className="mb-8 flex justify-between items-start">
              <span className="font-display font-medium tracking-wider text-stone-300 uppercase text-xs">Spendenkonto</span>
              <Heart className="w-5 h-5 text-brand" fill="currentColor" />
            </div>
            
            <div className="mb-6">
               <div className="font-mono text-xl sm:text-2xl tracking-widest break-all mb-1">
                 DE15 8306 5408 0005 5021 01
               </div>
            </div>
            
            <div className="flex justify-between items-end gap-4 text-xs font-mono text-stone-300">
               <div>
                  <div className="uppercase mb-1 opacity-70">Empfänger</div>
                  <div className="text-sm text-white">Pfötchenzauber e.V.</div>
               </div>
               <div className="text-right">
                  <div className="uppercase mb-1 opacity-70">BIC</div>
                  <div className="text-sm text-white">GENO DEF1 SLR</div>
               </div>
            </div>
          </div>
          
          <p className="text-sm text-stone-500 relative z-10">
            Bitte geben Sie bei der Überweisung Ihren Namen und Ihre Adresse an, falls Sie eine Spendenbescheinigung benötigen.
          </p>
        </motion.div>

        {/* PayPal Option */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100 flex flex-col h-full items-center justify-center text-center group"
        >
            <div className="w-24 h-24 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <img src="/PayPal_Logo.png" alt="PayPal Logo" className="w-full h-full object-contain mix-blend-multiply" />
            </div>
            <h2 className="font-display text-2xl font-black text-stone-900 mb-4">Schnell & Einfach via PayPal</h2>
            <p className="text-stone-600 mb-8 leading-relaxed">
              Unterstützen Sie uns unkompliziert mit wenigen Klicks. Ihre Spende ist sicher und kommt sofort an.
            </p>
            <a 
              href="https://www.paypal.com/donate/?business=Pfoetchenzauber_eV@outlook.com&item_name=Spende+fuer+Tiere+in+Not&currency_code=EUR" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-[#003087] hover:bg-[#00205c] text-white px-8 py-4 rounded-full font-bold transition-colors w-full sm:w-auto shadow-md"
            >
              Jetzt mit PayPal spenden
            </a>
            <p className="text-xs text-stone-400 mt-6 mt-auto">
              PayPal Email: Pfoetchenzauber_eV@outlook.com
            </p>
        </motion.div>
      </div>
    </div>
  );
}
