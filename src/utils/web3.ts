import { BOT_CHAIN } from '../contracts/contractData';

export const hasInjectedWeb3 = (): boolean => {
  return typeof window !== 'undefined' && !!(window as unknown as { ethereum?: unknown }).ethereum;
};

export async function switchToBotChain(): Promise<boolean> {
  const eth = (window as unknown as { ethereum?: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> } }).ethereum;
  if (!eth) return false;

  try {
    // Attempt switch to Chain ID 677 (0x2a5)
    await eth.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: BOT_CHAIN.chainIdHex }],
    });
    return true;
  } catch (switchError: unknown) {
    // Error code 4902 indicates that the chain has not been added to MetaMask yet
    if ((switchError as { code?: number })?.code === 4902) {
      try {
        await eth.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: BOT_CHAIN.chainIdHex,
              chainName: BOT_CHAIN.chainName,
              nativeCurrency: BOT_CHAIN.nativeCurrency,
              rpcUrls: [BOT_CHAIN.rpcUrl],
              blockExplorerUrls: [BOT_CHAIN.blockExplorerUrl],
            },
          ],
        });
        return true;
      } catch (addError) {
        console.error('Failed to add BOT Chain Mainnet:', addError);
        return false;
      }
    }
    console.error('Failed to switch to BOT Chain Mainnet:', switchError);
    return false;
  }
}

export async function getCurrentChainId(): Promise<number | null> {
  const eth = (window as unknown as { ethereum?: { request: (args: { method: string }) => Promise<string> } }).ethereum;
  if (!eth) return null;
  try {
    const chainIdHex = await eth.request({ method: 'eth_chainId' });
    return parseInt(chainIdHex, 16);
  } catch (err) {
    console.error('Failed to read chain ID:', err);
    return null;
  }
}

export async function getBotBalance(address: string): Promise<number | null> {
  const eth = (window as unknown as { ethereum?: { request: (args: { method: string; params: unknown[] }) => Promise<string> } }).ethereum;
  if (!eth) return null;
  try {
    const balanceHex = await eth.request({
      method: 'eth_getBalance',
      params: [address, 'latest'],
    });
    const wei = BigInt(balanceHex);
    // Convert wei to BOT (18 decimals)
    return Number(wei) / 1e18;
  } catch (err) {
    console.error('Failed to fetch BOT balance:', err);
    return null;
  }
}
