const fs = require("fs");
const path = require("path");

const main = async () => {
  const manufacturerAddress = process.env.MANUFACTURER_ADDRESS ||
    "0x7F3faBF7D7170d6aF9C90a0821b11F0a0A10CB69";
  if (!manufacturerAddress || !ethers.utils.isAddress(manufacturerAddress)) {
    throw new Error(
      "Set MANUFACTURER_ADDRESS to the MetaMask wallet used for registration."
    );
  }

  const [owner] = await ethers.getSigners();
  const factory = await ethers.getContractFactory("ProductAuthenticity");
  const contract = await factory.deploy();
  await contract.deployed();

  const deploymentTx = await contract.deployTransaction.wait();
  const alreadyAuthorized = await contract.authorizedManufacturers(
    manufacturerAddress
  );
  if (!alreadyAuthorized) {
    const authorization = await contract.authorizeManufacturer(manufacturerAddress);
    await authorization.wait();
  }

  if (manufacturerAddress.toLowerCase() !== owner.address.toLowerCase()) {
    const funding = await owner.sendTransaction({
      to: manufacturerAddress,
      value: ethers.utils.parseEther("100"),
    });
    await funding.wait();
  }

  const deployment = {
    network: "localhost",
    contractAddress: contract.address,
    deployerAddress: owner.address,
    manufacturerAddress,
    transactionHash: deploymentTx.transactionHash,
    blockNumber: deploymentTx.blockNumber,
    deploymentTime: new Date().toISOString(),
  };

  fs.writeFileSync(
    path.join(__dirname, "..", "contractDeployment.json"),
    JSON.stringify(deployment, null, 2)
  );

  fs.writeFileSync(
    path.join(__dirname, "..", "..", "proofmark-frontend", ".env.local"),
    `REACT_APP_CONTRACT_ADDRESS=${contract.address}\n`
  );

  fs.writeFileSync(
    path.join(__dirname, "..", "..", "proofmark-frontend", "public", "contractDeployment.json"),
    JSON.stringify(deployment, null, 2)
  );

  console.log("ProofMark demo chain is ready.");
  console.log(`Contract: ${contract.address}`);
  console.log("Frontend contract address updated.");
  console.log(`Authorized wallet: ${manufacturerAddress}`);
  console.log(
    manufacturerAddress.toLowerCase() === owner.address.toLowerCase()
      ? "Using Hardhat Account #0 with its built-in test ETH."
      : "Funded wallet with 100 test ETH."
  );
};

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
