import React from 'react';
import { CellValue } from '../types';
import { X, Circle } from 'lucide-react';

interface SquareProps {
  value: CellValue;
  onClick: () => void;
  disabled: boolean;
  highlight: boolean;
}

const Square: React.FC<SquareProps> = ({ value, onClick, disabled, highlight }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative flex items-center justify-center text-4xl sm:text-6xl rounded-xl transition-all duration-300
        h-24 w-24 sm:h-32 sm:w-32
        ${highlight 
          ? 'bg-green-500/20 ring-4 ring-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.3)] scale-105 z-10' 
          : 'bg-slate-800 hover:bg-slate-700 shadow-lg border border-slate-700'}
        ${!value && !disabled ? 'hover:scale-[1.02] active:scale-95 cursor-pointer' : ''}
        ${disabled && !highlight ? 'cursor-default opacity-90' : ''}
      `}
      aria-label={value ? `Square occupied by ${value}` : "Empty square"}
    >
      <div className={`transition-all duration-500 transform ${value ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
        {value === 'X' && (
          <X className="w-16 h-16 sm:w-20 sm:h-20 text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]" strokeWidth={2.5} />
        )}
        {value === 'O' && (
          <Circle className="w-12 h-12 sm:w-16 sm:h-16 text-rose-400 drop-shadow-[0_0_8px_rgba(251,113,133,0.5)]" strokeWidth={3} />
        )}
      </div>
    </button>
  );
};

export default Square;
