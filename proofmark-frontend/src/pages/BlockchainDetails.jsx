import React, { useState, useEffect } from 'react';
import { getBlockchainDetails } from '../utils/web3';
import '../css/pages.css';

/**
 * BlockchainDetails Page Component
 * 
 * Displays detailed information about blockchain transactions,
 * contract details, and network information.
 */
function BlockchainDetails({ account }) {
  const [blockchainInfo, setBlockchainInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [txHash, setTxHash] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    loadBlockchainDetails();
  }, []);

  const loadBlockchainDetails = async () => {
    try {
      const details = await getBlockchainDetails();
      setBlockchainInfo(details);
      setError('');
    } catch (err) {
      setError('Error loading blockchain details: ' + err.message);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchTransaction = async () => {
    if (!txHash.trim()) {
      alert('Please enter a transaction hash');
      return;
    }

    setSearchLoading(true);
    try {
      // In a real app, you'd query the blockchain for this tx
      alert('Transaction lookup feature would be implemented with blockchain API');
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <header className="page-header">
        <h1>⛓️ Blockchain Details</h1>
        <p className="subtitle">View blockchain network information and transaction history</p>
        {account && (
          <p className="account-info">
            📍 Connected Wallet: {account?.substring(0, 6)}...{account?.substring(account.length - 4)}
          </p>
        )}
      </header>

      {/* Main Content */}
      <main className="page-main">
        {/* Loading State */}
        {loading && (
          <div className="alert alert-info">
            ⏳ Loading blockchain information...
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="alert alert-error">
            ❌ {error}
          </div>
        )}

        {/* Blockchain Details */}
        {blockchainInfo && !loading && (
          <>
            {/* Network Information */}
            <section className="info-section">
              <h2>🌐 Network Information</h2>
              <div className="info-grid">
                <div className="info-card">
                  <h3>Network Name</h3>
                  <p className="info-value">{blockchainInfo.networkName}</p>
                  <small>Local Ethereum-compatible blockchain</small>
                </div>
                <div className="info-card">
                  <h3>Chain ID</h3>
                  <p className="info-value">{blockchainInfo.chainId}</p>
                  <small>Local Hardhat blockchain: 31337</small>
                </div>
                <div className="info-card">
                  <h3>Current Block</h3>
                  <p className="info-value">{blockchainInfo.currentBlock}</p>
                  <small>Latest block number on chain</small>
                </div>
                <div className="info-card">
                  <h3>Gas Price</h3>
                  <p className="info-value">{blockchainInfo.gasPrice} Gwei</p>
                  <small>Current gas price in Gwei</small>
                </div>
              </div>
            </section>

            {/* Smart Contract Information */}
            <section className="info-section">
              <h2>📄 Smart Contract Information</h2>
              <div className="contract-info">
                <div className="info-row">
                  <span className="info-label">Contract Name:</span>
                  <span className="info-value">ProductAuthenticity</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Contract Address:</span>
                  <code className="info-value">{blockchainInfo.contractAddress}</code>
                </div>
                <div className="info-row">
                  <span className="info-label">Deployed Block:</span>
                  <span className="info-value">{blockchainInfo.deploymentBlock}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Solidity Version:</span>
                  <span className="info-value">0.8.17</span>
                </div>
              </div>
            </section>

            {/* Contract Functions */}
            <section className="info-section">
              <h2>⚙️ Smart Contract Functions</h2>
              <div className="functions-grid">
                <div className="function-card">
                  <h3>registerProduct()</h3>
                  <p className="function-description">
                    Register a new product on the blockchain with hash and details.
                  </p>
                  <p className="function-type">
                    <span className="type-badge">Write</span> Requires gas, transaction fee applies
                  </p>
                  <p className="function-params">
                    <strong>Parameters:</strong> productHash, productId, productName, batchNumber
                  </p>
                </div>

                <div className="function-card">
                  <h3>verifyProduct()</h3>
                  <p className="function-description">
                    Verify if a product is authentic by checking its hash on blockchain.
                  </p>
                  <p className="function-type">
                    <span className="type-badge read-only">Read</span> Free, no gas cost
                  </p>
                  <p className="function-params">
                    <strong>Parameter:</strong> productHash
                  </p>
                </div>

                <div className="function-card">
                  <h3>authorizeManufacturer()</h3>
                  <p className="function-description">
                    Authorize a new manufacturer address to register products.
                  </p>
                  <p className="function-type">
                    <span className="type-badge">Write</span> Only contract owner
                  </p>
                  <p className="function-params">
                    <strong>Parameter:</strong> manufacturerAddress
                  </p>
                </div>

                <div className="function-card">
                  <h3>deactivateProduct()</h3>
                  <p className="function-description">
                    Deactivate a product (e.g., product recall scenario).
                  </p>
                  <p className="function-type">
                    <span className="type-badge">Write</span> Manufacturer or owner only
                  </p>
                  <p className="function-params">
                    <strong>Parameter:</strong> productHash
                  </p>
                </div>
              </div>
            </section>

            {/* Transaction History Info */}
            <section className="info-section">
              <h2>📋 Transaction Information</h2>
              <div className="transaction-info">
                <h3>About Transactions on Blockchain</h3>
                <ol className="info-list">
                  <li>
                    <strong>Transaction Hash:</strong> Unique identifier for each transaction.
                    Can be used to look up transaction details.
                  </li>
                  <li>
                    <strong>Block Number:</strong> Which block contains this transaction.
                    Once in block, transaction is immutable.
                  </li>
                  <li>
                    <strong>From Address:</strong> Wallet address that initiated the transaction.
                    Must sign with private key for authorization.
                  </li>
                  <li>
                    <strong>Gas Used:</strong> Computational cost of the transaction.
                    More complex operations use more gas.
                  </li>
                  <li>
                    <strong>Status:</strong> Success (1) or Failed (0).
                    Failed transactions still consume gas.
                  </li>
                </ol>
              </div>
            </section>

            {/* Search Transaction */}
            <section className="search-section">
              <h2>🔍 Search Transaction</h2>
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Enter transaction hash (0x...)"
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                  disabled={searchLoading}
                />
                <button
                  className="btn-secondary"
                  onClick={handleSearchTransaction}
                  disabled={searchLoading}
                >
                  {searchLoading ? '⏳ Searching...' : '🔍 Search'}
                </button>
              </div>
              <p className="search-help">
                Enter a transaction hash from your product registration to view details.
              </p>
            </section>

            {/* Blockchain Concepts */}
            <section className="concepts-section">
              <h2>📚 Understanding Blockchain Details</h2>

              <div className="concept-card">
                <h3>What is a Block?</h3>
                <p>
                  A block is a container of transactions. Each block contains:
                </p>
                <ul>
                  <li>Multiple transactions (e.g., product registrations)</li>
                  <li>Hash of previous block (linking blocks together)</li>
                  <li>Timestamp (when block was created)</li>
                  <li>Nonce (proof-of-work)</li>
                </ul>
              </div>

              <div className="concept-card">
                <h3>What is Gas?</h3>
                <p>
                  Gas is the cost of computing on the blockchain:
                </p>
                <ul>
                  <li><strong>Read Operations:</strong> Free (verifyProduct)</li>
                  <li><strong>Write Operations:</strong> Costs gas (registerProduct)</li>
                  <li><strong>Gas Price:</strong> Varies with network congestion</li>
                  <li><strong>Total Cost:</strong> Gas Used × Gas Price</li>
                </ul>
              </div>

              <div className="concept-card">
                <h3>What is Immutability?</h3>
                <p>
                  Once a block is added to the chain:
                </p>
                <ul>
                  <li>Cannot change the transaction data</li>
                  <li>Cannot delete the transaction</li>
                  <li>Cannot reorder transactions in the block</li>
                  <li>Changing one block breaks all subsequent blocks</li>
                </ul>
              </div>

              <div className="concept-card">
                <h3>What is a Consensus Mechanism?</h3>
                <p>
                  How the network agrees on the state of the blockchain:
                </p>
                <ul>
                  <li><strong>Proof-of-Work:</strong> Miners solve mathematical puzzles</li>
                  <li><strong>Proof-of-Stake:</strong> Validators stake cryptocurrency</li>
                  <li><strong>Local Network:</strong> Hardhat uses Proof-of-Authority</li>
                  <li><strong>Result:</strong> Distributed consensus - no central authority</li>
                </ul>
              </div>
            </section>

            {/* How to Read Blockchain Details */}
            <section className="info-section">
              <h2>🔎 How to Read Blockchain Details</h2>
              <table className="details-table">
                <thead>
                  <tr>
                    <th>Term</th>
                    <th>Meaning</th>
                    <th>Why It Matters</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Transaction Hash</strong></td>
                    <td>Unique ID of a transaction</td>
                    <td>Proof that transaction was recorded on blockchain</td>
                  </tr>
                  <tr>
                    <td><strong>Block Number</strong></td>
                    <td>Which block contains the transaction</td>
                    <td>Shows transaction is permanent (confirmed)</td>
                  </tr>
                  <tr>
                    <td><strong>From</strong></td>
                    <td>Wallet address that initiated transaction</td>
                    <td>Proves who signed and authorized the action</td>
                  </tr>
                  <tr>
                    <td><strong>Gas Used</strong></td>
                    <td>Computational cost of the transaction</td>
                    <td>Shows complexity and cost of operation</td>
                  </tr>
                  <tr>
                    <td><strong>Timestamp</strong></td>
                    <td>When transaction was included in block</td>
                    <td>Provides chronological record of events</td>
                  </tr>
                  <tr>
                    <td><strong>Status</strong></td>
                    <td>Success or failed transaction</td>
                    <td>Confirms whether operation completed</td>
                  </tr>
                </tbody>
              </table>
            </section>

            {/* Refresh Button */}
            <section className="action-section">
              <button
                className="btn-secondary"
                onClick={loadBlockchainDetails}
              >
                🔄 Refresh Blockchain Details
              </button>
            </section>
          </>
        )}

        {/* Empty State */}
        {!loading && !error && !blockchainInfo && (
          <div className="alert alert-info">
            ℹ️ No blockchain information available. Please check your connection.
          </div>
        )}

        {/* Help Section */}
        <section className="help-section">
          <h2>❓ FAQ - Blockchain Details</h2>

          <div className="faq-item">
            <h4>Q: What network is this using?</h4>
            <p>
              A: This is using a local Ethereum-compatible blockchain (Hardhat).
              It simulates Ethereum locally on your computer for testing and learning.
            </p>
          </div>

          <div className="faq-item">
            <h4>Q: Why does gas cost money?</h4>
            <p>
              A: Gas pays miners/validators to process and secure transactions.
              It prevents spam and incentivizes network security.
              Read operations (verification) are free.
            </p>
          </div>

          <div className="faq-item">
            <h4>Q: How is the blockchain secured?</h4>
            <p>
              A: Cryptographic hashing and consensus mechanisms make blockchain secure.
              To change one transaction, you'd need to redo all subsequent work.
              With many participants, this becomes computationally impossible.
            </p>
          </div>

          <div className="faq-item">
            <h4>Q: Can I see all transactions on blockchain?</h4>
            <p>
              A: Yes! Blockchain is transparent. All transactions are public and visible.
              You can search any transaction hash to see details.
              This transparency is one of blockchain's key features.
            </p>
          </div>

          <div className="faq-item">
            <h4>Q: What happens if a node goes down?</h4>
            <p>
              A: The blockchain continues on other nodes. Your data is safe because
              copies exist on thousands of computers. No single point of failure.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default BlockchainDetails;
