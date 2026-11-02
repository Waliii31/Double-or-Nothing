import React, { useState } from 'react';
import type { GameRecord } from '../types';
import { History, Copy, Check, Filter, ExternalLink } from 'lucide-react';
import { formatAddress } from '../utils/crypto';
import { arcadeAudio } from '../utils/audio';

interface AuditLedgerProps {
  records: GameRecord[];
}

export const AuditLedger: React.FC<AuditLedgerProps> = ({ records }) => {
  const [filter, setFilter] = useState<'ALL' | 'WINS' | 'LOSSES'>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredRecords = records.filter((r) => {
    if (filter === 'WINS') return r.won;
    if (filter === 'LOSSES') return !r.won;
    return true;
  });

  const handleCopy = (txHash: string, id: string) => {
    arcadeAudio.playButtonBlip();
    navigator.clipboard.writeText(txHash);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="pixel-box-neutral bg-[#080808] p-4 md:p-6 mb-8">
      
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-zinc-800 pb-3 mb-4 gap-3">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-[#00F0FF]" />
          <h2 className="font-arcade text-xs md:text-sm text-[#00F0FF]">
            ARCADE AUDIT LEDGER // ON-CHAIN FLIP LOGS
          </h2>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 font-arcade text-[10px]">
          <Filter className="w-3.5 h-3.5 text-zinc-500" />
          <button
            onClick={() => setFilter('ALL')}
            className={`px-2.5 py-1 border ${
              filter === 'ALL'
                ? 'bg-white text-black border-white'
                : 'bg-black text-zinc-400 border-zinc-800 hover:border-zinc-500'
            }`}
          >
            ALL ({records.length})
          </button>
          <button
            onClick={() => setFilter('WINS')}
            className={`px-2.5 py-1 border ${
              filter === 'WINS'
                ? 'bg-[#00FF66] text-black border-white'
                : 'bg-black text-[#00FF66] border-zinc-800 hover:border-[#00FF66]'
            }`}
          >
            WINS
          </button>
          <button
            onClick={() => setFilter('LOSSES')}
            className={`px-2.5 py-1 border ${
              filter === 'LOSSES'
                ? 'bg-[#FF007F] text-white border-white'
                : 'bg-black text-[#FF007F] border-zinc-800 hover:border-[#FF007F]'
            }`}
          >
            LOSSES
          </button>
        </div>
      </div>

      {/* Ledger Table */}
      {filteredRecords.length === 0 ? (
        <div className="text-center py-8 font-crt text-zinc-500 text-lg">
          NO ON-CHAIN FLIPS RECORDED YET. INSERT COIN TO PLAY!
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left font-crt text-base">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 font-arcade text-[9px]">
                <th className="py-2 px-2">ROLL #</th>
                <th className="py-2 px-2">TIME</th>
                <th className="py-2 px-2">PLAYER</th>
                <th className="py-2 px-2">PICK</th>
                <th className="py-2 px-2">OUTCOME</th>
                <th className="py-2 px-2">WAGER</th>
                <th className="py-2 px-2">PAYOUT</th>
                <th className="py-2 px-2">RESULT</th>
                <th className="py-2 px-2 text-right">TX PROOF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {filteredRecords.map((item) => (
                <tr key={item.id} className="hover:bg-[#111] transition-colors">
                  <td className="py-2 px-2 font-arcade text-xs text-zinc-400">
                    #{item.gameIndex.toString().padStart(3, '0')}
                  </td>
                  <td className="py-2 px-2 text-zinc-500 text-sm">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-2 px-2 font-mono text-zinc-300">
                    {formatAddress(item.player)}
                  </td>
                  <td className="py-2 px-2 font-arcade text-[10px]">
                    <span className={item.choice === 'HEADS' ? 'text-[#00FF66]' : 'text-[#FF007F]'}>
                      {item.choice}
                    </span>
                  </td>
                  <td className="py-2 px-2 font-arcade text-[10px]">
                    <span className={item.outcome === 'HEADS' ? 'text-[#00FF66]' : 'text-[#FF007F]'}>
                      {item.outcome}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-zinc-300">
                    {item.betAmount.toFixed(4)} BOT
                  </td>
                  <td className="py-2 px-2 font-bold text-[#FFE600]">
                    {item.payout > 0 ? `+${item.payout.toFixed(4)} BOT` : '0 BOT'}
                  </td>
                  <td className="py-2 px-2">
                    {item.won ? (
                      <span className="bg-[#00FF66] text-black px-1.5 py-0.5 font-arcade text-[9px] font-bold">
                        WIN {item.streak > 1 ? `(${item.streak}X)` : '2X'}
                      </span>
                    ) : (
                      <span className="bg-[#FF007F] text-white px-1.5 py-0.5 font-arcade text-[9px] font-bold">
                        BUST
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-2 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => handleCopy(item.txHash, item.id)}
                        className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-white font-mono bg-[#161616] px-2 py-1 border border-zinc-700 hover:border-zinc-500"
                        title="Copy Transaction Hash"
                      >
                        {copiedId === item.id ? (
                          <>
                            <Check className="w-3 h-3 text-[#00FF66]" />
                            <span className="text-[#00FF66]">COPIED</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>{item.txHash.slice(0, 8)}...</span>
                          </>
                        )}
                      </button>
                      <a
                        href={`https://scan.botchain.ai/tx/${item.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 text-zinc-400 hover:text-[#00FF66] bg-[#161616] border border-zinc-700 hover:border-[#00FF66]"
                        title="View on BOT Chain Explorer"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};
