import React, { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { generateProductHash, registerProductOnBlockchain, getProductHistory, deactivateProductOnBlockchain } from '../utils/web3';
import '../css/pages.css';

/**
 * RegisterProduct Page Component
 * 
 * Allows authorized manufacturers to register products on the blockchain.
 * Combines product data and generates SHA-256 hash for blockchain storage.
 */
function RegisterProduct({ account, isConnected }) {
  const registrationSteps = [
    { title: 'Enter details', text: 'Provide product ID, name, and batch number.' },
    { title: 'Generate hash', text: 'Frontend calculates the SHA-256 hash from the combined data.' },
    { title: 'Sign transaction', text: 'MetaMask asks you to approve the signed blockchain record.' },
    { title: 'Blockchain storage', text: 'The smart contract stores the hash on-chain for verification.' },
    { title: 'Immutable record', text: 'The registration remains durable and can only be deactivated intentionally.' }
  ];

  const [formData, setFormData] = useState({
    productId: '',
    productName: '',
    batchNumber: ''
  });

  const [productHash, setProductHash] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState('');
  const [transactionDetails, setTransactionDetails] = useState(null);
  const [selectedLedgerEntry, setSelectedLedgerEntry] = useState(null);
  const [hiddenProductHashes, setHiddenProductHashes] = useState([]);

  useEffect(() => {
    const refreshHistory = async () => {
      if (!isConnected) {
        setHistory([]);
        return;
      }
      const records = await getProductHistory();
      setHistory(records);
    };
    refreshHistory();
  }, [isConnected, transactionDetails]);

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
        const registeredProduct = {
          productId: formData.productId,
          productName: formData.productName,
          batchNumber: formData.batchNumber,
          productHash,
        };
        localStorage.setItem('proofmark-latest-registration', JSON.stringify({
          ...result.details,
          ...registeredProduct,
        }));
        setTransactionDetails({ ...result.details, ...registeredProduct });
        setMessage('✅ Product registered successfully!');
        
        // Reset form
        setFormData({
          productId: '',
          productName: '',
          batchNumber: ''
        });
        setProductHash(null);
      } else {
        const isDuplicate = result.error?.includes('already registered');
        setMessage(`${isDuplicate ? '⚠️' : '❌'} ${result.error}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadQrCode = () => {
    const canvas = document.getElementById('registered-product-qr');
    if (!canvas || !transactionDetails?.productId) return;

    const link = document.createElement('a');
    link.download = `proofmark-${transactionDetails.productId}-qr.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const downloadHistoryQrCode = (entry) => {
    const canvas = document.getElementById(`history-qr-${entry.hash.slice(2)}`);
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `proofmark-${entry.productId}-qr.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleDeactivateProduct = async (hash) => {
    setLoading(true);
    setMessage('⏳ Deactivating product on blockchain...');
    const result = await deactivateProductOnBlockchain(hash, account);
    if (result.success) {
      setMessage('✅ Product deactivated successfully.');
      setTransactionDetails(null);
      const refreshed = await getProductHistory();
      setHistory(refreshed);
    } else {
      setMessage(`❌ Deactivation failed: ${result.error}`);
    }
    setLoading(false);
  };

  const visibleHistory = history
    .filter((entry) => !hiddenProductHashes.includes(entry.hash))
    .sort((a, b) => Number(b.isActive) - Number(a.isActive) || Number(b.registrationTime) - Number(a.registrationTime));

  const handleDeleteProductFromDashboard = (hash) => {
    setHiddenProductHashes((previous) => [...new Set([...previous, hash])]);
    setSelectedLedgerEntry(null);
    setMessage('✅ Product removed from dashboard view.');
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

            <div className="proof-tools registration-proof-tools">
              <div className="qr-card">
                <QRCodeCanvas
                  id="registered-product-qr"
                  value={`${window.location.origin}/verify?hash=${transactionDetails.productHash}`}
                  size={160}
                  bgColor="#ffffff"
                  fgColor="#0a3d3b"
                />
                <span>Product verification QR</span>
              </div>
              <div className="proof-tool-copy">
                <span className="info-kicker">PRODUCT HANDOFF</span>
                <h3>QR proof ready.</h3>
                <p>Attach this QR code to the product label or share it with a buyer. Scanning it opens the verifier with this product hash.</p>
                <div className="proof-tool-actions">
                  <button className="btn-primary" type="button" onClick={downloadQrCode}>Download QR</button>
                </div>
              </div>
            </div>

            <button
              className="btn-secondary"
              onClick={() => setTransactionDetails(null)}
            >
              Register Another Product
            </button>
          </section>
        )}

        {isConnected && history.length > 0 && (
          <section className="history-panel">
            <div className="section-title-row"><span className="info-kicker">MANUFACTURER VIEW</span><h2>Registered product ledger</h2></div>
            <div className="history-list">
              {visibleHistory.map((entry, index) => (
                <div
                  className="history-item"
                  key={entry.hash}
                  onClick={() => setSelectedLedgerEntry(entry)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      setSelectedLedgerEntry(entry);
                    }
                  }}
                >
                  <div className="history-main">
                    <span className="serial-number">Sr. {index + 1}</span>
                    <div className="product-identity-block">
                      <strong className="product-name-display">{entry.productName}</strong>
                      <div className="product-meta-line">
                        <span>{entry.productId}</span>
                        <span className="meta-separator">•</span>
                        <span>{entry.batchNumber}</span>
                      </div>
                      <small className="product-hash-line">
                        {entry.hash.slice(0, 12)}...{entry.hash.slice(-8)}
                        <span className="meta-separator">•</span>
                        {new Date(entry.registrationTime * 1000).toLocaleDateString()}
                      </small>
                    </div>
                  </div>
                  <div className="history-actions">
                    <div className="history-qr">
                      <QRCodeCanvas
                        id={`history-qr-${entry.hash.slice(2)}`}
                        value={`${window.location.origin}/verify?hash=${entry.hash}`}
                        size={58}
                        bgColor="#ffffff"
                        fgColor="#0a3d3b"
                      />
                      <button
                        className="btn-secondary small"
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          downloadHistoryQrCode(entry);
                        }}
                        title={`Download QR for ${entry.productId}`}
                      >
                        ↓ QR
                      </button>
                    </div>
                    <span className={`status-pill ${entry.isActive ? 'active' : 'inactive'}`}>{entry.isActive ? 'Active' : 'Inactive'}</span>
                    <button
                      className="btn-secondary small"
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelectedLedgerEntry(entry);
                      }}
                    >
                      Details
                    </button>
                    {entry.isActive && (
                      <button
                        className="btn-secondary small"
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleDeactivateProduct(entry.hash);
                        }}
                      >
                        Deactivate
                      </button>
                    )}
                    <button
                      className="btn-secondary small"
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleDeleteProductFromDashboard(entry.hash);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {selectedLedgerEntry && (
          <div className="product-modal-backdrop" onClick={() => setSelectedLedgerEntry(null)}>
            <div className="product-modal" onClick={(event) => event.stopPropagation()}>
              <div className="product-modal-header">
                <div>
                  <span className="info-kicker">PRODUCT DETAILS</span>
                  <h3>{selectedLedgerEntry.productName}</h3>
                </div>
                <button className="mini-close-button" type="button" onClick={() => setSelectedLedgerEntry(null)}>×</button>
              </div>

              <div className="product-modal-body">
                <div className="product-modal-qr">
                  <QRCodeCanvas
                    value={`${window.location.origin}/verify?hash=${selectedLedgerEntry.hash}`}
                    size={160}
                    bgColor="#ffffff"
                    fgColor="#0a3d3b"
                  />
                </div>

                <div className="product-modal-info">
                  <div className="detail-row">
                    <span className="detail-label">Product ID</span>
                    <span className="detail-value">{selectedLedgerEntry.productId}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Batch</span>
                    <span className="detail-value">{selectedLedgerEntry.batchNumber}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Manufacturer</span>
                    <span className="detail-value">{selectedLedgerEntry.manufacturer}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Status</span>
                    <span className={`status-pill ${selectedLedgerEntry.isActive ? 'active' : 'inactive'}`}>
                      {selectedLedgerEntry.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Registration Time</span>
                    <span className="detail-value">{new Date(selectedLedgerEntry.registrationTime * 1000).toLocaleString()}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Full Hash</span>
                    <code className="detail-value">{selectedLedgerEntry.hash}</code>
                  </div>
                  {selectedLedgerEntry.isActive && (
                    <div className="detail-row">
                      <span className="detail-label">Action</span>
                      <div className="copy-value-row" style={{ gap: '8px' }}>
                        <button
                          className="btn-secondary small"
                          type="button"
                          onClick={() => {
                            handleDeactivateProduct(selectedLedgerEntry.hash);
                            setSelectedLedgerEntry(null);
                          }}
                        >
                          Deactivate Product
                        </button>
                        <button
                          className="btn-secondary small"
                          type="button"
                          onClick={() => {
                            handleDeleteProductFromDashboard(selectedLedgerEntry.hash);
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* How It Works */}
        <section className="info-section">
          <h2>🔍 How Registration Works</h2>
          <ol className="steps-list">
            {registrationSteps.map((step, index) => (
              <li key={step.title}>
                <span className="step-index">{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <strong>{step.title}:</strong>
                  <p>{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Technical Info */}
        <section className="tech-info">
          <div className="section-title-row"><span className="info-kicker">DATA MODEL</span><h2>What gets stored?</h2></div>
          <p className="section-intro">The ledger keeps only the fields needed to reproduce and verify a product fingerprint.</p>
          <div className="storage-grid">
            <div className="storage-column storage-onchain">
              <div className="storage-heading"><span className="storage-badge">ON-CHAIN</span><strong>Verification record</strong></div>
              <ul>
                <li>Product hash <small>SHA-256 fingerprint</small></li>
                <li>Product ID <small>SKU or serial reference</small></li>
                <li>Product name <small>Registered product label</small></li>
                <li>Batch number <small>Manufacturing reference</small></li>
                <li>Manufacturer address <small>Wallet that registered it</small></li>
                <li>Registration timestamp <small>When the record was created</small></li>
                <li>Active status <small>Current product state</small></li>
              </ul>
            </div>
            <div className="storage-column storage-offchain">
              <div className="storage-heading"><span className="storage-badge">OFF-CHAIN</span><strong>Kept outside the ledger</strong></div>
              <ul>
                <li>Product images <small>Media remains lightweight</small></li>
                <li>Detailed descriptions <small>Not needed for hash matching</small></li>
                <li>Pricing information <small>Can change independently</small></li>
                <li>Personal data <small>Minimizes sensitive data exposure</small></li>
              </ul>
            </div>
          </div>
          <p className="storage-note"><strong>Cost-aware by design</strong><span>Only essential verification data is written on-chain, keeping gas use focused while preserving the authenticity check.</span></p>
        </section>

        {/* Security Note */}
        <section className="security-note">
          <div className="section-title-row"><span className="info-kicker">TRUST BOUNDARIES</span><h2>Security considerations</h2></div>
          <p className="section-intro">Your wallet remains the signing boundary. ProofMark never receives your private key.</p>
          <ul className="security-list">
            <li><span>01</span><div><strong>Private key stays in MetaMask</strong><p>It is never sent to ProofMark or stored by the application.</p></div></li>
            <li><span>02</span><div><strong>You approve every write</strong><p>Transactions are signed in MetaMask before they reach the network.</p></div></li>
            <li><span>03</span><div><strong>Records are immutable</strong><p>Once confirmed, a registration cannot be edited or quietly removed.</p></div></li>
            <li><span>04</span><div><strong>Registration is permissioned</strong><p>Only authorized manufacturer wallets can create product records.</p></div></li>
            <li><span>05</span><div><strong>Hashes are deterministic</strong><p>The same product details always produce the same fingerprint.</p></div></li>
          </ul>
        </section>
      </main>
    </div>
  );
}

export default RegisterProduct;
