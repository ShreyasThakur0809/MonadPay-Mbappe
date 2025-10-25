# MonadPay Utilities

Backend utilities for MonadPay deep link payment system.

## Files

### types.ts
TypeScript interfaces and types for the entire application.

### deeplink-utils.ts
Utilities for encoding/decoding payment links.

**Example:**
\`\`\`typescript
import { encodePaymentLink, decodePaymentLink } from './deeplink-utils';

// Create a payment link
const link = encodePaymentLink({
  to: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  amount: '1.5',
  token: '0xd9C73AF78191Be2C3088FB8755a3374779E3c727', // USDC
  label: 'Coffee payment',
  memo: 'Thanks!',
});
// Returns: monadpay://send?to=0x742...&amount=1.5&token=0xd9C...&label=Coffee+payment&memo=Thanks!

// Decode a payment link
const request = decodePaymentLink(link);
console.log(request.amount); // "1.5"
\`\`\`

### contracts.ts
Contract addresses, ABIs, and token metadata.

### wagmi-config.ts
Wagmi configuration for frontend Web3 integration.

## Usage in Frontend

\`\`\`typescript
// In your app/layout.tsx
import { WagmiProvider } from 'wagmi';
import { config } from '@/lib/wagmi-config';

export default function RootLayout({ children }) {
  return (
    <WagmiProvider config={config}>
      {children}
    </WagmiProvider>
  );
}
\`\`\`
