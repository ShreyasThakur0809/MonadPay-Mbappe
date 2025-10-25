import fs from 'fs';
import path from 'path';

async function main() {
  console.log("📦 Extracting Contract ABIs...\n");

  // Read MonadPayProcessor ABI
  const processorArtifact = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, '../artifacts/contracts/MonadPayProcessor.sol/MonadPayProcessor.json'),
      'utf8'
    )
  );

  // Read MockERC20 ABI
  const erc20Artifact = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, '../artifacts/contracts/MockERC20.sol/MockERC20.json'),
      'utf8'
    )
  );

  // Create lib directory if it doesn't exist
  const libDir = path.join(__dirname, '../lib');
  if (!fs.existsSync(libDir)) {
    fs.mkdirSync(libDir, { recursive: true });
  }

  // Save ABIs
  const abiOutput = {
    MonadPayProcessor: {
      abi: processorArtifact.abi,
      address: process.env.CONTRACT_ADDRESS || ''
    },
    MockERC20: {
      abi: erc20Artifact.abi,
      addresses: {
        USDC: process.env.USDC_ADDRESS || '',
        USDT: process.env.USDT_ADDRESS || ''
      }
    }
  };

  fs.writeFileSync(
    path.join(libDir, 'contracts-abi.json'),
    JSON.stringify(abiOutput, null, 2)
  );

  console.log("✅ ABIs extracted to: lib/contracts-abi.json");
  console.log("\n📤 Share this file with your frontend teammate!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
