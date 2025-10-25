import { TokenInfo, ContractAddresses } from './types';

// Your deployed contract addresses
export const CONTRACT_ADDRESSES: ContractAddresses = {
  processor: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x71065d406B5Ee090A98AE00ef197a23Bf9cD1b64',
  tokens: {
    USDC: process.env.NEXT_PUBLIC_USDC_ADDRESS || '0xd9C73AF78191Be2C3088FB8755a3374779E3c727',
    USDT: process.env.NEXT_PUBLIC_USDT_ADDRESS || '0x9487B62cE77FCA8BBa0152642E085FF716e1e876',
  },
};

// Token metadata
export const SUPPORTED_TOKENS: Record<string, TokenInfo> = {
  MON: {
    address: '0x0000000000000000000000000000000000000000', // Native token
    symbol: 'MON',
    name: 'Monad',
    decimals: 18,
  },
  USDC: {
    address: CONTRACT_ADDRESSES.tokens.USDC,
    symbol: 'USDC',
    name: 'USD Coin (Mock)',
    decimals: 18,
  },
  USDT: {
    address: CONTRACT_ADDRESSES.tokens.USDT,
    symbol: 'USDT',
    name: 'Tether USD (Mock)',
    decimals: 18,
  },
};

// MonadPayProcessor ABI (simplified - your teammate will use full ABI from contracts-abi.json)
export const PROCESSOR_ABI = [
  {
    "inputs": [
      { "internalType": "address payable", "name": "to", "type": "address" },
      { "internalType": "string", "name": "label", "type": "string" },
      { "internalType": "string", "name": "memo", "type": "string" }
    ],
    "name": "processPayment",
    "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "address", "name": "token", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "internalType": "string", "name": "label", "type": "string" },
      { "internalType": "string", "name": "memo", "type": "string" }
    ],
    "name": "processTokenPayment",
    "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "bytes32", "name": "paymentId", "type": "bytes32" }],
    "name": "getPaymentDetails",
    "outputs": [
      {
        "components": [
          { "internalType": "address", "name": "from", "type": "address" },
          { "internalType": "address", "name": "to", "type": "address" },
          { "internalType": "uint256", "name": "amount", "type": "uint256" },
          { "internalType": "address", "name": "token", "type": "address" },
          { "internalType": "string", "name": "label", "type": "string" },
          { "internalType": "string", "name": "memo", "type": "string" },
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
          { "internalType": "bool", "name": "processed", "type": "bool" }
        ],
        "internalType": "struct MonadPayProcessor.Payment",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalPayments",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// ERC20 ABI (simplified)
export const ERC20_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "spender", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "owner", "type": "address" },
      { "internalType": "address", "name": "spender", "type": "address" }
    ],
    "name": "allowance",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Helper to get token by symbol
export function getTokenBySymbol(symbol: string): TokenInfo | undefined {
  return SUPPORTED_TOKENS[symbol.toUpperCase()];
}

// Helper to get token by address
export function getTokenByAddress(address: string): TokenInfo | undefined {
  return Object.values(SUPPORTED_TOKENS).find(
    (token) => token.address.toLowerCase() === address.toLowerCase()
  );
}
