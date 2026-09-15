import React, { useState } from 'react';
import { generateProductHash, verifyProductOnBlockchain } from '../utils/web3';
import '../css/pages.css';

/**
 * VerifyProduct Page Component
 * 
 * Allows anyone (customers, retailers, etc.) to verify product authenticity.
 * No wallet connection required for verification (read-only operation on blockchain).
 */
function VerifyProduct({ account }) {
  const [formData, setFormData] = useState({
    productId: '',
    productName: '',
    batchNumber: ''
  });

  const [productHash, setProductHash] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setProductHash(null);
    setVerificationResult(null);
    setMessage('');
  };

  const handleGenerateHash = () => {
    if (!formData.productId || !formData.productName || !formData.batchNumber) {
      setMessage('⚠️ Please fill in all fields to verify product');
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

  const handleVerifyProduct = async () => {
    if (!productHash) {
      setMessage('⚠️ Please generate hash first');
      return;
    }

    setLoading(true);
    setMessage('⏳ Verifying product on blockchain...');

    try {
      const result = await verifyProductOnBlockchain(productHash);

      if (result.success) {
        setVerificationResult(result.verification);
        if (result.verification.isAuthentic) {
          setMessage('✅ Product is AUTHENTIC!');
        } else {
          setMessage('❌ Product NOT FOUND on blockchain');
        }
      } else {
        setMessage(`⚠️ Verification error: ${result.error}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
      console.error('Verification error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <header className="page-header">
        <h1>✓ Verify Product</h1>
        <p className="subtitle">Check if a product is authentic by verifying it on the blockchain</p>
        <p className="no-wallet-note">
          💡 <strong>No wallet connection needed</strong> - Verification is a free read operation on blockchain
        </p>
      </header>

      {/* Main Content */}
      <main className="page-main">
        {/* Form Section */}
        <section className="form-section">
          <h2>Step 1: Enter Product Details</h2>
          <p className="form-instruction">
            Enter the exact same product details as they were registered.
            The system will generate the same hash and check the blockchain.
          </p>

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
            <small>Must match the registered product ID exactly</small>
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
            <small>Must match the registered product name exactly</small>
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
            <small>Must match the registered batch number exactly</small>
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
            <h2>Step 2: Generated Hash</h2>
            <div className="hash-display">
              <p className="hash-label">Product Hash (SHA-256):</p>
              <code className="hash-value">{productHash}</code>
              <p className="hash-info">
                This hash is now being checked against all registered products on the blockchain.
              </p>
            </div>

            <button
              className="btn-primary"
              onClick={handleVerifyProduct}
              disabled={loading}
            >
              {loading ? '⏳ Verifying...' : '⛓️ Verify on Blockchain'}
            </button>
          </section>
        )}

        {/* Status Message */}
        {message && (
          <div className={`message ${message.includes('✅') ? 'success' : message.includes('⏳') ? 'info' : 'error'}`}>
            {message}
          </div>
        )}

        {/* Verification Result - Authentic */}
        {verificationResult && verificationResult.isAuthentic && (
          <section className="result-section authentic">
            <div className="result-header">
              <span className="result-badge">✅ AUTHENTIC</span>
              <h2>Product Verified Successfully!</h2>
            </div>

            <div className="product-details">
              <h3>Product Information:</h3>
              <div className="detail-row">
                <span className="detail-label">Product Hash:</span>
                <code className="detail-value">{verificationResult.product.productHash}</code>
              </div>
              <div className="detail-row">
                <span className="detail-label">Product ID:</span>
                <span className="detail-value">{verificationResult.product.productId}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Product Name:</span>
                <span className="detail-value">{verificationResult.product.productName}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Batch Number:</span>
                <span className="detail-value">{verificationResult.product.batchNumber}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Manufacturer:</span>
                <code className="detail-value">{verificationResult.product.manufacturer}</code>
              </div>
              <div className="detail-row">
                <span className="detail-label">Registered On:</span>
                <span className="detail-value">
                  {new Date(verificationResult.product.registrationTime * 1000).toLocaleString()}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Status:</span>
                <span className="detail-value">
                  {verificationResult.product.isActive ? '🟢 Active' : '🔴 Deactivated'}
                </span>
              </div>
            </div>

            <div className="verification-proof">
              <h3>🔐 Blockchain Proof:</h3>
              <p className="proof-text">
                This product has been verified as authentic on the Ethereum blockchain.
                The registration is immutable and cannot be changed or tampered with.
              </p>
            </div>

            <button
              className="btn-secondary"
              onClick={() => {
                setFormData({ productId: '', productName: '', batchNumber: '' });
                setProductHash(null);
                setVerificationResult(null);
                setMessage('');
              }}
            >
              Verify Another Product
            </button>
          </section>
        )}

        {/* Verification Result - Not Found */}
        {verificationResult && !verificationResult.isAuthentic && (
          <section className="result-section not-authentic">
            <div className="result-header">
              <span className="result-badge error">⚠️ NOT VERIFIED</span>
              <h2>Product Not Found on Blockchain</h2>
            </div>

            <div className="warning-box">
              <p className="warning-text">
                This product is not registered in the blockchain system.
              </p>
              <p className="possible-reasons">
                <strong>Possible reasons:</strong>
              </p>
              <ul>
                <li>Product details do not match exact registration (case-sensitive)</li>
                <li>Product has not been registered by manufacturer</li>
                <li>Product has been deactivated (recalled)</li>
                <li>Counterfeit product using similar details</li>
              </ul>
            </div>

            <div className="next-steps">
              <h3>What to do:</h3>
              <ol>
                <li>Double-check product details for accuracy (exact spelling, numbers)</li>
                <li>Contact the manufacturer to verify product authenticity</li>
                <li>If discrepancy found, the product may be counterfeit</li>
              </ol>
            </div>

            <button
              className="btn-secondary"
              onClick={() => {
                setFormData({ productId: '', productName: '', batchNumber: '' });
                setProductHash(null);
                setVerificationResult(null);
                setMessage('');
              }}
            >
              Try Another Product
            </button>
          </section>
        )}

        {/* How It Works */}
        <section className="info-section">
          <h2>🔍 How Verification Works</h2>
          <ol className="steps-list">
            <li>
              <strong>You Enter Details:</strong> Provide product information
            </li>
            <li>
              <strong>Hash Generated:</strong> Frontend calculates SHA-256 hash (same as registration)
            </li>
            <li>
              <strong>Blockchain Query:</strong> System checks if hash exists on blockchain
            </li>
            <li>
              <strong>Result Displayed:</strong> Authentic ✅ or Not Found ❌
            </li>
            <li>
              <strong>No Gas Cost:</strong> Verification is read-only, completely free
            </li>
          </ol>

          <div className="key-point">
            <strong>Key Point:</strong> If you enter different details (even one character different),
            you'll get a completely different hash that won't match the blockchain.
            This proves the data hasn't been tampered with.
          </div>
        </section>

        {/* Important Note */}
        <section className="important-note">
          <h2>⚠️ Important Limitations</h2>
          <ul className="limitations-list">
            <li>
              <strong>Verifies Registration, Not Physical Authenticity:</strong>
              This system verifies the product was registered by a manufacturer.
              It does NOT verify the physical product in your hands is the actual registered item.
            </li>
            <li>
              <strong>Requires Exact Match:</strong>
              Product details must match exactly as registered (case-sensitive).
              Even one character difference will fail verification.
            </li>
            <li>
              <strong>Trust in Product Details:</strong>
              This assumes the product details are printed correctly on the physical product.
            </li>
            <li>
              <strong>Manufacturer Authorization:</strong>
              Only authorized manufacturers can register products.
              This does not prevent counterfeiters from registering fake products.
            </li>
          </ul>

          <p className="note-text">
            <strong>Best Practice:</strong> Combine blockchain verification with physical security features
            (holograms, special packaging, serial numbers) for maximum protection against counterfeits.
          </p>
        </section>

        {/* Example Cases */}
        <section className="examples-section">
          <h2>📝 Example Scenarios</h2>

          <div className="example">
            <h4>✅ Authentic Product</h4>
            <p>
              <strong>What happens:</strong> Customer enters exact details → hash matches
              blockchain → Shows manufacturer info, registration date → Status: AUTHENTIC
            </p>
          </div>

          <div className="example">
            <h4>❌ Product Not Registered</h4>
            <p>
              <strong>What happens:</strong> Customer enters details → hash doesn't exist
              on blockchain → Shows "Not Found" message → Status: NOT VERIFIED
            </p>
          </div>

          <div className="example">
            <h4>❌ Wrong Details Entered</h4>
            <p>
              <strong>What happens:</strong> Customer enters slightly different details
              (e.g., "BATCH-2024-02" instead of "BATCH-2024-01") → Different hash generated
              → Doesn't match blockchain → Status: NOT VERIFIED
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default VerifyProduct;
