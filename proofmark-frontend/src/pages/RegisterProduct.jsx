import React, { useState } from 'react';
import { generateProductHash, registerProductOnBlockchain } from '../utils/web3';
import '../css/pages.css';

/**
 * RegisterProduct Page Component
 * 
 * Allows authorized manufacturers to register products on the blockchain.
 * Combines product data and generates SHA-256 hash for blockchain storage.
 */
function RegisterProduct({ account, isConnected }) {
  const [formData, setFormData] = useState({
    productId: '',
    productName: '',
    batchNumber: ''
  });

  const [productHash, setProductHash] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [transactionDetails, setTransactionDetails] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setProductHash(null);
    setMessage('');
  };

  const handleGenerateHash = () => {
    if (!formData.productId || !formData.productName || !formData.batchNumber) {
      setMessage('⚠️ Please fill in all fields to generate hash');
      return;
    }

    const hash = generateProductHash(
      formData.productId,
      formData.productName,
      formData.batchNumber
    );

    setProductHash(hash);
    setMessage('✅ Hash generated successfully!');
  };

  const handleRegisterProduct = async () => {
    if (!productHash) {
      setMessage('⚠️ Please generate hash first');
      return;
    }

    if (!isConnected) {
      setMessage('⚠️ Please connect your wallet first');
      return;
    }

    setLoading(true);
    setMessage('⏳ Registering product on blockchain...');

    try {
      const result = await registerProductOnBlockchain(
        productHash,
        formData.productId,
        formData.productName,
        formData.batchNumber,
        account
      );

      if (result.success) {
        setTransactionDetails(result.details);
        setMessage('✅ Product registered successfully!');
        
        // Reset form
        setFormData({
          productId: '',
          productName: '',
          batchNumber: ''
        });
        setProductHash(null);
      } else {
        setMessage(`❌ Registration failed: ${result.error}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <header className="page-header">
        <h1>📝 Register Product</h1>
        <p className="subtitle">Manufacturers: Register authentic products on the blockchain</p>
        {isConnected && (
          <p className="account-info">
            📍 Connected: {account?.substring(0, 6)}...{account?.substring(account.length - 4)}
          </p>
        )}
      </header>

      {/* Main Content */}
      <main className="page-main">
        {!isConnected && (
          <div className="alert alert-warning">
            ⚠️ <strong>Please connect your MetaMask wallet to register products.</strong>
          </div>
        )}

        {/* Form Section */}
        <section className="form-section">
          <h2>Step 1: Enter Product Details</h2>
          <div className="form-group">
            <label htmlFor="productId">Product ID (SKU):</label>
            <input
              type="text"
              id="productId"
              name="productId"
              value={formData.productId}
              onChange={handleInputChange}
              placeholder="e.g., SKU-001"
              disabled={loading}
            />
            <small>Unique identifier for the product</small>
          </div>

          <div className="form-group">
            <label htmlFor="productName">Product Name:</label>
            <input
              type="text"
              id="productName"
              name="productName"
              value={formData.productName}
              onChange={handleInputChange}
              placeholder="e.g., Authentic Smartphone"
              disabled={loading}
            />
            <small>Official product name from manufacturer</small>
          </div>

          <div className="form-group">
            <label htmlFor="batchNumber">Batch Number:</label>
            <input
              type="text"
              id="batchNumber"
              name="batchNumber"
              value={formData.batchNumber}
              onChange={handleInputChange}
              placeholder="e.g., BATCH-2024-01"
              disabled={loading}
            />
            <small>Manufacturing batch identifier</small>
          </div>

          <button
            className="btn-secondary"
            onClick={handleGenerateHash}
            disabled={loading}
          >
            🔐 Generate SHA-256 Hash
          </button>
        </section>

        {/* Hash Display Section */}
        {productHash && (
          <section className="hash-section">
            <h2>Step 2: Review Generated Hash</h2>
            <div className="hash-display">
              <p className="hash-label">Product Hash (SHA-256):</p>
              <code className="hash-value">{productHash}</code>
              <p className="hash-info">
                This hash is a cryptographic fingerprint of your product data.
                Same data always produces the same hash (deterministic).
                If data is tampered with, hash will be completely different.
              </p>
            </div>

            <button
              className="btn-primary"
              onClick={handleRegisterProduct}
              disabled={loading || !isConnected}
            >
              {loading ? '⏳ Registering...' : '⛓️ Register on Blockchain'}
            </button>
          </section>
        )}

        {/* Status Message */}
        {message && (
          <div className={`message ${message.includes('✅') ? 'success' : message.includes('⏳') ? 'info' : 'error'}`}>
            {message}
          </div>
        )}

        {/* Transaction Details */}
        {transactionDetails && (
          <section className="transaction-section">
            <h2>✅ Registration Successful!</h2>
            <div className="transaction-details">
              <div className="detail-row">
                <span className="detail-label">Transaction Hash:</span>
                <code className="detail-value">{transactionDetails.transactionHash}</code>
              </div>
              <div className="detail-row">
                <span className="detail-label">Block Number:</span>
                <span className="detail-value">{transactionDetails.blockNumber}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Manufacturer Address:</span>
                <code className="detail-value">{transactionDetails.manufacturer}</code>
              </div>
              <div className="detail-row">
                <span className="detail-label">Gas Used:</span>
                <span className="detail-value">{transactionDetails.gasUsed}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Timestamp:</span>
                <span className="detail-value">
                  {new Date(transactionDetails.timestamp * 1000).toLocaleString()}
                </span>
              </div>
            </div>

            <p className="success-message">
              ✨ Your product is now registered on the blockchain and cannot be tampered with!
            </p>

            <button
              className="btn-secondary"
              onClick={() => setTransactionDetails(null)}
            >
              Register Another Product
            </button>
          </section>
        )}

        {/* How It Works */}
        <section className="info-section">
          <h2>🔍 How Registration Works</h2>
          <ol className="steps-list">
            <li>
              <strong>Enter Details:</strong> Provide product ID, name, and batch number
            </li>
            <li>
              <strong>Generate Hash:</strong> Frontend calculates SHA-256 hash of combined data
            </li>
            <li>
              <strong>Sign Transaction:</strong> MetaMask asks you to sign with your private key
            </li>
            <li>
              <strong>Blockchain Storage:</strong> Smart contract stores hash on blockchain
            </li>
            <li>
              <strong>Immutable Record:</strong> Registration cannot be changed or deleted
            </li>
          </ol>
        </section>

        {/* Technical Info */}
        <section className="tech-info">
          <h2>💡 What Gets Stored?</h2>
          <div className="storage-info">
            <h4>On Blockchain:</h4>
            <ul>
              <li>Product Hash (SHA-256)</li>
              <li>Product ID</li>
              <li>Product Name</li>
              <li>Batch Number</li>
              <li>Manufacturer Address</li>
              <li>Registration Timestamp</li>
              <li>Active Status</li>
            </ul>

            <h4>Not Stored (Cost Optimization):</h4>
            <ul>
              <li>Product images</li>
              <li>Detailed descriptions</li>
              <li>Pricing information</li>
              <li>Personal data</li>
            </ul>

            <p className="storage-note">
              Only essential data is stored on blockchain to minimize gas costs
              while maintaining authenticity verification.
            </p>
          </div>
        </section>

        {/* Security Note */}
        <section className="security-note">
          <h2>🔒 Security Considerations</h2>
          <ul className="security-list">
            <li>Your private key is <strong>never</strong> sent to our servers</li>
            <li>Transaction signing happens entirely in MetaMask</li>
            <li>Once registered, data is immutable on blockchain</li>
            <li>Only authorized manufacturers can register products</li>
            <li>Hash generation is deterministic - same data produces same hash</li>
          </ul>
        </section>
      </main>
    </div>
  );
}

export default RegisterProduct;
