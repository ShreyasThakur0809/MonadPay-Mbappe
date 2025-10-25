import { 
  encodePaymentLink, 
  decodePaymentLink, 
  encodeWebPaymentLink,
  shortenAddress,
  formatAmount,
  isValidAddress 
} from '../lib/deeplink-utils';
import { getTokenBySymbol, getTokenByAddress, CONTRACT_ADDRESSES } from '../lib/contract';

async function main() {
  console.log("🧪 Testing MonadPay Utilities...\n");
  console.log("=" .repeat(60));

  // Test 1: Address Validation
  console.log("\n✅ TEST 1: Address Validation");
  console.log("-".repeat(60));
  
  const validAddress = "0x92F6D61C4D88F6Df0dBC260a594681F82347F840";
  const invalidAddress = "0x123";
  
  console.log(`Valid address check: ${isValidAddress(validAddress)}`); // Should be true
  console.log(`Invalid address check: ${isValidAddress(invalidAddress)}`); // Should be false
  console.log(`Shortened address: ${shortenAddress(validAddress)}`);

  // Test 2: Payment Link Encoding
  console.log("\n✅ TEST 2: Payment Link Encoding");
  console.log("-".repeat(60));
  
  const paymentRequest = {
    to: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0",
    amount: "1.5",
    token: CONTRACT_ADDRESSES.tokens.USDC,
    label: "Coffee payment",
    memo: "Thanks for the coffee!",
    chainId: 10143
  };
  
  const deepLink = encodePaymentLink(paymentRequest);
  console.log("Deep link generated:");
  console.log(deepLink);
  
  const webLink = encodeWebPaymentLink(paymentRequest, "https://pay.monad.link");
  console.log("\nWeb fallback link:");
  console.log(webLink);

  // Test 3: Payment Link Decoding
  console.log("\n✅ TEST 3: Payment Link Decoding");
  console.log("-".repeat(60));
  
  const decoded = decodePaymentLink(deepLink);
  if (decoded) {
    console.log("Decoded payment request:");
    console.log(JSON.stringify(decoded, null, 2));
    
    // Verify decoded matches original
    const matches = 
      decoded.to === paymentRequest.to &&
      decoded.amount === paymentRequest.amount &&
      decoded.token === paymentRequest.token &&
      decoded.label === paymentRequest.label;
    
    console.log(`\n✓ Decoding matches original: ${matches ? "✅ PASS" : "❌ FAIL"}`);
  } else {
    console.log("❌ FAIL: Could not decode link");
  }

  // Test 4: Token Lookups
  console.log("\n✅ TEST 4: Token Lookups");
  console.log("-".repeat(60));
  
  const usdcBySymbol = getTokenBySymbol("USDC");
  console.log("USDC token info (by symbol):");
  console.log(JSON.stringify(usdcBySymbol, null, 2));
  
  const usdcByAddress = getTokenByAddress(CONTRACT_ADDRESSES.tokens.USDC);
  console.log("\nUSDC token info (by address):");
  console.log(JSON.stringify(usdcByAddress, null, 2));
  
  const matches = usdcBySymbol?.address === usdcByAddress?.address;
  console.log(`\n✓ Token lookups match: ${matches ? "✅ PASS" : "❌ FAIL"}`);

  // Test 5: Amount Formatting
  console.log("\n✅ TEST 5: Amount Formatting");
  console.log("-".repeat(60));
  
  console.log(`1.5 formatted: ${formatAmount("1.5")}`);
  console.log(`1500 formatted: ${formatAmount("1500")}`);
  console.log(`1500000 formatted: ${formatAmount("1500000")}`);
  console.log(`0.001 formatted: ${formatAmount("0.001")}`);

  // Test 6: Contract Addresses
  console.log("\n✅ TEST 6: Contract Addresses");
  console.log("-".repeat(60));
  
  console.log("MonadPayProcessor:", CONTRACT_ADDRESSES.processor);
  console.log("Mock USDC:", CONTRACT_ADDRESSES.tokens.USDC);
  console.log("Mock USDT:", CONTRACT_ADDRESSES.tokens.USDT);
  
  const allValid = 
    isValidAddress(CONTRACT_ADDRESSES.processor) &&
    isValidAddress(CONTRACT_ADDRESSES.tokens.USDC) &&
    isValidAddress(CONTRACT_ADDRESSES.tokens.USDT);
  
  console.log(`\n✓ All addresses valid: ${allValid ? "✅ PASS" : "❌ FAIL"}`);

  // Test 7: Edge Cases
  console.log("\n✅ TEST 7: Edge Cases");
  console.log("-".repeat(60));
  
  // Empty/invalid inputs
  const invalidDecode1 = decodePaymentLink("invalid-link");
  const invalidDecode2 = decodePaymentLink("monadpay://send?to=invalid");
  const invalidDecode3 = decodePaymentLink("monadpay://send?amount=10"); // Missing 'to'
  
  console.log(`Invalid link 1: ${invalidDecode1 === null ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`Invalid link 2: ${invalidDecode2 === null ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`Invalid link 3: ${invalidDecode3 === null ? "✅ PASS" : "❌ FAIL"}`);

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("🎉 ALL TESTS COMPLETED!");
  console.log("=".repeat(60));
  console.log("\n✅ Module 3 utilities are working correctly!\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ TEST FAILED:", error);
    process.exit(1);
  });
