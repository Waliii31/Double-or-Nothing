import React from 'react';
import type { BankrollStats } from '../types';
import { Landmark, PlusCircle, AlertCircle } from 'lucide-react';
import { arcadeAudio } from '../utils/audio';

interface BankrollConsoleProps {
  stats: BankrollStats;
  onDepositLiquidity: (amount: number) => void;
}

export const BankrollConsole: React.FC<BankrollConsoleProps> = ({
  stats,
  onDepositLiquidity,
}) => {
  const winRate = stats.totalFlips > 0 
    ? ((stats.playerWins / stats.totalFlips) * 100).toFixed(1) 
    : '50.0';

  return (
    <div className="pixel-box-yellow bg-[#0a0a0a] p-4 md:p-6 mb-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-[#FFE600] pb-3 mb-4 gap-2">
        <div className="flex items-center gap-2">
          <Landmark className="w-5 h-5 text-[#FFE600]" />
          <h2 className="font-arcade text-xs md:text-sm text-[#FFE600] neon-glow-yellow">
            HOUSE BANKROLL // SMART CONTRACT SOLVENCY
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-crt text-zinc-400 text-sm">
            HOUSE EDGE: <strong className="text-[#00FF66]">0.00% (PURE FAIR ODDS)</strong>
          </span>
        </div>
      </div>

      {/* Grid of Bankroll Telemetry */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        
        <div className="bg-[#111] border-2 border-zinc-800 p-3">
          <span className="font-arcade text-[9px] text-zinc-400 block mb-1">TOTAL BANKROLL</span>
          <span className="font-crt text-xl md:text-2xl font-bold text-[#FFE600] block">
            {stats.houseVaultBalance.toFixed(4)} BOT
          </span>
          <span className="font-crt text-xs text-zinc-500">100% Fully Backed</span>
        </div>

        <div className="bg-[#111] border-2 border-zinc-800 p-3">
          <span className="font-arcade text-[9px] text-zinc-400 block mb-1">MAX BET ALLOWED</span>
          <span className="font-crt text-xl md:text-2xl font-bold text-[#00FF66] block">
            {stats.maxBetAllowed.toFixed(4)} BOT
          </span>
          <span className="font-crt text-xs text-zinc-500">5% Bankroll Cap</span>
        </div>

        <div className="bg-[#111] border-2 border-zinc-800 p-3">
          <span className="font-arcade text-[9px] text-zinc-400 block mb-1">TOTAL VOLUME</span>
          <span className="font-crt text-xl md:text-2xl font-bold text-white block">
            {stats.totalVolume.toFixed(4)} BOT
          </span>
          <span className="font-crt text-xs text-zinc-500">{stats.totalFlips} Total Flips</span>
        </div>

        <div className="bg-[#111] border-2 border-zinc-800 p-3">
          <span className="font-arcade text-[9px] text-zinc-400 block mb-1">PLAYER WIN RATE</span>
          <span className="font-crt text-xl md:text-2xl font-bold text-[#FF007F] block">
            {winRate}%
          </span>
          <span className="font-crt text-xs text-zinc-500">Target ~50.0%</span>
        </div>

      </div>

      {/* House Safety Note & Interactive Deposit */}
      <div className="flex flex-col sm:flex-row items-center justify-between bg-[#141414] border border-zinc-800 p-3 gap-3">
        <div className="flex items-center gap-2 text-xs font-crt text-zinc-400">
          <AlertCircle className="w-4 h-4 text-[#FFE600] shrink-0" />
          <span>
            Strict Solvency Invariant: The contract will never accept a bet larger than 5% of its reserve to eliminate ruin probability.
          </span>
        </div>

        <button
          onClick={() => {
            arcadeAudio.playCoinInsert();
            onDepositLiquidity(5.0);
          }}
          className="pixel-btn-yellow shrink-0 px-3 py-1.5 font-arcade text-[10px] font-bold flex items-center gap-1.5"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          +5.0 BOT TO BANKROLL
        </button>
      </div>

    </div>
  );
};
