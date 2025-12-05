export type Player = 'X' | 'O';
export type CellValue = Player | null;
export type BoardState = CellValue[];

export enum GameMode {
  PVP = 'PVP',
  PVE = 'PVE' // Player vs Environment (AI)
}

export interface WinningLine {
  line: number[];
  winner: Player;
}

export interface AiMoveResult {
  move: number;
  reasoning: string;
}
