// Cryptographic pseudo-random hash generator for 1980s Arcade simulation

export function generateMockEntropy(
  blockNumber: number,
  player: string,
  nonce: number,
  _engine: 'PSEUDO_BLOCKHASH' | 'CHAINLINK_VRF'
): { hash: string; outcome: 'HEADS' | 'TAILS' } {
  // Generate deterministic-looking 66-character hex hash
  const seedString = `${blockNumber}-${player}-${nonce}-${Date.now()}-${Math.random()}`;
  let hashVal = 0;
  for (let i = 0; i < seedString.length; i++) {
    hashVal = (hashVal << 5) - hashVal + seedString.charCodeAt(i);
    hashVal |= 0;
  }
  
  const hexParts: string[] = [];
  for (let i = 0; i < 8; i++) {
    const part = Math.floor(Math.abs(Math.sin(hashVal + i * 17) * 0xffffffff)).toString(16).padStart(8, '0');
    hexParts.push(part);
  }
  
  const hash = '0x' + hexParts.join('');
  
  // Last byte modulo 2 determines outcome
  const lastHexChar = hash[hash.length - 1];
  const lastNibble = parseInt(lastHexChar, 16);
  const outcome: 'HEADS' | 'TAILS' = (lastNibble % 2 === 0) ? 'HEADS' : 'TAILS';

  return { hash, outcome };
}

export function formatAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatBot(val: number): string {
  return val.toFixed(4) + ' BOT';
}

export function formatEther(val: number): string {
  return val.toFixed(4);
}
