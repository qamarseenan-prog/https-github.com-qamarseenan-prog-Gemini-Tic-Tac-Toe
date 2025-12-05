import React from 'react';
import { Player, GameMode } from '../types';
import { Bot, User, Trophy, MinusCircle, Loader2 } from 'lucide-react';

interface GameStatusProps {
  winner: Player | 'DRAW' | null;
  currentPlayer: Player;
  gameMode: GameMode;
  aiThinking: boolean;
  aiReasoning: string | null;
}

const GameStatus: React.FC<GameStatusProps> = ({ 
  winner, 
  currentPlayer, 
  gameMode, 
  aiThinking,
  aiReasoning
}) => {
  
  if (winner) {
    return (
      <div className="flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-3 text-3xl font-bold">
          {winner === 'DRAW' ? (
            <>
              <MinusCircle className="w-8 h-8 text-slate-400" />
              <span className="text-slate-200">It's a Draw!</span>
            </>
          ) : (
            <>
              <Trophy className="w-8 h-8 text-yellow-400 animate-bounce" />
              <span className="bg-gradient-to-r from-indigo-400 to-rose-400 bg-clip-text text-transparent">
                Player {winner} Wins!
              </span>
            </>
          )}
        </div>
        {gameMode === GameMode.PVE && winner === 'O' && aiReasoning && (
           <div className="max-w-md p-4 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-200 text-sm italic text-center">
             " {aiReasoning} "
           </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2 h-24 justify-center">
      <div className="flex items-center gap-3 text-xl font-medium text-slate-300">
        {gameMode === GameMode.PVE && currentPlayer === 'O' ? (
          <div className="flex items-center gap-2 text-rose-300">
             {aiThinking ? (
                <Loader2 className="w-5 h-5 animate-spin" />
             ) : (
                <Bot className="w-5 h-5" />
             )}
            <span>AI is thinking...</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <User className={`w-5 h-5 ${currentPlayer === 'X' ? 'text-indigo-400' : 'text-rose-400'}`} />
            <span>Player <span className={`font-bold ${currentPlayer === 'X' ? 'text-indigo-400' : 'text-rose-400'}`}>{currentPlayer}</span>'s Turn</span>
          </div>
        )}
      </div>
      
      {/* AI Commentary Area */}
      <div className={`transition-opacity duration-300 ${aiReasoning ? 'opacity-100' : 'opacity-0'}`}>
          {aiReasoning && !winner && (
            <p className="text-xs text-slate-500 italic max-w-xs text-center">
              Gemini: "{aiReasoning}"
            </p>
          )}
      </div>
    </div>
  );
};

export default GameStatus;
