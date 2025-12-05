import { GoogleGenAI, Type, Schema } from "@google/genai";
import { BoardState, Player, AiMoveResult } from "../types";

// Initialize the Gemini client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const modelName = 'gemini-2.5-flash';

// Schema for structured output
const moveSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    move: {
      type: Type.INTEGER,
      description: "The index (0-8) of the grid cell to place the move.",
    },
    reasoning: {
      type: Type.STRING,
      description: "A short, witty comment explaining the move or taunting the opponent.",
    },
  },
  required: ["move", "reasoning"],
};

export const getBestMove = async (
  board: BoardState,
  currentPlayer: Player
): Promise<AiMoveResult> => {
  try {
    // Construct a clear prompt representation of the board
    // 0 1 2
    // 3 4 5
    // 6 7 8
    const boardStr = board
      .map((cell, idx) => (cell === null ? idx.toString() : cell))
      .join(",");

    const prompt = `
      You are an expert Tic-Tac-Toe player. You are playing as ${currentPlayer}.
      The current board state (0-8 index) is: [${boardStr}].
      'X' and 'O' represent occupied cells. Numbers represent empty cells.
      
      Determine the absolute best move to win or block the opponent.
      If there is a winning move, take it.
      If the opponent is about to win, block them.
      Otherwise, play optimally (center, corners, etc.).
      
      Return the 0-based index of your move.
    `;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: moveSchema,
        temperature: 0.2, // Low temperature for more deterministic/optimal play
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No response from AI");
    }

    const result = JSON.parse(resultText) as AiMoveResult;
    return result;

  } catch (error) {
    console.error("Error fetching AI move:", error);
    // Fallback logic: pick first empty spot if AI fails
    const availableMoves = board
      .map((val, idx) => (val === null ? idx : -1))
      .filter((val) => val !== -1);
    
    return {
      move: availableMoves.length > 0 ? availableMoves[0] : 0,
      reasoning: "I'm having a bit of trouble thinking, so I picked a random spot.",
    };
  }
};
