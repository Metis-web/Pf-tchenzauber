import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Users } from 'lucide-react';
import { useSiteTexts } from '../hooks/useSiteTexts';

const TeamMemberCard = ({ member, idx }: { member: any, idx: number, key?: any }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const needsExpansion = member.description && member.description.length > 150;

  return (
    <motion.div
      key={member.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.1 }}
      className="bg-white rounded-3xl overflow-hidden shadow-sm border border-stone-100 hover:shadow-md transition-shadow flex flex-col"
    >
      {member.imageUrl ? (
        <div className="h-64 sm:h-72 w-full relative">
          <img src={member.imageUrl} className="w-full h-full object-cover" alt={member.name} />
        </div>
      ) : (
        <div className="h-64 sm:h-72 w-full bg-stone-100 flex items-center justify-center">
          <Users className="w-16 h-16 text-stone-300" />
        </div>
      )}
      <div className="p-6 md:p-8 flex flex-col flex-1">
        <h3 className="font-display text-2xl font-bold text-stone-900 mb-1">{member.name}</h3>
        <p className="text-brand font-bold uppercase tracking-wider text-sm mb-4">{member.role}</p>
        <div className={`text-stone-600 leading-relaxed ${!isExpanded ? 'line-clamp-4' : ''}`}>
          {member.description}
        </div>
        {needsExpansion && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-brand hover:text-brand-hover font-medium text-sm mt-3 self-start"
          >
            {isExpanded ? "Weniger lesen" : "Mehr lesen"}
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default function Team() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const texts = useSiteTexts();

  useEffect(() => {
    const q = query(collection(db, 'teamMembers'), orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setMembers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter((m: any) => !m.isDeleted));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center p-4 bg-brand/10 rounded-full mb-6">
            <Users className="w-8 h-8 text-brand" />
          </div>
          <div className="font-display text-4xl md:text-5xl lg:text-6xl font-black text-stone-900 mb-6 tracking-tight" dangerouslySetInnerHTML={{ __html: texts.teamTitle || "Unser Team" }} />
          <div className="text-xl text-stone-600 max-w-2xl mx-auto" dangerouslySetInnerHTML={{ __html: texts.teamSub || "Wir kümmern uns mit ganz viel Herz um Notfälle und Schützlinge." }}></div>
        </motion.div>

        {members.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[3rem] shadow-sm border border-stone-100">
            <p className="text-stone-500 font-medium">Bisher wurden keine Team-Mitglieder hinzugefügt.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {members.map((member, idx) => (
              <TeamMemberCard key={member.id} member={member} idx={idx} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
