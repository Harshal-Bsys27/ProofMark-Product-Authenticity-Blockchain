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
  "function verifyProduct(bytes32 _productHash) public returns (bool isAuthentic, tuple(string productId, string productName, string batchNumber, bytes32 productHash, address manufacturer, uint256 registrationTime, bool isActive) product, string message)",
  "function getProductCount() public view returns (uint256)",
  "function getProductHashAt(uint256 _index) public view returns (bytes32)",
  "function getProduct(bytes32 _productHash) public view returns (tuple(string productId, string productName, string batchNumber, bytes32 productHash, address manufacturer, uint256 registrationTime, bool isActive) product, bool exists)",
  "function deactivateProduct(bytes32 _productHash) public",
  "function isManufacturerAuthorized(address _manufacturer) public view returns (bool)",
  "event ProductRegistered(bytes32 indexed productHash, string productId, address indexed manufacturer, uint256 registrationTime)",
  "event ProductDeactivated(bytes32 indexed productHash, address indexed deactivatedBy, uint256 deactivationTime, uint256 blockNumber)",
];

const NETWORKS = {
  1337: { name: 'Hardhat Local', rpcUrl: 'http://127.0.0.1:8545' },
  11155111: { name: 'Sepolia Testnet', rpcUrl: 'https://ethereum-sepolia-rpc.publicnode.com' },
};

export const getActiveNetwork = async () => {
  if (!window.ethereum) {
    return { chainId: 11155111, ...NETWORKS[11155111] };
  }
  const chainId = Number.parseInt(await window.ethereum.request({ method: 'eth_chainId' }), 16);
  return { chainId, ...(NETWORKS[chainId] || { name: `Chain ${chainId}`, rpcUrl: '' }) };
};

// Runtime deployment metadata prevents a stale dev-server environment from pointing at an old chain.
const getContractAddress = async () => {
  const { chainId, name } = await getActiveNetwork();
  try {
    const response = await fetch(`/deployments.json?ts=${Date.now()}`, { cache: 'no-store' });
    if (response.ok) {
      const deployments = await response.json();
      const deployment = deployments[String(chainId)] || deployments.deployments?.[String(chainId)];
      if (deployment && ethers.utils.isAddress(deployment.contractAddress)) {
        localStorage.setItem('contractAddress', deployment.contractAddress);
        return deployment.contractAddress;
      }
    }
  } catch (error) {
    // Fall back to the build environment when runtime metadata is unavailable.
  }

  const configuredAddress = chainId === 1337
    ? localStorage.getItem('contractAddress') || process.env.REACT_APP_CONTRACT_ADDRESS
    : process.env[`REACT_APP_${chainId}_CONTRACT_ADDRESS`];
  if (!configuredAddress || !ethers.utils.isAddress(configuredAddress)) {
    throw new Error(`No ${name} contract deployment is configured. Deploy the contract to ${name} first.`);
  }
  return configuredAddress;
};

const ensureContractCode = async (provider, contractAddress) => {
  const code = await provider.getCode(contractAddress);
  if (!code || code === '0x') {
    throw new Error(
      `No contract is deployed at ${contractAddress}. Start the demo with start-demo.ps1 so the frontend receives the current deployment.`
    );
  }
};

const formatContractError = (error, fallback) => {
  if (error?.code === 'CALL_EXCEPTION') {
    return 'The selected network deployment is out of sync. Check MetaMask network and deploy the contract for that network.';
  }
  return error?.message || fallback;
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

export const getReadProvider = async () => {
  const network = await getActiveNetwork();
  if (window.ethereum) {
    return new ethers.providers.Web3Provider(window.ethereum);
  }
  if (!network.rpcUrl) {
    throw new Error('No read-only RPC endpoint is configured for the selected network.');
  }
  return new ethers.providers.JsonRpcProvider(network.rpcUrl, network.chainId);
};

/**
 * Get signer (user's wallet) from MetaMask
 * @returns {Promise<ethers.Signer>}
 */
export const getSigner = async () => {
  const provider = getProvider();
  return provider.getSigner();
};

const ensureSupportedNetwork = async () => {
  const network = await getActiveNetwork();
  if (!NETWORKS[network.chainId]) {
    throw new Error('Unsupported network. Select Hardhat Local (1337) or Sepolia Testnet (11155111) in MetaMask.');
  }
  return network;
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

    await ensureSupportedNetwork();
    const provider = getProvider();

    const signer = await getSigner();
    
    // Get contract instance
    const contractAddress = await getContractAddress();
    await ensureContractCode(provider, contractAddress);
    const contract = new ethers.Contract(
      contractAddress,
      CONTRACT_ABI,
      signer
    );

    const signerAddress = await signer.getAddress();
    const isAuthorized = await contract.isManufacturerAuthorized(signerAddress);
    if (!isAuthorized) {
      throw new Error(
        `Wallet ${signerAddress} is not authorized on this deployment. Run start-demo.ps1 with -ManufacturerAddress ${signerAddress}.`
      );
    }

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
      error: formatContractError(error, 'Failed to register product')
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
    const provider = await getReadProvider();
    
    // Get contract instance (read-only)
    const contractAddress = await getContractAddress();
    await ensureContractCode(provider, contractAddress);
    const contract = new ethers.Contract(
      contractAddress,
      CONTRACT_ABI,
      provider
    );

    // Use the view-only lookup so customers never need a wallet or signer.
    console.log('Verifying product with hash:', productHash);
    const result = await contract.getProduct(productHash);
    const product = result.product || result[0];
    const exists = result.exists ?? result[1];
    const isAuthentic = Boolean(exists && product.isActive);

    console.log('Verification result:', result);

    return {
      success: true,
      verification: {
        isAuthentic,
        product: exists ? product : null,
        message: isAuthentic
          ? 'Product verified - AUTHENTIC - Registered on blockchain'
          : exists
            ? 'Product has been deactivated - NOT VERIFIED'
            : 'Product not found on blockchain - NOT VERIFIED'
      }
    };
  } catch (error) {
    console.error('Error verifying product:', error);
    return {
      success: false,
      error: formatContractError(error, 'Failed to verify product')
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
    const provider = await getReadProvider();

    // Get network information
    const network = await provider.getNetwork();
    const blockNumber = await provider.getBlockNumber();
    const gasPrice = await provider.getGasPrice();

    // Get contract address
    const contractAddress = await getContractAddress();
    await ensureContractCode(provider, contractAddress);

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

export const getProductHistory = async () => {
  try {
    const provider = await getReadProvider();
    const contractAddress = await getContractAddress();
    await ensureContractCode(provider, contractAddress);
    const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, provider);
    const total = Number(await contract.getProductCount());
    const entries = [];

    for (let i = 0; i < total; i += 1) {
      const hash = await contract.getProductHashAt(i);
      const [product, exists] = await contract.getProduct(hash);
      if (exists) {
        entries.push({
          hash,
          productId: product.productId,
          productName: product.productName,
          batchNumber: product.batchNumber,
          manufacturer: product.manufacturer,
          registrationTime: Number(product.registrationTime),
          isActive: product.isActive,
        });
      }
    }

    return entries.slice().reverse();
  } catch (error) {
    console.error('Error loading product history:', error);
    return [];
  }
};

export const deactivateProductOnBlockchain = async (productHash, account) => {
  try {
    if (!account) {
      throw new Error('Wallet not connected');
    }

    await ensureSupportedNetwork();
    const provider = getProvider();
    const signer = await getSigner();
    const contractAddress = await getContractAddress();
    await ensureContractCode(provider, contractAddress);
    const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer);
    const tx = await contract.deactivateProduct(productHash);
    const receipt = await tx.wait();

    return {
      success: true,
      details: {
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        manufacturer: account,
        gasUsed: receipt.gasUsed.toString(),
        timestamp: Math.floor(Date.now() / 1000),
      }
    };
  } catch (error) {
    console.error('Error deactivating product:', error);
    return {
      success: false,
      error: formatContractError(error, 'Failed to deactivate product')
    };
  }
};

export const getTransactionDetails = async (transactionHash) => {
  const provider = await getReadProvider();
  const normalizedHash = transactionHash.trim();

  if (!ethers.utils.isHexString(normalizedHash, 32)) {
    throw new Error('Enter a valid 66-character transaction hash beginning with 0x.');
  }

  const transaction = await provider.getTransaction(normalizedHash);
  if (!transaction) {
    throw new Error('Transaction was not found on the connected network.');
  }

  const receipt = await provider.getTransactionReceipt(normalizedHash);
  if (!receipt) {
    return {
      hash: transaction.hash,
      from: transaction.from,
      to: transaction.to,
      value: ethers.utils.formatEther(transaction.value),
      blockNumber: null,
      status: 'Pending',
      gasUsed: null,
      timestamp: null,
    };
  }

  const block = await provider.getBlock(receipt.blockNumber);
  return {
    hash: transaction.hash,
    from: transaction.from,
    to: transaction.to,
    value: ethers.utils.formatEther(transaction.value),
    blockNumber: receipt.blockNumber,
    status: receipt.status === 1 ? 'Confirmed' : 'Failed',
    gasUsed: receipt.gasUsed.toString(),
    timestamp: block ? block.timestamp : null,
  };
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
    const provider = await getReadProvider();
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
  getProductHistory,
  deactivateProductOnBlockchain,
  getTransactionDetails,
  connectWallet,
  checkWalletConnection,
  onAccountChange,
  onNetworkChange,
  getCurrentNetwork,
  validateProductData,
  shortenHash,
};

export default web3Utils;
