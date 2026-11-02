// BOT Chain Mainnet Configuration & Smart Contract Deployment Coordinates

export const BOT_CHAIN = {
  chainId: 677,
  chainIdHex: '0x2a5', // 677 in hex
  chainName: 'BOT Chain Mainnet',
  rpcUrl: 'https://rpc.botchain.ai',
  blockExplorerUrl: 'https://scan.botchain.ai',
  nativeCurrency: {
    name: 'BOT',
    symbol: 'BOT',
    decimals: 18,
  },
  contractAddress: '0xFD51797C48f75aF10761F92Bdd639e4518358324',
};

export const CONTRACT_ADDRESS_BOTCHAIN = BOT_CHAIN.contractAddress;
export const BOTCHAIN_CONTRACT_SCAN_URL = `${BOT_CHAIN.blockExplorerUrl}/address/${BOT_CHAIN.contractAddress}`;
export const TWITTER_URL = 'https://x.com/site_proof__';
export const POWERED_BY_BOTCHAIN_URL = 'https://botchain.ai';

// Standard Human-Readable ABI for DoubleOrNothing contract
export const DOUBLE_OR_NOTHING_ABI = [
  'function flipCoin(uint8 choice) external payable',
  'function doubleAgain(uint8 choice) external',
  'function cashOut() external',
  'function activeStreaks(address player) external view returns (address player, uint256 currentWager, uint256 streakCount, uint8 lastChoice, bool exists)',
  'function totalBankroll() external view returns (uint256)',
  'function totalVolumeFlipped() external view returns (uint256)',
  'function totalFlipsExecuted() external view returns (uint256)',
  'function owner() external view returns (address)',
  'event CoinFlipped(address indexed player, uint8 choice, uint8 outcome, bool won, uint256 payout, uint256 streak, bytes32 provableHash)',
  'event StreakDoubled(address indexed player, uint256 newWager, uint256 streakCount)',
  'event WinningsCashedOut(address indexed player, uint256 amount)',
  'event BankrollDeposited(address indexed funder, uint256 amount)',
  'event BankrollWithdrawn(address indexed owner, uint256 amount)'
];
