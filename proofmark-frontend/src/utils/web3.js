import { ethers } from 'ethers';

/**
 * Web3 Utilities for Product Authenticity Verification
 * 
 * Handles:
 * - MetaMask wallet connection
 * - SHA-256 hashing (frontend)
 * - Smart contract interaction (registerProduct, verifyProduct)
 * - Blockchain information retrieval
 */

// Contract ABI - Functions we're calling on smart contract
const CONTRACT_ABI = [
  "function registerProduct(bytes32 _productHash, string memory _productId, string memory _productName, string memory _batchNumber) public returns (bool)",
  "function verifyProduct(bytes32 _productHash) public view returns (bool isAuthentic, tuple(string productId, string productName, string batchNumber, bytes32 productHash, address manufacturer, uint256 registrationTime, bool isActive) product, string message)",
  "event ProductRegistered(bytes32 indexed productHash, string productId, address indexed manufacturer, uint256 registrationTime)",
];

// Get contract address from environment or localStorage
const getContractAddress = () => {
  return process.env.REACT_APP_CONTRACT_ADDRESS || 
    localStorage.getItem('contractAddress') ||
      '0x5FbDB2315678afecb367f032d93F642f64180aa3'; // Default local address
};

/**
 * Generate SHA-256 hash of product data
 * Same function used on smart contract for verification
 * 
 * @param {string} productId - Product SKU
 * @param {string} productName - Product name
 * @param {string} batchNumber - Batch number
 * @returns {string} - SHA-256 hash as 0x-prefixed hex string
 */
export const generateProductHash = (productId, productName, batchNumber) => {
  try {
    // Combine product data
    const combined = `${productId}${productName}${batchNumber}`;
    
    // Use ethers so hashing works in the browser without Node.js polyfills.
    return ethers.utils.sha256(ethers.utils.toUtf8Bytes(combined));
  } catch (error) {
    console.error('Error generating hash:', error);
    throw new Error('Failed to generate product hash');
  }
};

/**
 * Get ethers.js provider from MetaMask
 * @returns {Promise<ethers.providers.Web3Provider>}
 */
export const getProvider = () => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }
  return new ethers.providers.Web3Provider(window.ethereum);
};

/**
 * Get signer (user's wallet) from MetaMask
 * @returns {Promise<ethers.Signer>}
 */
export const getSigner = async () => {
  const provider = getProvider();
  return provider.getSigner();
};

const ensureLocalNetwork = async () => {
  const targetChainId = '0x539'; // 1337
  const currentChainId = await window.ethereum.request({
    method: 'eth_chainId',
  });

  if (currentChainId === targetChainId) {
    return;
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: targetChainId }],
    });
  } catch (error) {
    if (error.code !== 4902) {
      throw new Error(
        `MetaMask is on chain ${parseInt(currentChainId, 16)}. Switch to Hardhat Local (chain ID 1337).`
      );
    }

    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: targetChainId,
        chainName: 'Hardhat Local',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        rpcUrls: ['http://127.0.0.1:8545'],
      }],
    });
  }
};

/**
 * Register product on blockchain
 * 
 * @param {string} productHash - SHA-256 hash of product data
 * @param {string} productId - Product ID
 * @param {string} productName - Product name
 * @param {string} batchNumber - Batch number
 * @param {string} account - User's wallet address
 * @returns {Promise<Object>} - Registration result with transaction details
 */
export const registerProductOnBlockchain = async (
  productHash,
  productId,
  productName,
  batchNumber,
  account
) => {
  try {
    if (!account) {
      throw new Error('Wallet not connected');
    }

    await ensureLocalNetwork();
    const provider = getProvider();
    const network = await provider.getNetwork();
    if (network.chainId !== 1337) {
      throw new Error(`MetaMask is on chain ${network.chainId}; expected local chain 1337.`);
    }

    const signer = await getSigner();
    
    // Get contract instance
    const contractAddress = getContractAddress();
    const contract = new ethers.Contract(
      contractAddress,
      CONTRACT_ABI,
      signer
    );

    // Call registerProduct function
    console.log('Registering product with hash:', productHash);
    const tx = await contract.registerProduct(
      productHash,
      productId,
      productName,
      batchNumber
    );

    console.log('Transaction sent:', tx.hash);

    // Wait for transaction to be mined
    const receipt = await tx.wait();

    console.log('Transaction confirmed:', receipt.blockNumber);

    return {
      success: true,
      details: {
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        manufacturer: account,
        gasUsed: receipt.gasUsed.toString(),
        timestamp: Math.floor(Date.now() / 1000), // Current timestamp
      }
    };
  } catch (error) {
    console.error('Error registering product:', error);
    return {
      success: false,
      error: error.message || 'Failed to register product'
    };
  }
};

/**
 * Verify product on blockchain
 * 
 * @param {string} productHash - SHA-256 hash to verify
 * @returns {Promise<Object>} - Verification result
 */
export const verifyProductOnBlockchain = async (productHash) => {
  try {
    const provider = getProvider();
    
    // Get contract instance (read-only)
    const contractAddress = getContractAddress();
    const contract = new ethers.Contract(
      contractAddress,
      CONTRACT_ABI,
      provider
    );

    // Call verifyProduct function
    console.log('Verifying product with hash:', productHash);
    const result = await contract.verifyProduct(productHash);

    console.log('Verification result:', result);

    return {
      success: true,
      verification: {
        isAuthentic: result.isAuthentic,
        product: result.product || null,
        message: result.message || ''
      }
    };
  } catch (error) {
    console.error('Error verifying product:', error);
    return {
      success: false,
      error: error.message || 'Failed to verify product'
    };
  }
};

/**
 * Get blockchain and network information
 * 
 * @returns {Promise<Object>} - Blockchain details
 */
export const getBlockchainDetails = async () => {
  try {
    const provider = getProvider();

    // Get network information
    const network = await provider.getNetwork();
    const blockNumber = await provider.getBlockNumber();
    const gasPrice = await provider.getGasPrice();

    // Get contract address
    const contractAddress = getContractAddress();

    return {
      networkName: network.name || 'Unknown Network',
      chainId: network.chainId,
      currentBlock: blockNumber,
      gasPrice: ethers.utils.formatUnits(gasPrice, 'gwei'),
      contractAddress: contractAddress,
      deploymentBlock: 1, // Default for local deployment
    };
  } catch (error) {
    console.error('Error getting blockchain details:', error);
    throw error;
  }
};

/**
 * Connect to MetaMask wallet
 * 
 * @returns {Promise<string>} - User's wallet address
 */
export const connectWallet = async () => {
  try {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    // Request account access
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });

    if (accounts.length === 0) {
      throw new Error('No accounts found');
    }

    return accounts[0];
  } catch (error) {
    console.error('Error connecting wallet:', error);
    throw error;
  }
};

/**
 * Check if wallet is connected
 * 
 * @returns {Promise<string|null>} - User's wallet address or null if not connected
 */
export const checkWalletConnection = async () => {
  try {
    if (!window.ethereum) {
      return null;
    }

    const accounts = await window.ethereum.request({
      method: 'eth_accounts'
    });

    return accounts.length > 0 ? accounts[0] : null;
  } catch (error) {
    console.error('Error checking wallet connection:', error);
    return null;
  }
};

/**
 * Listen for account changes in MetaMask
 * 
 * @param {Function} callback - Function to call when account changes
 * @returns {Function} - Function to remove listener
 */
export const onAccountChange = (callback) => {
  if (!window.ethereum) return () => {};

  const handler = (accounts) => {
    callback(accounts[0] || null);
  };

  window.ethereum.on('accountsChanged', handler);

  // Return function to remove listener
  return () => {
    window.ethereum.removeListener('accountsChanged', handler);
  };
};

/**
 * Listen for network changes in MetaMask
 * 
 * @param {Function} callback - Function to call when network changes
 * @returns {Function} - Function to remove listener
 */
export const onNetworkChange = (callback) => {
  if (!window.ethereum) return () => {};

  const handler = (chainId) => {
    callback(chainId);
  };

  window.ethereum.on('chainChanged', handler);

  // Return function to remove listener
  return () => {
    window.ethereum.removeListener('chainChanged', handler);
  };
};

/**
 * Get current network information
 * 
 * @returns {Promise<Object>} - Network information
 */
export const getCurrentNetwork = async () => {
  try {
    const provider = getProvider();
    const network = await provider.getNetwork();

    return {
      name: network.name,
      chainId: network.chainId,
      ensAddress: network.ensAddress || null,
    };
  } catch (error) {
    console.error('Error getting current network:', error);
    throw error;
  }
};

/**
 * Validate product data
 * 
 * @param {Object} data - Product data object
 * @returns {Object} - Validation result
 */
export const validateProductData = (data) => {
  const errors = {};

  if (!data.productId || data.productId.trim().length === 0) {
    errors.productId = 'Product ID is required';
  }

  if (!data.productName || data.productName.trim().length === 0) {
    errors.productName = 'Product Name is required';
  }

  if (!data.batchNumber || data.batchNumber.trim().length === 0) {
    errors.batchNumber = 'Batch Number is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors: errors
  };
};

/**
 * Format hash for display (shortened version)
 * 
 * @param {string} hash - Full hash
 * @param {number} chars - Number of characters to show on each side
 * @returns {string} - Shortened hash
 */
export const shortenHash = (hash, chars = 6) => {
  if (!hash) return '';
  return `${hash.substring(0, chars + 2)}...${hash.substring(hash.length - chars)}`;
};

/**
 * Export Web3 utilities object for easier importing
 */
const web3Utils = {
  generateProductHash,
  getProvider,
  getSigner,
  registerProductOnBlockchain,
  verifyProductOnBlockchain,
  getBlockchainDetails,
  connectWallet,
  checkWalletConnection,
  onAccountChange,
  onNetworkChange,
  getCurrentNetwork,
  validateProductData,
  shortenHash,
};

export default web3Utils;
