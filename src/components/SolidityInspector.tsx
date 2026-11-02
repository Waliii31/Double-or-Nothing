import React, { useState } from 'react';
import { DOUBLE_OR_NOTHING_SOLIDITY } from '../contracts/DoubleOrNothingSolidity';
import { Code, Copy, Check, Terminal } from 'lucide-react';
import { arcadeAudio } from '../utils/audio';

export const SolidityInspector: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<'CONTRACT' | 'INVARIANTS'>('CONTRACT');

  const handleCopy = () => {
    arcadeAudio.playButtonBlip();
    navigator.clipboard.writeText(DOUBLE_OR_NOTHING_SOLIDITY);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="pixel-box-green bg-[#050505] p-4 md:p-6 mb-8">
      
      {/* Header and Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-[#00FF66] pb-3 mb-4 gap-3">
        <div className="flex items-center gap-2">
          <Code className="w-5 h-5 text-[#00FF66]" />
          <h2 className="font-arcade text-xs md:text-sm text-[#00FF66]">
            SOLIDITY OPCODES // DOUBLE_OR_NOTHING.SOL
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              arcadeAudio.playButtonBlip();
              setTab('CONTRACT');
            }}
            className={`px-3 py-1 font-arcade text-[10px] border ${
              tab === 'CONTRACT'
                ? 'bg-[#00FF66] text-black border-white'
                : 'bg-black text-zinc-400 border-zinc-800'
            }`}
          >
            SMART CONTRACT
          </button>

          <button
            onClick={() => {
              arcadeAudio.playButtonBlip();
              setTab('INVARIANTS');
            }}
            className={`px-3 py-1 font-arcade text-[10px] border ${
              tab === 'INVARIANTS'
                ? 'bg-[#00FF66] text-black border-white'
                : 'bg-black text-zinc-400 border-zinc-800'
            }`}
          >
            FAIRNESS SPECS
          </button>

          <button
            onClick={handleCopy}
            className="pixel-btn-green px-3 py-1 font-arcade text-[10px] flex items-center gap-1 font-bold"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'COPIED!' : 'COPY CODE'}
          </button>
        </div>
      </div>

      {/* Code Display */}
      {tab === 'CONTRACT' ? (
        <div className="bg-[#0a0a0a] border-2 border-zinc-900 p-4 font-crt text-sm md:text-base text-zinc-300 max-h-96 overflow-y-auto leading-relaxed selection:bg-[#00FF66] selection:text-black">
          <pre className="whitespace-pre">
            <code>{DOUBLE_OR_NOTHING_SOLIDITY}</code>
          </pre>
        </div>
      ) : (
        <div className="bg-[#0a0a0a] border-2 border-zinc-900 p-4 font-crt text-base text-zinc-300 space-y-4">
          <div className="border-l-4 border-[#00FF66] pl-3">
            <h4 className="font-arcade text-xs text-[#00FF66] mb-1">AXIOM I: MONOTONIC FAIR RANDOMNESS</h4>
            <p className="text-zinc-400 text-sm">
              Entropy is derived on-chain using <code>keccak256(block.prevrandao, block.timestamp, msg.sender, nonce)</code>. Neither the miner nor the player can bias the outcome without discarding an entire block reward.
            </p>
          </div>

          <div className="border-l-4 border-[#FF007F] pl-3">
            <h4 className="font-arcade text-xs text-[#FF007F] mb-1">AXIOM II: ZERO REENTRANCY & CEI COMPLIANCE</h4>
            <p className="text-zinc-400 text-sm">
              All state transitions (deleting active streaks and zeroing pending payouts) execute <em>before</em> native BOT is dispatched to the player's external address.
            </p>
          </div>

          <div className="border-l-4 border-[#FFE600] pl-3">
            <h4 className="font-arcade text-xs text-[#FFE600] mb-1">AXIOM III: STRICT HOUSE SOLVENCY</h4>
            <p className="text-zinc-400 text-sm">
              Maximum allowed bet is capped at 5% of total bankroll (Wager &le; 0.05 &times; Bankroll). This ensures that even multi-round win streaks never compromise the liquidity of the arcade cabinet.
            </p>
          </div>

          <div className="mt-4 p-3 bg-black border border-zinc-800 flex items-center gap-2 text-xs font-mono text-[#00F0FF]">
            <Terminal className="w-4 h-4" />
            <span>SOLC 0.8.24 // OPTIMIZER: 200 RUNS // VIA-IR: ENABLED</span>
          </div>
        </div>
      )}

    </div>
  );
};
