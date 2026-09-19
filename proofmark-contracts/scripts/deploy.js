/**
 * SMART CONTRACT DEPLOYMENT SCRIPT
 * 
 * This script deploys the ProductAuthenticity smart contract to a blockchain network.
 * 
 * BLOCKCHAIN CONCEPTS:
 * - Deployer: The account that submits the deployment transaction
 * - Contract Address: The permanent address where the contract lives on blockchain
 * - Gas: The cost (in ETH) to deploy the contract
 * - Block Number: The block in which the deployment transaction was mined
 * 
 * USAGE:
 * Local Hardhat:    npx hardhat run scripts/deploy.js --network hardhat
 * Sepolia Testnet:  npx hardhat run scripts/deploy.js --network sepolia
 */

const main = async () => {
  try {
    // Get the deployer account
    const [deployer] = await ethers.getSigners();
    const deployerBalance = await deployer.getBalance();

    console.log("\n=".repeat(70));
    console.log("SMART CONTRACT DEPLOYMENT");
    console.log("=".repeat(70));
    console.log(`\nDeployer Address: ${deployer.address}`);
    console.log(
      `Deployer Balance: ${ethers.utils.formatEther(deployerBalance)} ETH`
    );

    // Get the contract factory
    console.log("\nCompiling contract...");
    const ProductAuthenticity = await ethers.getContractFactory(
      "ProductAuthenticity"
    );

    // Deploy the contract
    console.log("Deploying ProductAuthenticity contract...");
    const productAuthenticityContract = await ProductAuthenticity.deploy();
    await productAuthenticityContract.deployed();

    // Get deployment details
    const deploymentTx = productAuthenticityContract.deployTransaction;
    const receipt = await deploymentTx.wait();

    const manufacturerAddress = process.env.MANUFACTURER_ADDRESS ||
      "0x7F3faBF7D7170d6aF9C90a0821b11F0a0A10CB69";
    if (!ethers.utils.isAddress(manufacturerAddress)) {
      throw new Error(`Invalid MANUFACTURER_ADDRESS: ${manufacturerAddress}`);
    }

    if (!(await productAuthenticityContract.authorizedManufacturers(manufacturerAddress))) {
      const authorization = await productAuthenticityContract.authorizeManufacturer(manufacturerAddress);
      await authorization.wait();
    }

    if (manufacturerAddress.toLowerCase() !== deployer.address.toLowerCase()) {
      const funding = await deployer.sendTransaction({
        to: manufacturerAddress,
        value: ethers.utils.parseEther("100"),
      });
      await funding.wait();
    }

    console.log("\n✅ Contract Deployed Successfully!");
    console.log("-".repeat(70));
    console.log(`Contract Address: ${productAuthenticityContract.address}`);
    console.log(`Transaction Hash: ${deploymentTx.hash}`);
    console.log(`Block Number: ${receipt.blockNumber}`);
    console.log(`Gas Used: ${receipt.gasUsed.toString()}`);
    console.log("-".repeat(70));

    // Save deployment information
    const deploymentInfo = {
      network: hre.network.name,
      contractAddress: productAuthenticityContract.address,
      deployerAddress: deployer.address,
      manufacturerAddress,
      transactionHash: deploymentTx.hash,
      blockNumber: receipt.blockNumber,
      deploymentTime: new Date().toISOString(),
    };

    console.log("\nDeployment Information:");
    console.log(JSON.stringify(deploymentInfo, null, 2));

    // Save to file for frontend use
    const fs = require("fs");
    const path = require("path");

    const contractInfoPath = path.join(
      __dirname,
      "..",
      "contractDeployment.json"
    );
    fs.writeFileSync(contractInfoPath, JSON.stringify(deploymentInfo, null, 2));
    fs.writeFileSync(
      path.join(__dirname, "..", "..", "proofmark-frontend", ".env.local"),
      `REACT_APP_CONTRACT_ADDRESS=${productAuthenticityContract.address}\n`
    );
    console.log(`\n✅ Deployment info saved to: contractDeployment.json`);
    console.log("✅ Frontend contract address updated in proofmark-frontend/.env.local");

    console.log("\n" + "=".repeat(70));
    console.log("NEXT STEPS:");
    console.log("=".repeat(70));
    console.log("1. Copy the Contract Address above");
    console.log(
      "2. Update frontend/.env with: REACT_APP_CONTRACT_ADDRESS=<address>"
    );
    console.log(`3. Authorized manufacturer: ${manufacturerAddress}`);
    console.log("4. Start the frontend with: npm start (in frontend directory)");
    console.log("=".repeat(70) + "\n");

    return productAuthenticityContract.address;
  } catch (error) {
    console.error("\n❌ Deployment Failed!");
    console.error("Error:", error.message);
    process.exit(1);
  }
};

// Run deployment
main()
  .then((address) => {
    console.log("Deployment script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });