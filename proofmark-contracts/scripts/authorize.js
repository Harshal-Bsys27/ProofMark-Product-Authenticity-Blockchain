const fs = require("fs");
const path = require("path");

const main = async () => {
  const manufacturerAddress = process.env.MANUFACTURER_ADDRESS || process.argv[2];
  if (!manufacturerAddress) {
    throw new Error(
      "Usage: npm run authorize -- <manufacturer-wallet-address>"
    );
  }

  if (!ethers.utils.isAddress(manufacturerAddress)) {
    throw new Error(`Invalid wallet address: ${manufacturerAddress}`);
  }

  const deploymentPath = path.join(__dirname, "..", "contractDeployment.json");
  const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  const [owner] = await ethers.getSigners();
  const contract = await ethers.getContractAt(
    "ProductAuthenticity",
    deployment.contractAddress,
    owner
  );

  const alreadyAuthorized = await contract.authorizedManufacturers(
    manufacturerAddress
  );
  if (alreadyAuthorized) {
    console.log(`${manufacturerAddress} is already authorized.`);
    return;
  }

  const transaction = await contract.authorizeManufacturer(manufacturerAddress);
  await transaction.wait();
  console.log(`Authorized manufacturer: ${manufacturerAddress}`);
  console.log(`Transaction: ${transaction.hash}`);
};

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
