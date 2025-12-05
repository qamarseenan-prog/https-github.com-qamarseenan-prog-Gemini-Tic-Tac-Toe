import React, { useState, useEffect, useCallback } from 'react';
import Square from './components/Square';
import GameStatus from './components/GameStatus';
import { BoardState, Player, WinningLine, GameMode } from './types';
import { getBestMove } from './services/geminiService';
import { RefreshCcw, Gamepad2, BrainCircuit } from 'lucide-react';

const INITIAL_BOARD: BoardState = Array(9).fill(null);

const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
  [0, 4, 8], [2, 4, 6]             // Diagonals
];

export default function App() {
  const [board, setBoard] = useState<BoardState>(INITIAL_BOARD);
  const [isXNext, setIsXNext] = useState<boolean>(true);
  const [winningLine, setWinningLine] = useState<WinningLine | null>(null);
  const [gameMode, setGameMode] = useState<GameMode>(GameMode.PVP);
  const [aiThinking, setAiThinking] = useState<boolean>(false);
  const [aiReasoning, setAiReasoning] = useState<string | null>(null);

  const currentPlayer: Player = isXNext ? 'X' : 'O';
  const winner = winningLine ? winningLine.winner : (!board.includes(null) ? 'DRAW' : null);

  const checkWinner = useCallback((currentBoard: BoardState): WinningLine | null => {
    for (let i = 0; i < WINNING_COMBINATIONS.length; i++) {
      const [a, b, c] = WINNING_COMBINATIONS[i];
      if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
        return { line: WINNING_COMBINATIONS[i], winner: currentBoard[a] as Player };
      }
    }
    return null;
  }, []);

  const handleSquareClick = useCallback(async (index: number) => {
    // Prevent move if square filled, game won, or AI is thinking
    if (board[index] || winner || (gameMode === GameMode.PVE && !isXNext && aiThinking)) {
      return;
    }

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    // Check win immediately after move
    const win = checkWinner(newBoard);
    if (win) {
      setWinningLine(win);
      return; // Game Over
    }
    
    setIsXNext(!isXNext);
  }, [board, winner, gameMode, isXNext, aiThinking, currentPlayer, checkWinner]);


  // AI Turn Effect
  useEffect(() => {
    if (gameMode === GameMode.PVE && !isXNext && !winner) {
      const makeAiMove = async () => {
        setAiThinking(true);
        // Small delay for natural feel
        await new Promise(resolve => setTimeout(resolve, 600)); 
        
        try {
          const { move, reasoning } = await getBestMove(board, 'O');
          setAiReasoning(reasoning);
          
          if (board[move] === null) {
            const newBoard = [...board];
            newBoard[move] = 'O';
            setBoard(newBoard);
            
            const win = checkWinner(newBoard);
            if (win) {
              setWinningLine(win);
            } else {
              setIsXNext(true);
            }
          }
        } catch (e) {
            // Fallback if AI fails critically
             console.error(e);
             setIsXNext(true); // Skip turn to prevent lock
        } finally {
          setAiThinking(false);
        }
      };
      
      makeAiMove();
    }
  }, [gameMode, isXNext, winner, board, checkWinner]);


  const resetGame = () => {
    setBoard(INITIAL_BOARD);
    setIsXNext(true);
    setWinningLine(null);
    setAiReasoning(null);
  };

  const toggleMode = () => {
    resetGame();
    setGameMode(prev => prev === GameMode.PVP ? GameMode.PVE : GameMode.PVP);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-4">
      
      {/* Header */}
      <div className="text-center mb-8 space-y-2">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
          TIC TAC TOE
        </h1>
        <p className="text-slate-400 text-sm font-medium tracking-wide">
          POWERED BY GEMINI 2.5 FLASH
        </p>
      </div>

      {/* Game Area */}
      <div className="bg-slate-800/50 backdrop-blur-sm p-6 sm:p-8 rounded-3xl shadow-2xl border border-slate-700/50 max-w-lg w-full">
        
        {/* Status Display */}
        <div className="mb-6">
          <GameStatus 
            winner={winner} 
            currentPlayer={currentPlayer} 
            gameMode={gameMode}
            aiThinking={aiThinking}
            aiReasoning={aiReasoning}
          />
        </div>

        {/* Board */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8 mx-auto w-fit">
          {board.map((value, index) => (
            <Square
              key={index}
              value={value}
              onClick={() => handleSquareClick(index)}
              disabled={!!winner || (gameMode === GameMode.PVE && !isXNext)}
              highlight={winningLine?.line.includes(index) || false}
            />
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={resetGame}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition-all duration-200 active:scale-95 shadow-lg shadow-slate-900/20"
          >
            <RefreshCcw className="w-4 h-4" />
            Reset Board
          </button>
          
          <button
            onClick={toggleMode}
            className={`
              flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 active:scale-95 shadow-lg
              ${gameMode === GameMode.PVE 
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/20' 
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20'}
            `}
          >
            {gameMode === GameMode.PVE ? (
              <>
                <Gamepad2 className="w-4 h-4" />
                Vs Local Player
              </>
            ) : (
              <>
                <BrainCircuit className="w-4 h-4" />
                Vs Gemini AI
              </>
            )}
          </button>
        </div>
        
        <div className="mt-6 text-center text-xs text-slate-500">
           {gameMode === GameMode.PVE ? "You are Player X" : "Player X starts"}
        </div>

      </div>
    </div>
  );
}
