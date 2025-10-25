import { http, createConfig } from 'wagmi';
import { injected, walletConnect } from 'wagmi/connectors';
import { defineChain } from 'viem';

// Define Monad Testnet
export const monadTestnet = defineChain({
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: {
    name: 'Monad',
    symbol: 'MON',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://testnet.monad.xyz/rpc'],
    },
    public: {
      http: ['https://testnet.monad.xyz/rpc'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Monad Explorer',
      url: 'https://explorer.testnet.monad.xyz',
    },
  },
  testnet: true,
});

// Wagmi configuration
export const config = createConfig({
  chains: [monadTestnet],
  connectors: [
    injected({
      shimDisconnect: true,
    }),
    // Optional: Add WalletConnect if you have a project ID
    // walletConnect({
    //   projectId: 'YOUR_WALLETCONNECT_PROJECT_ID',
    // }),
  ],
  transports: {
    [monadTestnet.id]: http(),
  },
  ssr: true, // Enable server-side rendering support
});

// Export for use in components
export { injected, walletConnect };
