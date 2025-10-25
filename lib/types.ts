// Payment request structure for deeplinks
export interface PaymentRequest {
  to: string;              // Recipient address
  amount: string;          // Amount in token units (e.g., "1.5")
  token?: string;          // Token address (undefined = native MON)
  label?: string;          // Payment label/description
  memo?: string;           // Optional memo
  chainId?: number;        // Chain ID (10143 for Monad Testnet)
}

// Supported tokens
export enum SupportedToken {
  MON = "MON",
  USDC = "USDC",
  USDT = "USDT",
}

// Token metadata
export interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  icon?: string;
}

// Payment status from smart contract
export interface PaymentDetails {
  from: string;
  to: string;
  amount: bigint;
  token: string;          // address(0) for native MON
  label: string;
  memo: string;
  timestamp: bigint;
  processed: boolean;
}

// Deep link schema
export interface DeepLinkSchema {
  protocol: string;        // "monadpay"
  action: string;          // "send"
  params: PaymentRequest;
}

// Network configuration
export interface NetworkConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  blockExplorer: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

// Contract addresses
export interface ContractAddresses {
  processor: string;
  tokens: {
    USDC: string;
    USDT: string;
  };
}
