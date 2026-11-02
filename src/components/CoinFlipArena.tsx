import React, { useState } from 'react';
import type { FlipChoice, FlipOutcome, GameStatus, RandomnessEngine } from '../types';
import { arcadeAudio } from '../utils/audio';
import { Flame, ShieldCheck, Cpu } from 'lucide-react';

interface CoinFlipArenaProps {
  status: GameStatus;
  choice: FlipChoice;
  betAmount: number;
  currentStreak: number;
  accumulatedWinnings: number;
  lastOutcome: FlipOutcome | null;
  randomnessEngine: RandomnessEngine;
  latestEntropy: { blockNumber: number; hash: string } | null;
  onSelectChoice: (choice: FlipChoice) => void;
  onChangeBetAmount: (amount: number) => void;
  onChangeEngine: (engine: RandomnessEngine) => void;
  onFlipCoin: () => void;
  onDoubleAgain: () => void;
  onCashOut: () => void;
  onResetGame: () => void;
}

const PRESET_BETS = [0.01, 0.05, 0.1, 0.25, 0.5];

export const CoinFlipArena: React.FC<CoinFlipArenaProps> = ({
  status,
  choice,
  betAmount,
  currentStreak,
  accumulatedWinnings,
  lastOutcome,
  randomnessEngine,
  latestEntropy,
  onSelectChoice,
  onChangeBetAmount,
  onChangeEngine,
  onFlipCoin,
  onDoubleAgain,
  onCashOut,
  onResetGame,
}) => {
  const [customInput, setCustomInput] = useState<string>(betAmount.toString());

  const isFlipping = status === 'FLIPPING' || status === 'BET_CONFIRMING';
  const isInStreak = status === 'STREAK_ACTIVE' || (status === 'WON' && currentStreak > 0);
  const potentialPayout = isInStreak ? accumulatedWinnings * 2 : betAmount * 2;

  const handleBetChange = (val: number) => {
    arcadeAudio.playButtonBlip();
    onChangeBetAmount(val);
    setCustomInput(val.toString());
  };

  const handleCustomSubmit = (valStr: string) => {
    setCustomInput(valStr);
    const parsed = parseFloat(valStr);
    if (!isNaN(parsed) && parsed > 0) {
      onChangeBetAmount(parsed);
    }
  };

  return (
    <div className="pixel-box-green bg-[#0d0d0d] p-4 md:p-6 mb-8 relative">
      
      {/* Top Banner: Arcade High Multiplier Streak Indicator */}
      {isInStreak && (
        <div className="mb-6 p-3 bg-[#FF007F] border-2 border-white text-black flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-yellow-300 fill-yellow-300 animate-bounce" />
            <span className="font-arcade text-xs md:text-sm font-bold tracking-wider">
              DOUBLE OR NOTHING STREAK: {currentStreak}X WIN!
            </span>
          </div>
          <div className="font-crt text-lg md:text-xl font-bold bg-black text-[#FFE600] px-2 py-0.5 border border-white">
            POT: {accumulatedWinnings.toFixed(4)} BOT
          </div>
        </div>
      )}

      {/* Main Arcade Stage Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Left Column: 3D Pixel Coin Display */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-black border-2 border-[#1a1a1a]">
          
          <div className="relative w-48 h-48 md:w-56 md:h-56 flex items-center justify-center">
            
            {/* The 8-bit Pixel Coin */}
            <div 
              className={`w-36 h-36 md:w-44 md:h-44 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-300 select-none shadow-[0_0_20px_rgba(0,255,102,0.3)] ${
                isFlipping 
                  ? 'animate-coin-spin border-[#FFE600] bg-[#1a1a00]' 
                  : lastOutcome === 'HEADS'
                    ? 'border-[#00FF66] bg-[#001a0a] shadow-[0_0_30px_#00FF66]'
                    : lastOutcome === 'TAILS'
                      ? 'border-[#FF007F] bg-[#1a000d] shadow-[0_0_30px_#FF007F]'
                      : 'border-[#00FF66] bg-[#050505]'
              }`}
            >
              {isFlipping ? (
                <div className="text-center font-arcade">
                  <span className="text-[#FFE600] text-xl font-bold block animate-arcade-blink">?</span>
                  <span className="text-zinc-400 text-[10px] mt-2 block font-crt">ROLLING...</span>
                </div>
              ) : lastOutcome === 'HEADS' || (!lastOutcome && choice === 'HEADS') ? (
                <div className="text-center font-arcade">
                  <div className="text-3xl mb-1">👑</div>
                  <div className="text-[#00FF66] font-bold text-sm tracking-widest neon-glow-green">HEADS</div>
                  <div className="text-[10px] text-zinc-400 font-crt mt-1">[0x00 / GREEN]</div>
                </div>
              ) : (
                <div className="text-center font-arcade">
                  <div className="text-3xl mb-1">⚡</div>
                  <div className="text-[#FF007F] font-bold text-sm tracking-widest neon-glow-pink">TAILS</div>
                  <div className="text-[10px] text-zinc-400 font-crt mt-1">[0x01 / PINK]</div>
                </div>
              )}
            </div>

            {/* Glowing Ring Accent */}
            <div className="absolute inset-0 border border-dashed border-zinc-800 rounded-full pointer-events-none animate-spin" style={{ animationDuration: '20s' }} />
          </div>

          {/* Result Badge */}
          <div className="mt-4 text-center">
            {status === 'WON' && (
              <div className="text-[#00FF66] font-arcade text-sm neon-glow-green animate-bounce">
                ★★★ YOU WON! +{accumulatedWinnings.toFixed(4)} BOT ★★★
              </div>
            )}
            {status === 'LOST' && (
              <div className="text-[#FF007F] font-arcade text-sm neon-glow-pink">
                ☠ BUST! 0 BOT RECOVERED ☠
              </div>
            )}
            {status === 'IDLE' && (
              <div className="text-zinc-400 font-crt text-base tracking-wider">
                CHOOSE SIDE & WAGER TO FLIP
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Arcade Controls & Bet Selection */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          
          {/* Step 1: Choose Heads or Tails */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <label className="font-arcade text-xs text-[#00FF66] flex items-center gap-1.5">
                <span>[1] SELECT PREDICTION:</span>
              </label>
              <span className="font-crt text-zinc-400 text-sm">50.00% PROVABLE ODDS</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={isFlipping || isInStreak}
                onClick={() => {
                  arcadeAudio.playButtonBlip();
                  onSelectChoice('HEADS');
                }}
                className={`p-3 font-arcade text-xs border-4 flex flex-col items-center justify-center gap-1 transition-all ${
                  choice === 'HEADS'
                    ? 'bg-[#00FF66] text-black border-white shadow-[0_0_15px_#00FF66]'
                    : 'bg-[#111] text-[#00FF66] border-[#00FF66] hover:bg-[#003314]'
                } ${isInStreak ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <span className="text-lg">🟢 👑</span>
                <span className="font-bold">HEADS (GREEN)</span>
              </button>

              <button
                type="button"
                disabled={isFlipping || isInStreak}
                onClick={() => {
                  arcadeAudio.playButtonBlip();
                  onSelectChoice('TAILS');
                }}
                className={`p-3 font-arcade text-xs border-4 flex flex-col items-center justify-center gap-1 transition-all ${
                  choice === 'TAILS'
                    ? 'bg-[#FF007F] text-white border-white shadow-[0_0_15px_#FF007F]'
                    : 'bg-[#111] text-[#FF007F] border-[#FF007F] hover:bg-[#330018]'
                } ${isInStreak ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <span className="text-lg">🟣 ⚡</span>
                <span className="font-bold">TAILS (PINK)</span>
              </button>
            </div>
          </div>

          {/* Step 2: Choose Wager Amount (Disabled during active streak) */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <label className="font-arcade text-xs text-[#FFE600] flex items-center gap-1.5">
                <span>[2] WAGER AMOUNT:</span>
              </label>
              <span className="font-crt text-zinc-400 text-sm">
                POTENTIAL RETURN: <strong className="text-[#00FF66] font-arcade text-xs">{potentialPayout.toFixed(4)} BOT (2X)</strong>
              </span>
            </div>

            {/* Quick Preset Buttons */}
            <div className="grid grid-cols-5 gap-2 mb-2">
              {PRESET_BETS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  disabled={isFlipping || isInStreak}
                  onClick={() => handleBetChange(amt)}
                  className={`py-2 px-1 font-arcade text-[10px] border-2 text-center transition-all ${
                    betAmount === amt && !isInStreak
                      ? 'bg-[#FFE600] text-black border-white shadow-[2px_2px_0px_#fff]'
                      : 'bg-[#141414] text-zinc-300 border-zinc-700 hover:border-[#FFE600]'
                  } ${isInStreak ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {amt} BOT
                </button>
              ))}
            </div>

            {/* Custom Input */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="number"
                  step="0.01"
                  min="0.001"
                  max="5"
                  disabled={isFlipping || isInStreak}
                  value={isInStreak ? accumulatedWinnings : customInput}
                  onChange={(e) => handleCustomSubmit(e.target.value)}
                  className="w-full bg-black border-2 border-[#FFE600] text-[#FFE600] px-3 py-2 font-arcade text-xs focus:outline-none focus:border-white disabled:opacity-50"
                  placeholder="CUSTOM BOT AMOUNT"
                />
                <span className="absolute right-3 top-2.5 font-arcade text-[10px] text-zinc-500">BOT</span>
              </div>
            </div>
          </div>

          {/* Step 3: Action Buttons (Flip vs Double or Cash Out) */}
          <div className="mt-2">
            {isInStreak ? (
              <div className="space-y-3">
                <div className="p-2.5 bg-[#1a000d] border-2 border-[#FF007F] text-center font-arcade text-[11px] text-[#FF007F] animate-arcade-blink">
                  ★ WARNING: DOUBLE TO WIN {potentialPayout.toFixed(4)} BOT OR LOSE ALL! ★
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    disabled={isFlipping}
                    onClick={() => {
                      arcadeAudio.playStreakDouble();
                      onDoubleAgain();
                    }}
                    className="pixel-btn-pink py-3.5 px-4 font-arcade text-xs font-bold text-center tracking-wider flex items-center justify-center gap-2"
                  >
                    <Flame className="w-4 h-4 fill-white" />
                    DOUBLE IT! ({potentialPayout.toFixed(4)} BOT)
                  </button>

                  <button
                    type="button"
                    disabled={isFlipping}
                    onClick={() => {
                      arcadeAudio.playCashOut();
                      onCashOut();
                    }}
                    className="pixel-btn-green py-3.5 px-4 font-arcade text-xs font-bold text-center tracking-wider flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    CASH OUT ({accumulatedWinnings.toFixed(4)} BOT)
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {status === 'LOST' ? (
                  <button
                    type="button"
                    onClick={() => {
                      arcadeAudio.playCoinInsert();
                      onResetGame();
                    }}
                    className="pixel-btn-yellow w-full py-4 font-arcade text-xs md:text-sm font-bold tracking-widest text-center"
                  >
                    INSERT COIN & PLAY AGAIN
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isFlipping}
                    onClick={() => {
                      arcadeAudio.playCoinInsert();
                      onFlipCoin();
                    }}
                    className="pixel-btn-green w-full py-4 font-arcade text-xs md:text-sm font-bold tracking-widest text-center"
                  >
                    {isFlipping ? 'ROLLING ON-CHAIN ENTROPY...' : `FLIP COIN (${betAmount} BOT)`}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Randomness Engine Toggle */}
          <div className="mt-4 pt-3 border-t border-zinc-800 flex flex-wrap items-center justify-between text-[10px] font-crt text-zinc-400 gap-2">
            <div className="flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-[#00F0FF]" />
              <span>RANDOMNESS ENGINE:</span>
              <button
                type="button"
                onClick={() => {
                  arcadeAudio.playButtonBlip();
                  onChangeEngine(randomnessEngine === 'PSEUDO_BLOCKHASH' ? 'CHAINLINK_VRF' : 'PSEUDO_BLOCKHASH');
                }}
                className="underline hover:text-[#00F0FF] font-bold text-white uppercase"
              >
                {randomnessEngine === 'PSEUDO_BLOCKHASH' ? 'EVM PREVRANDAO / BLOCKHASH' : 'CHAINLINK VRF v2.5 MOCKUP'}
              </button>
            </div>

            {latestEntropy && (
              <div className="text-zinc-500 font-mono text-[10px]">
                BLOCK #{latestEntropy.blockNumber} | HASH: {latestEntropy.hash.slice(0, 10)}...
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
