const fs = require("fs");
const path = require("path");

const main = async () => {
  const manufacturerAddress = process.env.MANUFACTURER_ADDRESS ||
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
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
    transactionHash: deploymentTx.transactionHash,
    blockNumber: deploymentTx.blockNumber,
    deploymentTime: new Date().toISOString(),
  };

  fs.writeFileSync(
    path.join(__dirname, "..", "contractDeployment.json"),
    JSON.stringify(deployment, null, 2)
  );

  console.log("ProofMark demo chain is ready.");
  console.log(`Contract: ${contract.address}`);
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
