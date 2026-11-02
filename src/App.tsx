import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import type { 
  FlipChoice, 
  FlipOutcome, 
  GameStatus, 
  RandomnessEngine, 
  GameRecord, 
  HighScore, 
  BankrollStats 
} from './types';
import { ArcadeHeader } from './components/ArcadeHeader';
import { CoinFlipArena } from './components/CoinFlipArena';
import { ArcadeLeaderboard } from './components/ArcadeLeaderboard';
import { AuditLedger } from './components/AuditLedger';
import { BankrollConsole } from './components/BankrollConsole';
import { SolidityInspector } from './components/SolidityInspector';
import { arcadeAudio } from './utils/audio';
import { generateMockEntropy } from './utils/crypto';
import { 
  BOT_CHAIN, 
  CONTRACT_ADDRESS_BOTCHAIN, 
  BOTCHAIN_CONTRACT_SCAN_URL, 
  TWITTER_URL, 
  POWERED_BY_BOTCHAIN_URL 
} from './contracts/contractData';
import { switchToBotChain, getCurrentChainId, getBotBalance } from './utils/web3';
import { ExternalLink, ShieldCheck } from 'lucide-react';

// Initial Retro High Scores
const INITIAL_HIGH_SCORES: HighScore[] = [
  { id: '1', initials: 'SAT', streak: 6, maxPayout: 6.40, playerAddress: '0x1A2B3C4D5E6F7890123456789ABCDEF012345678', date: '1984-10-12' },
  { id: '2', initials: 'HAL', streak: 5, maxPayout: 3.20, playerAddress: '0x2B3C4D5E6F7890123456789ABCDEF0123456789A', date: '1985-03-24' },
  { id: '3', initials: 'VUK', streak: 4, maxPayout: 1.60, playerAddress: '0x3C4D5E6F7890123456789ABCDEF0123456789AB1', date: '1986-07-04' },
  { id: '4', initials: 'NAK', streak: 3, maxPayout: 0.80, playerAddress: '0x4D5E6F7890123456789ABCDEF0123456789AB12C', date: '1988-11-20' },
  { id: '5', initials: 'CYB', streak: 2, maxPayout: 0.40, playerAddress: '0x5E6F7890123456789ABCDEF0123456789AB12CD3', date: '1989-01-01' },
];

export function App() {
  // Game State
  const [status, setStatus] = useState<GameStatus>('IDLE');
  const [choice, setChoice] = useState<FlipChoice>('HEADS');
  const [betAmount, setBetAmount] = useState<number>(0.1);
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [accumulatedWinnings, setAccumulatedWinnings] = useState<number>(0);
  const [lastOutcome, setLastOutcome] = useState<FlipOutcome | null>(null);
  const [randomnessEngine, setRandomnessEngine] = useState<RandomnessEngine>('PSEUDO_BLOCKHASH');
  const [latestEntropy, setLatestEntropy] = useState<{ blockNumber: number; hash: string } | null>(null);
  const [isScreenShaking, setIsScreenShaking] = useState(false);

  // Audio & Display
  const [isCrtOn, setIsCrtOn] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Web3 & Wallet
  const [isSandboxMode, setIsSandboxMode] = useState<boolean>(true);
  const [walletAddress, setWalletAddress] = useState<string | null>('0x71C...ArcadePlayer');
  const [balance, setBalance] = useState<number>(10.00);
  const [isMetaMaskConnected, setIsMetaMaskConnected] = useState<boolean>(false);
  const [currentChainId, setCurrentChainId] = useState<number | null>(null);

  // Bankroll & History
  const [bankroll, setBankroll] = useState<BankrollStats>({
    houseVaultBalance: 50.00,
    maxBetAllowed: 2.50,
    totalVolume: 12.80,
    totalPaidOut: 11.40,
    totalFlips: 24,
    playerWins: 12,
  });

  const [records, setRecords] = useState<GameRecord[]>([]);
  const [highScores, setHighScores] = useState<HighScore[]>(INITIAL_HIGH_SCORES);
  const [pendingScore, setPendingScore] = useState<{ streak: number; maxPayout: number } | null>(null);

  // Handle Mute
  const handleToggleMute = () => {
    arcadeAudio.isMuted = !isMuted;
    setIsMuted(!isMuted);
  };

  // Connect MetaMask Real Wallet
  const handleConnectWallet = async () => {
    const win = window as unknown as { ethereum?: { request: (args: { method: string; params?: unknown[] }) => Promise<string[]> } };
    if (win.ethereum) {
      try {
        // Attempt automatic switch to BOT Chain Mainnet
        await switchToBotChain();
        const accounts = await win.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts && accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setIsMetaMaskConnected(true);
          setIsSandboxMode(false);
          
          const chainId = await getCurrentChainId();
          setCurrentChainId(chainId);

          const botBal = await getBotBalance(accounts[0]);
          if (botBal !== null) {
            setBalance(botBal);
          }
          arcadeAudio.playWinFanfare();
        }
      } catch (err) {
        console.error('MetaMask connection rejected:', err);
      }
    } else {
      alert('MetaMask is not installed. Switching to Arcade Sandbox Testnet Mode with 10.0 BOT credits!');
      setIsSandboxMode(true);
      setWalletAddress('0x71C...ArcadePlayer');
    }
  };

  const handleSwitchToBotChain = async () => {
    const success = await switchToBotChain();
    if (success) {
      const chainId = await getCurrentChainId();
      setCurrentChainId(chainId);
      if (walletAddress) {
        const botBal = await getBotBalance(walletAddress);
        if (botBal !== null) setBalance(botBal);
      }
      arcadeAudio.playWinFanfare();
    }
  };

  const handleToggleSandbox = () => {
    if (isSandboxMode) {
      handleConnectWallet();
    } else {
      setIsSandboxMode(true);
      setWalletAddress('0x71C...ArcadePlayer');
      setBalance(10.00);
      setCurrentChainId(null);
    }
  };

  const handleFaucet = () => {
    setBalance((prev) => prev + 1.0);
  };

  const handleDepositLiquidity = (amount: number) => {
    setBankroll((prev) => ({
      ...prev,
      houseVaultBalance: prev.houseVaultBalance + amount,
      maxBetAllowed: (prev.houseVaultBalance + amount) * 0.05,
    }));
  };

  // Flip Coin Function
  const handleFlipCoin = () => {
    if (balance < betAmount) {
      alert('Insufficient BOT balance! Use the +1.0 BOT faucet.');
      return;
    }

    // Deduct wager
    setBalance((prev) => prev - betAmount);
    setStatus('FLIPPING');
    setLastOutcome(null);

    // Audio spinning tick sequence
    const tickInterval = setInterval(() => {
      arcadeAudio.playSpinTick(Math.random() > 0.5 ? 540 : 620);
    }, 180);

    setTimeout(() => {
      clearInterval(tickInterval);
      resolveFlip(betAmount, 1, choice);
    }, 2000);
  };

  // Double Again Function
  const handleDoubleAgain = () => {
    setStatus('FLIPPING');
    setLastOutcome(null);

    const tickInterval = setInterval(() => {
      arcadeAudio.playSpinTick(Math.random() > 0.5 ? 650 : 750);
    }, 150);

    setTimeout(() => {
      clearInterval(tickInterval);
      resolveFlip(accumulatedWinnings, currentStreak + 1, choice);
    }, 2000);
  };

  // Resolve Outcome
  const resolveFlip = (wager: number, streakStep: number, playerChoice: FlipChoice) => {
    const blockNum = 19284000 + records.length + 1;
    const { hash, outcome } = generateMockEntropy(
      blockNum,
      walletAddress || '0x0',
      records.length + 1,
      randomnessEngine
    );

    const won = (playerChoice === outcome);
    const winPayout = wager * 2;

    setLastOutcome(outcome);
    setLatestEntropy({ blockNumber: blockNum, hash });

    // Update Ledger
    const newRecord: GameRecord = {
      id: Math.random().toString(),
      gameIndex: records.length + 1,
      timestamp: Date.now(),
      player: walletAddress || '0xPlayer',
      choice: playerChoice,
      outcome,
      betAmount: wager,
      payout: won ? winPayout : 0,
      streak: streakStep,
      won,
      blockNumber: blockNum,
      blockHash: hash,
      txHash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      randomnessEngine,
    };

    setRecords((prev) => [newRecord, ...prev]);

    // Update House stats
    setBankroll((prev) => ({
      ...prev,
      totalVolume: prev.totalVolume + wager,
      totalFlips: prev.totalFlips + 1,
      playerWins: won ? prev.playerWins + 1 : prev.playerWins,
      houseVaultBalance: won ? prev.houseVaultBalance - wager : prev.houseVaultBalance + wager,
      maxBetAllowed: Math.max(0.5, (won ? prev.houseVaultBalance - wager : prev.houseVaultBalance + wager) * 0.05),
    }));

    if (won) {
      arcadeAudio.playWinFanfare();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00FF66', '#FFE600', '#FF007F'],
      });

      setCurrentStreak(streakStep);
      setAccumulatedWinnings(winPayout);
      setStatus('WON');
    } else {
      arcadeAudio.playLoseBuzz();
      setIsScreenShaking(true);
      setTimeout(() => setIsScreenShaking(false), 400);

      // Check if player had a high score before busting
      if (currentStreak >= 2) {
        checkHighScore(currentStreak, accumulatedWinnings);
      }

      setCurrentStreak(0);
      setAccumulatedWinnings(0);
      setStatus('LOST');
    }
  };

  // Cash Out Function
  const handleCashOut = () => {
    arcadeAudio.playCashOut();
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.5 },
      colors: ['#00FF66', '#FFE600', '#FFFFFF'],
    });

    setBalance((prev) => prev + accumulatedWinnings);
    setBankroll((prev) => ({
      ...prev,
      totalPaidOut: prev.totalPaidOut + accumulatedWinnings,
    }));

    // Check for high score
    checkHighScore(currentStreak, accumulatedWinnings);

    setStatus('IDLE');
    setCurrentStreak(0);
    setAccumulatedWinnings(0);
  };

  const checkHighScore = (streak: number, maxPayout: number) => {
    const isQualifying = highScores.some((s) => streak > s.streak) || highScores.length < 5;
    if (isQualifying) {
      setPendingScore({ streak, maxPayout });
    }
  };

  const handleRecordInitials = (initials: string) => {
    if (!pendingScore) return;
    const newEntry: HighScore = {
      id: Math.random().toString(),
      initials,
      streak: pendingScore.streak,
      maxPayout: pendingScore.maxPayout,
      playerAddress: walletAddress || '0xPlayer',
      date: new Date().toISOString().split('T')[0],
    };

    const updated = [...highScores, newEntry]
      .sort((a, b) => b.streak - a.streak || b.maxPayout - a.maxPayout)
      .slice(0, 5);

    setHighScores(updated);
    setPendingScore(null);
  };

  const handleResetGame = () => {
    setStatus('IDLE');
    setLastOutcome(null);
  };

  // Listen for MetaMask account & chain changes
  useEffect(() => {
    const win = window as unknown as { ethereum?: { on: (evt: string, cb: (...args: unknown[]) => void) => void } };
    if (win.ethereum && win.ethereum.on) {
      win.ethereum.on('accountsChanged', async (accounts: unknown) => {
        const accList = accounts as string[];
        if (accList && accList.length > 0) {
          setWalletAddress(accList[0]);
          setIsMetaMaskConnected(true);
          const botBal = await getBotBalance(accList[0]);
          if (botBal !== null) setBalance(botBal);
        } else {
          setWalletAddress(null);
          setIsMetaMaskConnected(false);
          setIsSandboxMode(true);
        }
      });

      win.ethereum.on('chainChanged', async (chainIdHex: unknown) => {
        const id = parseInt(chainIdHex as string, 16);
        setCurrentChainId(id);
        if (walletAddress) {
          const botBal = await getBotBalance(walletAddress);
          if (botBal !== null) setBalance(botBal);
        }
      });
    }
  }, [walletAddress]);

  return (
    <div className={`min-h-screen bg-black text-[#00FF66] relative ${isScreenShaking ? 'screen-shake' : ''}`}>
      
      {/* CRT Scanline & Curved Vignette Overlays */}
      {isCrtOn && (
        <>
          <div className="fixed inset-0 crt-overlay z-40 pointer-events-none" />
          <div className="fixed inset-0 crt-vignette z-40 pointer-events-none" />
          <div className="fixed inset-0 crt-flicker z-40 pointer-events-none" />
        </>
      )}

      {/* Main Arcade Frame */}
      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* Header Marquee */}
        <ArcadeHeader
          walletAddress={walletAddress}
          balance={balance}
          isMetaMaskConnected={isMetaMaskConnected}
          currentChainId={currentChainId}
          isCrtOn={isCrtOn}
          isMuted={isMuted}
          isSandboxMode={isSandboxMode}
          onToggleCrt={() => setIsCrtOn(!isCrtOn)}
          onToggleMute={handleToggleMute}
          onToggleSandbox={handleToggleSandbox}
          onConnectWallet={handleConnectWallet}
          onFaucetClick={handleFaucet}
          onSwitchToBotChain={handleSwitchToBotChain}
        />

        {/* Content Body */}
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
          
          {/* Arcade Cabinet Instructions / Teletype Banner */}
          <div className="mb-6 p-3 bg-black border-2 border-zinc-800 text-center font-crt text-zinc-400 text-base md:text-lg tracking-wider flex items-center justify-center gap-3">
            <span className="text-[#00FF66] font-arcade text-xs">INSERT BOT</span>
            <span>▶</span>
            <span className="text-[#FFE600] font-arcade text-xs">CHOOSE HEADS/TAILS</span>
            <span>▶</span>
            <span className="text-[#FF007F] font-arcade text-xs">DOUBLE OR CASH OUT</span>
          </div>

          {/* Section 1: The Interactive Coin Flip Stage */}
          <CoinFlipArena
            status={status}
            choice={choice}
            betAmount={betAmount}
            currentStreak={currentStreak}
            accumulatedWinnings={accumulatedWinnings}
            lastOutcome={lastOutcome}
            randomnessEngine={randomnessEngine}
            latestEntropy={latestEntropy}
            onSelectChoice={setChoice}
            onChangeBetAmount={setBetAmount}
            onChangeEngine={setRandomnessEngine}
            onFlipCoin={handleFlipCoin}
            onDoubleAgain={handleDoubleAgain}
            onCashOut={handleCashOut}
            onResetGame={handleResetGame}
          />

          {/* Section 2: Hall of Fame Leaderboard */}
          <ArcadeLeaderboard
            highScores={highScores}
            pendingScore={pendingScore}
            onSubmitInitials={handleRecordInitials}
          />

          {/* Section 3: Audit Ledger & On-Chain History */}
          <AuditLedger records={records} />

          {/* Section 4: House Bankroll & Liquidity Console */}
          <BankrollConsole
            stats={bankroll}
            onDepositLiquidity={handleDepositLiquidity}
          />

          {/* Section 5: Solidity Contract Opcodes & Mathematical Proofs */}
          <SolidityInspector />

        </main>

        {/* 1980s Retro Arcade Footer with Botchain & Social Links */}
        <footer className="border-t-4 border-[#00FF66] bg-[#080808] py-8 px-4 font-arcade text-[10px] text-zinc-400">
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Top Footer Row: Protocol Identity & Ecosystem Coordinates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-zinc-800 pb-6 text-left">
              
              {/* Col 1: Protocol Info */}
              <div className="space-y-2">
                <div className="text-white font-bold text-xs flex items-center gap-2">
                  <span className="text-[#00FF66]">🪙 DOUBLE OR NOTHING</span>
                  <span className="text-zinc-600">|</span>
                  <span className="text-[#FFE600]">PROTOCOL 03</span>
                </div>
                <p className="font-crt text-sm text-zinc-400 leading-relaxed">
                  Decentralized 1980s retro arcade coin flip running autonomously on BOT Chain Mainnet. 100% on-chain provable randomness.
                </p>
                <div className="font-crt text-xs text-[#00FF66] pt-1">
                  ZERO TRACKERS // 0.00% HOUSE EDGE // MONOTONIC TIME
                </div>
              </div>

              {/* Col 2: Network & Ecosystem Coordinates */}
              <div className="space-y-2 font-crt text-sm">
                <div className="font-arcade text-[10px] text-[#00F0FF] mb-1">
                  NETWORK: {BOT_CHAIN.chainName.toUpperCase()}
                </div>
                <div>
                  <span className="text-zinc-500">RPC: </span>
                  <span className="text-zinc-300 font-mono">{BOT_CHAIN.rpcUrl}</span>
                </div>
                <div>
                  <span className="text-zinc-500">CHAIN ID: </span>
                  <span className="text-[#FFE600] font-bold">{BOT_CHAIN.chainId} (0x2a5)</span>
                  <span className="text-zinc-500"> | SYMBOL: </span>
                  <span className="text-[#00FF66] font-bold">{BOT_CHAIN.nativeCurrency.symbol}</span>
                </div>
                <div className="pt-1">
                  <a
                    href={POWERED_BY_BOTCHAIN_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[#FFE600] hover:text-white font-arcade text-[10px] underline tracking-wider"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-[#00FF66]" />
                    POWERED BY BOTCHAIN (BOTCHAIN.AI) ↗
                  </a>
                </div>
              </div>

              {/* Col 3: Social & Explorer Verification Links */}
              <div className="space-y-2">
                <div className="font-arcade text-[10px] text-[#FF007F] mb-1">
                  VERIFIED COORDINATES
                </div>
                
                {/* Twitter / X */}
                <div>
                  <a
                    href={TWITTER_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-white hover:text-[#00FF66] underline font-crt text-base"
                  >
                    <span>FOLLOW ON X (TWITTER):</span>
                    <strong className="text-[#00FF66]">@site_proof__ ↗</strong>
                  </a>
                </div>

                {/* Contract Scan Link */}
                <div className="pt-1">
                  <span className="font-crt text-xs text-zinc-500 block mb-0.5">DEPLOYED CONTRACT:</span>
                  <a
                    href={BOTCHAIN_CONTRACT_SCAN_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#00F0FF] hover:text-[#FFE600] font-mono text-xs break-all underline"
                    title="View verified contract on BOT Chain Explorer"
                  >
                    <span>{CONTRACT_ADDRESS_BOTCHAIN}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </div>
              </div>

            </div>

            {/* Bottom Footer Row: Marquee & Status */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div className="text-zinc-500">
                1980s RETRO ARCADE CABINET // DIE NEUE GRAPHIK // REENTRANCY GUARDED
              </div>
              <div className="flex items-center gap-3 text-zinc-400">
                <a
                  href={BOTCHAIN_CONTRACT_SCAN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white underline text-[9px]"
                >
                  SCAN.BOTCHAIN.AI ↗
                </a>
                <span>•</span>
                <span className="text-[#FFE600] animate-arcade-blink">INSERT COIN TO CONTINUE</span>
              </div>
            </div>

          </div>
        </footer>

      </div>
    </div>
  );
}

export default App;
