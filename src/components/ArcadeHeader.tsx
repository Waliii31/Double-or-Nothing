import React from 'react';
import { Volume2, VolumeX, Monitor, Wallet, RefreshCw, Zap, Network } from 'lucide-react';
import { arcadeAudio } from '../utils/audio';
import { formatAddress } from '../utils/crypto';

interface ArcadeHeaderProps {
  walletAddress: string | null;
  balance: number;
  isMetaMaskConnected: boolean;
  currentChainId: number | null;
  isCrtOn: boolean;
  isMuted: boolean;
  isSandboxMode: boolean;
  onToggleCrt: () => void;
  onToggleMute: () => void;
  onToggleSandbox: () => void;
  onConnectWallet: () => void;
  onFaucetClick: () => void;
  onSwitchToBotChain: () => void;
}

export const ArcadeHeader: React.FC<ArcadeHeaderProps> = ({
  walletAddress,
  balance,
  isMetaMaskConnected,
  currentChainId,
  isCrtOn,
  isMuted,
  isSandboxMode,
  onToggleCrt,
  onToggleMute,
  onToggleSandbox,
  onConnectWallet,
  onFaucetClick,
  onSwitchToBotChain,
}) => {
  const isWrongNetwork = isMetaMaskConnected && currentChainId !== null && currentChainId !== 677;

  return (
    <header className="border-b-4 border-[#00FF66] bg-[#0a0a0a] px-4 py-3 select-none">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
        
        {/* Retro Title & Marquee */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FF007F] border-2 border-white flex items-center justify-center font-bold text-black text-xl animate-bounce">
            🪙
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[#FFE600] text-xs font-arcade animate-arcade-blink">● LIVE ARCADE</span>
              <span className="text-[#555] text-xs">|</span>
              <span className="text-[#00F0FF] text-xs font-arcade">BOT CHAIN MAINNET (ID 677)</span>
            </div>
            <h1 className="text-lg md:text-xl font-bold tracking-wider text-[#00FF66] neon-glow-green font-arcade">
              DOUBLE OR NOTHING
            </h1>
          </div>
        </div>

        {/* Global Controls & Mode Switcher */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          
          {/* Wrong Network Warning / Switch to BOT Chain Button */}
          {isWrongNetwork && (
            <button
              onClick={() => {
                arcadeAudio.playButtonBlip();
                onSwitchToBotChain();
              }}
              className="px-3 py-1.5 text-[10px] md:text-xs font-arcade bg-[#FF007F] text-white border-2 border-white animate-pulse flex items-center gap-1.5 shadow-[2px_2px_0px_#fff]"
              title="Click to switch MetaMask to BOT Chain Mainnet (Chain ID 677)"
            >
              <Network className="w-3.5 h-3.5" />
              SWITCH TO BOT CHAIN (677)
            </button>
          )}

          {/* Mode Switcher: Sandbox vs MetaMask */}
          <button
            onClick={() => {
              arcadeAudio.playButtonBlip();
              onToggleSandbox();
            }}
            className={`px-3 py-1.5 text-[10px] md:text-xs font-arcade border-2 flex items-center gap-1.5 transition-all ${
              isSandboxMode 
                ? 'bg-[#FFE600] text-black border-white shadow-[2px_2px_0px_#fff]' 
                : 'bg-[#111] text-[#00FF66] border-[#00FF66] shadow-[2px_2px_0px_#00FF66]'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            {isSandboxMode ? 'SANDBOX TESTNET' : 'BOT CHAIN WEB3'}
          </button>

          {/* Faucet button */}
          <button
            onClick={() => {
              arcadeAudio.playCoinInsert();
              onFaucetClick();
            }}
            title="Inject +1.0 BOT test funds"
            className="px-2.5 py-1.5 text-[10px] md:text-xs font-arcade bg-[#1a1a1a] text-[#00FF66] border-2 border-[#00FF66] hover:bg-[#00FF66] hover:text-black flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            +1.0 BOT
          </button>

          {/* CRT Filter Toggle */}
          <button
            onClick={() => {
              arcadeAudio.playButtonBlip();
              onToggleCrt();
            }}
            className={`px-2.5 py-1.5 text-[10px] md:text-xs font-arcade border-2 flex items-center gap-1 ${
              isCrtOn 
                ? 'bg-[#00FF66] text-black border-white' 
                : 'bg-[#1a1a1a] text-zinc-500 border-zinc-700'
            }`}
          >
            <Monitor className="w-3 h-3" />
            CRT {isCrtOn ? 'ON' : 'OFF'}
          </button>

          {/* Audio Mute/Unmute */}
          <button
            onClick={() => {
              arcadeAudio.playButtonBlip();
              onToggleMute();
            }}
            className={`px-2.5 py-1.5 text-[10px] md:text-xs font-arcade border-2 flex items-center gap-1 ${
              !isMuted 
                ? 'bg-[#FF007F] text-white border-white' 
                : 'bg-[#1a1a1a] text-zinc-500 border-zinc-700'
            }`}
          >
            {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
            {isMuted ? 'MUTE' : '8-BIT SFX'}
          </button>

          {/* Wallet / Balance Widget */}
          {walletAddress ? (
            <div className="flex items-center gap-2 bg-[#141414] border-2 border-[#00FF66] px-3 py-1 text-xs">
              <span className={`w-2 h-2 rounded-none ${isMetaMaskConnected ? 'bg-[#00FF66] animate-ping' : 'bg-[#FFE600]'}`} />
              <div className="text-left font-crt text-base tracking-wide leading-tight">
                <span className="text-[#00FF66] font-bold block">{balance.toFixed(4)} BOT</span>
                <span className="text-zinc-400 text-xs">{formatAddress(walletAddress)}</span>
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                arcadeAudio.playCoinInsert();
                onConnectWallet();
              }}
              className="pixel-btn-green px-3 py-1.5 text-xs font-arcade flex items-center gap-1.5 font-bold"
            >
              <Wallet className="w-3.5 h-3.5" />
              CONNECT METAMASK
            </button>
          )}

        </div>

      </div>
    </header>
  );
};
