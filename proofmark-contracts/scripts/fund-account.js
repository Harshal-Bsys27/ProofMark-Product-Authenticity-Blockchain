const main = async () => {
  const recipient = process.env.RECIPIENT_ADDRESS || process.argv[2];
  if (!recipient || !ethers.utils.isAddress(recipient)) {
    throw new Error(
      "Usage: npm run fund -- <wallet-address>"
    );
  }

  const [funder] = await ethers.getSigners();
  const transaction = await funder.sendTransaction({
    to: recipient,
    value: ethers.utils.parseEther("100"),
  });
  await transaction.wait();

  const balance = await ethers.provider.getBalance(recipient);
  console.log(`Funded ${recipient} with 100 test ETH.`);
  console.log(`New balance: ${ethers.utils.formatEther(balance)} ETH`);
};

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
