import React, { useState } from 'react';
import { Calculator as CalcIcon, StickyNote, Save } from 'lucide-react';
import Calculator from '../components/Calculator';

const NouvellesNotes: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'notes' | 'calculator'>('notes');
  const [note, setNote] = useState('');

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-vert-foret dark:text-slate-100">Espace Prise de Notes</h1>
          <p className="text-vert-sauge dark:text-slate-400">Outils rapides pour votre gestion quotidienne</p>
        </div>
        
        <div className="inline-flex bg-white dark:bg-slate-900 rounded-2xl p-1.5 shadow-sm border border-vert-sauge/20 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${
              activeTab === 'notes' 
                ? 'bg-vert-olive text-white shadow-lg' 
                : 'text-vert-sauge hover:text-vert-foret dark:hover:text-slate-200'
            }`}
          >
            <StickyNote size={20} />
            <span>Bloc-notes</span>
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${
              activeTab === 'calculator' 
                ? 'bg-vert-olive text-white shadow-lg' 
                : 'text-vert-sauge hover:text-vert-foret dark:hover:text-slate-200'
            }`}
          >
            <CalcIcon size={20} />
            <span>Calculatrice</span>
          </button>
        </div>
      </div>

      <div className="card min-h-[600px] flex flex-col overflow-hidden animate-slide-up">
        {activeTab === 'notes' ? (
          <div className="p-8 h-full flex flex-col flex-1">
            <div className="flex items-center justify-between mb-4 border-b border-rose-poudre dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3 text-vert-foret dark:text-slate-200 font-bold uppercase text-xs tracking-widest">
                <StickyNote size={16} className="text-vert-olive" />
                Note en cours
              </div>
              <span className="text-[10px] text-vert-sauge dark:text-slate-500 font-bold uppercase tracking-widest italic">Sauvegarde automatique activée</span>
            </div>
            
            <textarea
              className="flex-1 w-full p-4 bg-transparent border-none focus:ring-0 text-xl text-vert-foret dark:text-slate-200 placeholder:text-vert-sauge/30 dark:placeholder:text-slate-700 resize-none font-serif leading-relaxed"
              placeholder="Commencez à rédiger vos remarques, rappels ou consignes ici..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            ></textarea>
            
            <div className="mt-8 flex justify-end">
              <button 
                className="btn-primary py-4 px-8 shadow-xl shadow-vert-olive/20"
                onClick={() => {
                  alert('Note enregistrée (simulation)');
                }}
              >
                <Save size={22} />
                Sauvegarder la note
              </button>
            </div>
          </div>
        ) : (
          <div className="p-12 flex flex-col items-center justify-center bg-rose-poudre/10 dark:bg-slate-800/20 flex-1">
            <div className="mb-10 text-center space-y-2">
              <h3 className="text-xl font-bold text-vert-foret dark:text-slate-200 uppercase tracking-widest">Calculatrice Rapide</h3>
              <p className="text-sm text-vert-sauge dark:text-slate-500">Pratique pour les additions complexes ou les remises</p>
            </div>
            <div className="scale-110 lg:scale-125 transition-transform">
              <Calculator />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NouvellesNotes;
