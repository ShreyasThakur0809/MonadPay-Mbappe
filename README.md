#  MonadPay - Deep Link Payment Protocol

**Send crypto payments as easily as sharing a link**

Built for Monad Hackathon 2025 | [View Demo](#) | [Contracts →](https://testnet.monadexplorer.com/address/0x6b49B76C7C18Dae32F4A8F00F78787C43955e0ED)

---

##  What is MonadPay?

MonadPay is a deep link-based payment protocol on Monad that enables instant crypto payments through shareable URLs (`monadpay://send?...`). Create payment links, share via social media or messaging, and get paid in one click.

### Why MonadPay?
-  **1-second finality** on Monad
-  **Simple**: Share payments like URLs
-  **Cheap**: ~$0.001 per transaction
-  **Mobile-ready**: QR codes & NFC support

---

##  Key Features

1. **Standard Payments** - Instant peer-to-peer transfers
2. **Payment Requests** - Time-limited invoices (expire after X days)
3. **Batch Payments** - Pay multiple recipients at once (split bills)
4. **Multi-Token** - Supports MON, USDC, USDT

---

##  Deployed Contracts (Monad Testnet)

| Contract | Address |
|----------|---------|
| **MonadPayProcessor V2** | `0x6b49B76C7C18Dae32F4A8F00F78787C43955e0ED` |
| **Mock USDC** | `0x6B2Aeb008CD4a052aa3eA374Fa9Fa327946E857F` |
| **Mock USDT** | `0x54F413dE692C18e87265c7108e0F81d25F3BFc60` |

**Network:** Monad Testnet (Chain ID: 10143)  
**RPC:** `https://testnet.monad.xyz/rpc`

---

##  Tech Stack

- **Smart Contracts:** Solidity 0.8.24, Hardhat
- **Frontend:** Next.js 14, TypeScript, Wagmi, TailwindCSS
- **Blockchain:** Monad Testnet (10k TPS, 1-sec finality)

---

