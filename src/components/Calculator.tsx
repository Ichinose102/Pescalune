import React, { useState } from 'react';
import { Delete, Equal, Hash, Percent } from 'lucide-react';

const Calculator: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [isNewNumber, setIsNewNewNumber] = useState(true);

  const handleNumber = (num: string) => {
    if (isNewNumber) {
      setDisplay(num === '.' ? '0.' : num);
      setIsNewNewNumber(false);
    } else {
      if (num === '.' && display.includes('.')) return;
      setDisplay(display === '0' && num !== '.' ? num : display + num);
    }
  };

  const handleOperator = (op: string) => {
    setEquation(display + ' ' + op + ' ');
    setIsNewNewNumber(true);
  };

  const calculate = () => {
    try {
      const fullEquation = equation + display;
      const result = new Function('return ' + fullEquation.replace(/x/g, '*').replace(/÷/g, '/'))();
      const formattedResult = Number.isInteger(result) 
        ? String(result) 
        : parseFloat(result.toFixed(8)).toString();
      setDisplay(formattedResult);
      setEquation('');
      setIsNewNewNumber(true);
    } catch (error) {
      setDisplay('Error');
      setIsNewNewNumber(true);
    }
  };

  const clear = () => {
    setDisplay('0');
    setEquation('');
    setIsNewNewNumber(true);
  };

  const backspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
      setIsNewNewNumber(true);
    }
  };

  const percent = () => {
    setDisplay(String(parseFloat(display) / 100));
    setIsNewNewNumber(true);
  };

  const buttons = [
    { label: 'C', action: clear, color: 'text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20' },
    { label: '±', action: () => setDisplay(String(parseFloat(display) * -1)), color: 'text-vert-olive dark:text-vert-sauge bg-rose-poudre/30 dark:bg-slate-800/50' },
    { label: '%', action: percent, color: 'text-vert-olive dark:text-vert-sauge bg-rose-poudre/30 dark:bg-slate-800/50', icon: <Percent size={18} /> },
    { label: '÷', action: () => handleOperator('÷'), color: 'bg-vert-olive text-white shadow-lg shadow-vert-olive/20' },
    { label: '7', action: () => handleNumber('7') },
    { label: '8', action: () => handleNumber('8') },
    { label: '9', action: () => handleNumber('9') },
    { label: 'x', action: () => handleOperator('x'), color: 'bg-vert-olive text-white shadow-lg shadow-vert-olive/20' },
    { label: '4', action: () => handleNumber('4') },
    { label: '5', action: () => handleNumber('5') },
    { label: '6', action: () => handleNumber('6') },
    { label: '-', action: () => handleOperator('-'), color: 'bg-vert-olive text-white shadow-lg shadow-vert-olive/20' },
    { label: '1', action: () => handleNumber('1') },
    { label: '2', action: () => handleNumber('2') },
    { label: '3', action: () => handleNumber('3') },
    { label: '+', action: () => handleOperator('+'), color: 'bg-vert-olive text-white shadow-lg shadow-vert-olive/20' },
    { label: '0', action: () => handleNumber('0'), colSpan: 2 },
    { label: '.', action: () => handleNumber('.') },
    { label: '=', action: calculate, color: 'bg-vert-foret dark:bg-slate-700 text-white shadow-lg shadow-vert-foret/20', icon: <Equal size={22} /> },
  ];

  return (
    <div className="w-full max-w-[340px] md:max-w-4xl p-6 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-vert-sauge/10 dark:border-slate-800 animate-slide-up transition-all duration-500">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Left Side (PC) / Top (Mobile) : Screen Area */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="mb-4 px-6 py-10 bg-rose-poudre/20 dark:bg-slate-800/30 rounded-[2rem] flex flex-col items-end justify-center min-h-[160px] md:min-h-[280px] overflow-hidden border border-rose-poudre dark:border-slate-800/50 transition-all">
            <div className="text-sm md:text-xl font-bold text-vert-sauge dark:text-slate-500 h-6 mb-2 tracking-wider uppercase">
              {equation}
            </div>
            <div className="text-5xl md:text-7xl font-black text-vert-foret dark:text-slate-100 truncate w-full text-right transition-all">
              {display}
            </div>
          </div>
          
          <div className="hidden md:flex items-center justify-between px-4 opacity-40">
             <div className="flex items-center gap-2">
                <Hash size={16} className="text-vert-olive" />
                <span className="text-xs font-black uppercase tracking-[0.3em] text-vert-foret dark:text-slate-400">Pescalune Pro</span>
             </div>
             <button 
              onClick={clear}
              className="text-xs font-bold uppercase tracking-widest text-rose-500 hover:text-rose-600 transition-colors"
            >
              Reset System
            </button>
          </div>
        </div>

        {/* Right Side (PC) / Bottom (Mobile) : Keypad */}
        <div className="w-full md:w-[380px]">
          <div className="flex justify-end mb-4 pr-2">
            <button 
              onClick={backspace}
              className="p-3 text-vert-sauge hover:text-rose-500 dark:hover:text-rose-400 transition-colors rounded-full hover:bg-rose-50 dark:hover:bg-rose-900/10"
            >
              <Delete size={24} />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {buttons.map((btn, index) => (
              <button
                key={index}
                onClick={btn.action}
                className={`
                  flex items-center justify-center h-16 md:h-14 rounded-[1.1rem] text-xl font-black transition-all active:scale-90
                  ${btn.color || 'bg-white dark:bg-slate-800 text-vert-foret dark:text-slate-200 border border-rose-poudre/50 dark:border-slate-700 hover:bg-rose-poudre dark:hover:bg-slate-700/50'}
                  ${btn.colSpan === 2 ? 'col-span-2' : ''}
                  ${btn.label === '=' ? 'ring-4 ring-vert-foret/5 dark:ring-slate-700/20' : ''}
                `}
              >
                {btn.icon || btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
