import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Starting MonadPay deployment...\n");

  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "MON\n");

  // Deploy MonadPayProcessor
  console.log("📦 Deploying MonadPayProcessor...");
  const MonadPayProcessor = await ethers.getContractFactory("MonadPayProcessor");
  const processor = await MonadPayProcessor.deploy();
  await processor.waitForDeployment();
  const processorAddress = await processor.getAddress();
  console.log("✅ MonadPayProcessor deployed to:", processorAddress);

  // Deploy Mock USDC
  console.log("\n📦 Deploying Mock USDC...");
  const MockERC20 = await ethers.getContractFactory("MockERC20");
  const usdc = await MockERC20.deploy("Mock USDC", "USDC", 1000000); // 1M USDC
  await usdc.waitForDeployment();
  const usdcAddress = await usdc.getAddress();
  console.log("✅ Mock USDC deployed to:", usdcAddress);

  // Deploy Mock USDT
  console.log("\n📦 Deploying Mock USDT...");
  const usdt = await MockERC20.deploy("Mock USDT", "USDT", 1000000); // 1M USDT
  await usdt.waitForDeployment();
  const usdtAddress = await usdt.getAddress();
  console.log("✅ Mock USDT deployed to:", usdtAddress);

  console.log("\n" + "=".repeat(60));
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("=".repeat(60));
  console.log("\n📋 Contract Addresses:");
  console.log("   MonadPayProcessor:", processorAddress);
  console.log("   Mock USDC:", usdcAddress);
  console.log("   Mock USDT:", usdtAddress);
  console.log("\n💡 Save these addresses to your .env file!");
  console.log("\n📝 Update .env with:");
  console.log(`CONTRACT_ADDRESS=${processorAddress}`);
  console.log(`USDC_ADDRESS=${usdcAddress}`);
  console.log(`USDT_ADDRESS=${usdtAddress}`);
  console.log("\n🔗 Verification commands:");
  console.log(`npx hardhat verify --network monadTestnet ${processorAddress}`);
  console.log(`npx hardhat verify --network monadTestnet ${usdcAddress} "Mock USDC" "USDC" 1000000`);
  console.log(`npx hardhat verify --network monadTestnet ${usdtAddress} "Mock USDT" "USDT" 1000000`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
