import { TokenInfo, ContractAddresses } from './types';

// V2 Contract Addresses (NEW - with advanced features)
export const CONTRACT_ADDRESSES: ContractAddresses = {
  processor: '0x6b49B76C7C18Dae32F4A8F00F78787C43955e0ED', // V2 with expiration + batch
  tokens: {
    USDC: '0x6B2Aeb008CD4a052aa3eA374Fa9Fa327946E857F',
    USDT: '0x54F413dE692C18e87265c7108e0F81d25F3BFc60',
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

// MonadPayProcessor V2 ABI (with NEW features)
export const PROCESSOR_ABI = [
  // ========== STANDARD PAYMENTS ==========
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
  
  // ========== PAYMENT REQUESTS (NEW - with expiration) ==========
  {
    "inputs": [
      { "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "internalType": "address", "name": "token", "type": "address" },
      { "internalType": "string", "name": "label", "type": "string" },
      { "internalType": "string", "name": "memo", "type": "string" },
      { "internalType": "uint256", "name": "expiryDuration", "type": "uint256" }
    ],
    "name": "createPaymentRequest",
    "outputs": [{ "internalType": "bytes32", "name": "requestId", "type": "bytes32" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "bytes32", "name": "requestId", "type": "bytes32" }],
    "name": "payPaymentRequest",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "bytes32", "name": "requestId", "type": "bytes32" }],
    "name": "getPaymentRequest",
    "outputs": [
      {
        "components": [
          { "internalType": "address", "name": "payee", "type": "address" },
          { "internalType": "uint256", "name": "amount", "type": "uint256" },
          { "internalType": "address", "name": "token", "type": "address" },
          { "internalType": "string", "name": "label", "type": "string" },
          { "internalType": "string", "name": "memo", "type": "string" },
          { "internalType": "uint256", "name": "createdAt", "type": "uint256" },
          { "internalType": "uint256", "name": "expiresAt", "type": "uint256" },
          { "internalType": "bool", "name": "completed", "type": "bool" },
          { "internalType": "bool", "name": "expired", "type": "bool" }
        ],
        "internalType": "struct MonadPayProcessor.PaymentRequest",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  
  // ========== BATCH PAYMENTS (NEW) ==========
  {
    "inputs": [
      { "internalType": "address[]", "name": "recipients", "type": "address[]" },
      { "internalType": "uint256[]", "name": "amounts", "type": "uint256[]" },
      { "internalType": "string", "name": "label", "type": "string" }
    ],
    "name": "processBatchPayment",
    "outputs": [{ "internalType": "bytes32", "name": "batchId", "type": "bytes32" }],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address[]", "name": "recipients", "type": "address[]" },
      { "internalType": "uint256[]", "name": "amounts", "type": "uint256[]" },
      { "internalType": "address", "name": "token", "type": "address" },
      { "internalType": "string", "name": "label", "type": "string" }
    ],
    "name": "processBatchTokenPayment",
    "outputs": [{ "internalType": "bytes32", "name": "batchId", "type": "bytes32" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "bytes32", "name": "batchId", "type": "bytes32" }],
    "name": "getBatchPayment",
    "outputs": [
      {
        "components": [
          { "internalType": "address", "name": "from", "type": "address" },
          { "internalType": "address[]", "name": "recipients", "type": "address[]" },
          { "internalType": "uint256[]", "name": "amounts", "type": "uint256[]" },
          { "internalType": "address", "name": "token", "type": "address" },
          { "internalType": "string", "name": "label", "type": "string" },
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
          { "internalType": "bool", "name": "processed", "type": "bool" }
        ],
        "internalType": "struct MonadPayProcessor.BatchPayment",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  
  // ========== QUERY FUNCTIONS ==========
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
  },
  {
    "inputs": [],
    "name": "getTotalPaymentRequests",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalBatchPayments",
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