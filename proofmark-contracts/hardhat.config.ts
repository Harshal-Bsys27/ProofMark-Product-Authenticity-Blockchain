import "@nomiclabs/hardhat-ethers";
import "hardhat-gas-reporter";
import "solidity-coverage";

import { resolve } from "path";
import { config as dotenvConfig } from "dotenv";

dotenvConfig({ path: resolve(__dirname, "./.env") });

/**
 * HARDHAT CONFIGURATION
 * 
 * Simplified configuration for the mini-project.
 * Supports:
 * - Local development blockchain (hardhat network)
 * - Sepolia testnet (optional, for deployment testing)
 * 
 * Key concepts:
 * - networkConfig: Defines blockchain networks
 * - accounts: Private keys used for transactions
 * - gasReporter: Tracks gas costs of functions
 * - solidity: Solidity compiler version
 */

const config = {
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },

  networks: {
    /**
     * LOCAL HARDHAT NETWORK
     * 
     * Default network for development and testing.
     * Runs locally without needing external services.
     * Provides unlimited test ETH automatically.
     * 
     * BLOCKCHAIN CONCEPT:
     * This is a local Ethereum-compatible blockchain.
     * It mimics the behavior of the real Ethereum network
     * but is isolated to your computer.
     */
    hardhat: {
      chainId: 1337,
      allowUnlimitedContractSize: true,
    },

    /**
     * SEPOLIA TESTNET (OPTIONAL)
     * 
     * Public Ethereum test network.
     * Use this to test against a real network before mainnet.
     * Requires:
     * - SEPOLIA_PRIVATE_KEY in .env
     * - SEPOLIA_RPC_URL in .env
     * 
     * To use: npx hardhat run scripts/deploy.js --network sepolia
     */
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: process.env.SEPOLIA_PRIVATE_KEY
        ? [process.env.SEPOLIA_PRIVATE_KEY]
        : [],
      chainId: 11155111,
    },
  },

  /**
   * GAS REPORTER
   * 
   * Tracks gas consumption during tests.
   * Useful for optimizing smart contracts.
   * 
   * BLOCKCHAIN CONCEPT:
   * Gas is the computational cost of executing transactions.
   * Optimizing gas usage saves ETH when deployed.
   */
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
    outputFile: "gas-report.txt",
    noColors: true,
  },

  /**
   * PATHS
   * 
   * Location of important project files.
   */
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;