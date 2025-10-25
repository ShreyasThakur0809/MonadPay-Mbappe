import { ethers } from "hardhat";

async function main() {
  console.log("🔗 Checking Monad Testnet Connection...\n");

  // Get network info
  const network = await ethers.provider.getNetwork();
  console.log("Network Name:", network.name);
  console.log("Chain ID:", network.chainId.toString());

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("\n👤 Deployer Account:", deployer.address);

  // Check balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Balance:", ethers.formatEther(balance), "MON");

  // Check if sufficient balance
  if (balance > ethers.parseEther("0.1")) {
    console.log("\n✅ Sufficient balance for deployment!");
  } else {
    console.log("\n⚠️  Warning: Low balance. Get testnet MON from faucet.");
  }

  // Get current block number
  const blockNumber = await ethers.provider.getBlockNumber();
  console.log("\n📦 Current Block Number:", blockNumber);

  console.log("\n✅ Connection successful!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
