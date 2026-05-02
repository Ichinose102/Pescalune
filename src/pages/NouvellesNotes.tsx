import React from 'react';
import Calculator from '../components/Calculator';

const NouvellesNotes: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-vert-foret dark:text-slate-100">Calculatrice</h1>
          <p className="text-vert-sauge dark:text-slate-400">Outil de calcul rapide</p>
        </div>
      </div>
      <div className="mt-6 flex justify-center">
        <Calculator />
      </div>
    </div>
  );
};

export default NouvellesNotes;
