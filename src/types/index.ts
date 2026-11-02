export type FlipChoice = 'HEADS' | 'TAILS';
export type FlipOutcome = 'HEADS' | 'TAILS';

export type GameStatus = 
  | 'IDLE' 
  | 'BET_CONFIRMING' 
  | 'FLIPPING' 
  | 'WON' 
  | 'LOST' 
  | 'STREAK_ACTIVE'
  | 'CLAIMING';

export type RandomnessEngine = 'PSEUDO_BLOCKHASH' | 'CHAINLINK_VRF';

export interface GameRecord {
  id: string;
  gameIndex: number;
  timestamp: number;
  player: string;
  choice: FlipChoice;
  outcome: FlipOutcome;
  betAmount: number; // in ETH
  payout: number;    // in ETH
  streak: number;
  won: boolean;
  blockNumber: number;
  blockHash: string;
  txHash: string;
  randomnessEngine: RandomnessEngine;
}

export interface HighScore {
  id: string;
  initials: string;
  streak: number;
  maxPayout: number;
  playerAddress: string;
  date: string;
}

export interface BankrollStats {
  houseVaultBalance: number;
  maxBetAllowed: number;
  totalVolume: number;
  totalPaidOut: number;
  totalFlips: number;
  playerWins: number;
}
