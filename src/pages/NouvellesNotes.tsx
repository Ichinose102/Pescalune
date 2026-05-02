import React, { useState } from 'react';
import { Calculator as CalcIcon, StickyNote, Save } from 'lucide-react';
import Calculator from '../components/Calculator';

const NouvellesNotes: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'notes' | 'calculator'>('notes');
  const [note, setNote] = useState('');

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-vert-foret">Espace Prise de Notes</h1>
        <div className="flex bg-white rounded-lg p-1 shadow-sm border border-vert-sauge/20">
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
              activeTab === 'notes' ? 'bg-vert-olive text-white shadow-md' : 'text-vert-foret hover:bg-rose-poudre/50'
            }`}
          >
            <StickyNote size={20} />
            <span>Notes</span>
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
              activeTab === 'calculator' ? 'bg-vert-olive text-white shadow-md' : 'text-vert-foret hover:bg-rose-poudre/50'
            }`}
          >
            <CalcIcon size={20} />
            <span>Calculatrice</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-vert-sauge/20 overflow-hidden min-h-[500px]">
        {activeTab === 'notes' ? (
          <div className="p-6 h-full flex flex-col">
            <textarea
              className="flex-1 w-full p-4 border-none focus:ring-0 text-lg text-vert-foret placeholder:text-vert-sauge/40 resize-none"
              placeholder="Commencez à écrire vos notes ici..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            ></textarea>
            <div className="mt-4 pt-4 border-t border-rose-poudre flex justify-end">
              <button 
                className="flex items-center gap-2 bg-vert-olive text-white px-6 py-2 rounded-full hover:bg-vert-foret transition-colors shadow-lg"
                onClick={() => {
                  // In a real app, this would save to DB
                  alert('Note enregistrée (simulation)');
                }}
              >
                <Save size={20} />
                Enregistrer
              </button>
            </div>
          </div>
        ) : (
          <div className="p-12 flex items-center justify-center bg-rose-poudre/10 h-full">
            <Calculator />
          </div>
        )}
      </div>
    </div>
  );
};

export default NouvellesNotes;
