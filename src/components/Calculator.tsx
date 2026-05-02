import React, { useState } from 'react';
import { Delete, Equal } from 'lucide-react';

const Calculator: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');

  const handleNumber = (num: string) => {
    if (display === '0') {
      setDisplay(num);
    } else {
      setDisplay(display + num);
    }
  };

  const handleOperator = (op: string) => {
    setEquation(display + ' ' + op + ' ');
    setDisplay('0');
  };

  const calculate = () => {
    try {
      const fullEquation = equation + display;
      // Using Function constructor as a safer alternative to eval for simple math
      // In a real production app, use a math library
      const result = new Function('return ' + fullEquation.replace('x', '*').replace('÷', '/'))();
      setDisplay(String(result));
      setEquation('');
    } catch (error) {
      setDisplay('Error');
    }
  };

  const clear = () => {
    setDisplay('0');
    setEquation('');
  };

  const backspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const buttons = [
    { label: 'C', action: clear, color: 'bg-rose-200 text-rose-800' },
    { label: '÷', action: () => handleOperator('/'), color: 'bg-vert-sauge text-white' },
    { label: 'x', action: () => handleOperator('*'), color: 'bg-vert-sauge text-white' },
    { label: 'DEL', action: backspace, color: 'bg-rose-100 text-rose-800', icon: <Delete size={20} /> },
    { label: '7', action: () => handleNumber('7') },
    { label: '8', action: () => handleNumber('8') },
    { label: '9', action: () => handleNumber('9') },
    { label: '-', action: () => handleOperator('-'), color: 'bg-vert-sauge text-white' },
    { label: '4', action: () => handleNumber('4') },
    { label: '5', action: () => handleNumber('5') },
    { label: '6', action: () => handleNumber('6') },
    { label: '+', action: () => handleOperator('+'), color: 'bg-vert-sauge text-white' },
    { label: '1', action: () => handleNumber('1') },
    { label: '2', action: () => handleNumber('2') },
    { label: '3', action: () => handleNumber('3') },
    { label: '=', action: calculate, color: 'bg-vert-olive text-white', rowSpan: 2, icon: <Equal size={20} /> },
    { label: '0', action: () => handleNumber('0'), colSpan: 2 },
    { label: '.', action: () => handleNumber('.') },
  ];

  return (
    <div className="max-w-xs mx-auto bg-white p-6 rounded-2xl shadow-xl border border-vert-sauge/20">
      <div className="mb-4 p-4 bg-rose-poudre/30 rounded-lg text-right overflow-hidden">
        <div className="text-xs text-vert-foret/60 h-4">{equation}</div>
        <div className="text-3xl font-bold text-vert-foret truncate">{display}</div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {buttons.map((btn, index) => (
          <button
            key={index}
            onClick={btn.action}
            className={`
              flex items-center justify-center h-12 rounded-lg font-bold transition-all active:scale-95
              ${btn.color || 'bg-white border border-vert-sauge/20 text-vert-foret hover:bg-rose-poudre/50'}
              ${btn.colSpan === 2 ? 'col-span-2' : ''}
              ${btn.rowSpan === 2 ? 'h-full row-span-2' : ''}
            `}
          >
            {btn.icon || btn.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Calculator;
