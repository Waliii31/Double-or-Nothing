import React, { useState } from 'react';
import type { HighScore } from '../types';
import { Trophy, Award } from 'lucide-react';
import { arcadeAudio } from '../utils/audio';

interface ArcadeLeaderboardProps {
  highScores: HighScore[];
  pendingScore: { streak: number; maxPayout: number } | null;
  onSubmitInitials: (initials: string) => void;
}

export const ArcadeLeaderboard: React.FC<ArcadeLeaderboardProps> = ({
  highScores,
  pendingScore,
  onSubmitInitials,
}) => {
  const [initials, setInitials] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (initials.trim().length > 0) {
      arcadeAudio.playWinFanfare();
      onSubmitInitials(initials.toUpperCase().slice(0, 3));
      setInitials('');
    }
  };

  return (
    <div className="pixel-box-pink bg-[#0a0a0a] p-4 md:p-6 mb-8">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-[#FF007F] pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-[#FFE600] animate-bounce" />
          <h2 className="font-arcade text-xs md:text-sm text-[#FF007F] neon-glow-pink">
            HALL OF FAME // TOP 5 HIGH SCORES
          </h2>
        </div>
        <span className="font-crt text-zinc-400 text-sm">ALL-TIME CABINET STREAKS</span>
      </div>

      {/* High Score Initials Entry Modal / Banner */}
      {pendingScore && (
        <div className="mb-6 p-4 bg-[#FF007F] text-black border-4 border-white animate-pulse">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-6 h-6 text-yellow-300" />
            <h3 className="font-arcade text-xs md:text-sm font-bold">
              ★ NEW HIGH SCORE ACHIEVED! ★
            </h3>
          </div>
          <p className="font-crt text-base text-zinc-900 mb-3">
            Streak: <strong>{pendingScore.streak}X</strong> | Payout: <strong>{pendingScore.maxPayout.toFixed(4)} BOT</strong>. Enter your 3-letter arcade initials:
          </p>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              maxLength={3}
              value={initials}
              onChange={(e) => setInitials(e.target.value.toUpperCase())}
              placeholder="AAA"
              className="bg-black text-[#FFE600] border-2 border-white px-3 py-1 font-arcade text-base uppercase w-28 text-center tracking-widest focus:outline-none"
              autoFocus
            />
            <button
              type="submit"
              className="pixel-btn-yellow px-4 py-1 font-arcade text-xs font-bold"
            >
              RECORD SCORE
            </button>
          </form>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left font-crt text-base">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-400 font-arcade text-[10px]">
              <th className="py-2 px-2">RANK</th>
              <th className="py-2 px-2">INITIALS</th>
              <th className="py-2 px-2">MAX STREAK</th>
              <th className="py-2 px-2">MAX PAYOUT</th>
              <th className="py-2 px-2">DATE</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900">
            {highScores.map((score, idx) => (
              <tr key={score.id} className="hover:bg-[#1a000d] transition-colors">
                <td className="py-2 px-2 font-arcade text-xs text-[#FFE600]">
                  #{idx + 1}
                </td>
                <td className="py-2 px-2 font-arcade text-sm font-bold text-white tracking-widest">
                  {score.initials}
                </td>
                <td className="py-2 px-2 text-[#00FF66] font-bold">
                  {score.streak}X WINS
                </td>
                <td className="py-2 px-2 text-[#FFE600] font-bold">
                  {score.maxPayout.toFixed(4)} BOT
                </td>
                <td className="py-2 px-2 text-zinc-500 text-sm">
                  {score.date}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};
