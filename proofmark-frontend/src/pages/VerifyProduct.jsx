import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { Scanner } from '@yudiel/react-qr-scanner';
import jsQR from 'jsqr';
import { generateProductHash, verifyProductOnBlockchain } from '../utils/web3';
import '../css/pages.css';

/**
 * VerifyProduct Page Component
 * 
 * Allows anyone (customers, retailers, etc.) to verify product authenticity.
 * No wallet connection required for verification (read-only operation on blockchain).
 */
function VerifyProduct({ account }) {
  const location = useLocation();
  const demoProduct = {
    productId: 'SKU-001',
    productName: 'Whey Protein',
    batchNumber: 'BATCH-2026-01'
  };
  const [scanOpen, setScanOpen] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    productName: '',
    batchNumber: ''
  });

  const [productHash, setProductHash] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const copyValue = async (value) => {
    await navigator.clipboard.writeText(value);
    window.dispatchEvent(new CustomEvent('proofmark:toast', { detail: 'Copied to clipboard' }));
  };

  const extractHashFromQrValue = (value) => {
    if (!value) return null;

    const trimmedValue = value.trim();
    if (trimmedValue.startsWith('0x') && trimmedValue.length === 66) {
      return trimmedValue;
    }

    try {
      const parsedUrl = new URL(trimmedValue);
      const hashFromUrl = parsedUrl.searchParams.get('hash') || parsedUrl.searchParams.get('productHash');
      if (hashFromUrl && /^0x[a-fA-F0-9]{64}$/.test(hashFromUrl)) {
        return hashFromUrl;
      }
    } catch (error) {
      // Not a URL; continue with fallback parsing.
    }

    const directMatch = trimmedValue.match(/0x[a-fA-F0-9]{64}/);
    if (directMatch) {
      return directMatch[0];
    }

    const paramsMatch = trimmedValue.match(/[?&](?:hash|productHash)=([0-9a-fA-Fx]+)/i);
    if (paramsMatch) {
      return paramsMatch[1].startsWith('0x') ? paramsMatch[1] : `0x${paramsMatch[1]}`;
    }

    return null;
  };

  const verifyHash = async (hashValue) => {
    if (!hashValue) {
      setMessage('⚠️ No product hash available to verify');
      return;
    }

    setLoading(true);
    setMessage('⏳ Verifying product on blockchain...');

    try {
      const result = await verifyProductOnBlockchain(hashValue);

      if (result.success) {
        setVerificationResult(result.verification);
        setProductHash(hashValue);
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

  const handleQrScan = (result) => {
    const scannedValue = result?.[0]?.rawValue || result?.rawValue || result;
    const hash = extractHashFromQrValue(scannedValue);

    if (!hash) {
      setMessage('⚠️ QR code did not contain a valid product hash.');
      return;
    }

    setScanOpen(false);
    setProductHash(hash);
    setMessage('✅ QR code scanned. Verifying product...');
    void verifyHash(hash);
  };

  const handleQrUpload = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage('⚠️ Please upload a QR code image.');
      return;
    }

    setMessage('⏳ Reading QR image...');
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        if (!image.naturalWidth || !image.naturalHeight) {
          setMessage('⚠️ The uploaded image has no readable dimensions.');
          return;
        }

        const canvas = document.createElement('canvas');
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const context = canvas.getContext('2d', { willReadFrequently: true });
        if (!context) {
          setMessage('⚠️ Your browser could not process this image.');
          return;
        }
        context.drawImage(image, 0, 0);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const decoded = jsQR(imageData.data, imageData.width, imageData.height);

        if (!decoded?.data) {
          setMessage('⚠️ No readable QR code was found in that image.');
          return;
        }

        handleQrScan([{ rawValue: decoded.data }]);
      };
      image.onerror = () => setMessage('⚠️ The uploaded image could not be read.');
      image.src = reader.result;
    };
    reader.onerror = () => setMessage('⚠️ The uploaded image could not be read.');
    reader.readAsDataURL(file);
  };

  const downloadCertificate = () => {
    const product = verificationResult.product;
    const certificate = `<!doctype html><html><head><title>ProofMark Certificate</title><style>body{font-family:Arial;padding:48px;color:#17221f}h1{color:#0e766e}div{padding:12px 0;border-bottom:1px solid #ddd}small{display:block;color:#667}</style></head><body><h1>ProofMark Authenticity Certificate</h1><p>Verified on the local blockchain.</p><div><small>Product ID</small>${product.productId}</div><div><small>Product Name</small>${product.productName}</div><div><small>Batch Number</small>${product.batchNumber}</div><div><small>Manufacturer</small>${product.manufacturer}</div><div><small>Product Hash</small>${product.productHash}</div><div><small>Status</small>AUTHENTIC / ACTIVE</div></body></html>`;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([certificate], { type: 'text/html' }));
    link.download = `proofmark-${product.productId}-certificate.html`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

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

  const loadDemoCase = (isTampered) => {
    setFormData({
      ...demoProduct,
      batchNumber: isTampered ? 'BATCH-2026-99' : demoProduct.batchNumber
    });
    setProductHash(null);
    setVerificationResult(null);
    setMessage(isTampered ? 'Tampered demo loaded. Generate the hash to compare.' : 'Authentic demo loaded. Generate the hash to verify.');
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

    await verifyHash(productHash);
  };

  useEffect(() => {
    const hashFromQuery = new URLSearchParams(location.search).get('hash');
    if (hashFromQuery && /^0x[a-fA-F0-9]{64}$/.test(hashFromQuery)) {
      setProductHash(hashFromQuery);
      setMessage('✅ Product link detected. Verifying...');
      void verifyHash(hashFromQuery);
    }
  }, [location.search]);

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

          <div className="demo-controls" style={{ marginBottom: '20px' }}>
            <div><span className="info-kicker">SCAN</span><strong>Scan a QR proof</strong></div>
            <div className="qr-input-actions">
              <label className="btn-secondary qr-upload-button" htmlFor="product-qr-upload">Upload QR</label>
              <input id="product-qr-upload" type="file" accept="image/*" onChange={handleQrUpload} disabled={loading} />
              <button type="button" className="btn-secondary" onClick={() => setScanOpen((prev) => !prev)} disabled={loading}>
                {scanOpen ? 'Close scanner' : 'Open scanner'}
              </button>
            </div>
          </div>

          {scanOpen && (
            <div className="verification-progress" style={{ display: 'block', marginBottom: '20px', gridColumn: 'unset' }}>
              <div style={{ marginBottom: '10px' }}><strong>Camera scan</strong><p>Point the camera at a ProofMark QR code to verify instantly.</p></div>
              <div style={{ maxWidth: '420px', margin: '0 auto' }}>
                <Scanner
                  onScan={handleQrScan}
                  onError={(error) => {
                    console.error('Scanner error:', error);
                    setMessage('⚠️ QR scanner could not access the camera. Please enter the product details manually.');
                  }}
                  formats={['qr_code']}
                  constraints={{ facingMode: 'environment' }}
                  styles={{ container: { borderRadius: '12px', overflow: 'hidden' } }}
                />
              </div>
            </div>
          )}

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

          <div className="demo-controls">
            <div><span className="info-kicker">PRESENTATION MODE</span><strong>Try a prepared scenario</strong></div>
            <div className="demo-actions"><button type="button" onClick={() => loadDemoCase(false)} disabled={loading}>Authentic sample</button><button type="button" onClick={() => loadDemoCase(true)} disabled={loading}>Tampered sample</button></div>
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

        {loading && <div className="verification-progress"><span className="progress-spinner" /><div><strong>Reading the ProofMark ledger</strong><p>Generating a response from the local blockchain...</p></div></div>}

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
                <code className="detail-value copy-value" onClick={() => copyValue(verificationResult.product.productHash)} title="Copy hash">{verificationResult.product.productHash} ⧉</code>
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
                <code className="detail-value copy-value" onClick={() => copyValue(verificationResult.product.manufacturer)} title="Copy address">{verificationResult.product.manufacturer} ⧉</code>
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

            <div className="proof-tools">
              <div className="qr-card"><QRCodeCanvas value={`${window.location.origin}/verify?hash=${verificationResult.product.productHash}`} size={128} bgColor="#ffffff" fgColor="#0a3d3b" /><span>Scan to open verifier</span></div>
              <div className="proof-tool-copy"><span className="info-kicker">PRESENTATION PROOF</span><h3>Carry the result with you.</h3><p>Copy the on-chain identifiers, generate a QR handoff, or download a lightweight certificate.</p><div className="proof-tool-actions"><button className="btn-secondary" onClick={() => copyValue(verificationResult.product.productHash)}>Copy hash</button><button className="btn-primary" onClick={downloadCertificate}>Download certificate</button></div></div>
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
          <div className="info-heading">
            <span className="info-kicker">THE CHECK</span>
            <h2>How verification works</h2>
            <p>Five quiet steps turn product details into a clear yes-or-no answer.</p>
          </div>
          <ol className="steps-list">
            <li>
              <span className="step-index">01</span>
              <div><strong>Enter details</strong><p>Provide the product ID, name, and batch number.</p></div>
            </li>
            <li>
              <span className="step-index">02</span>
              <div><strong>Create the fingerprint</strong><p>ProofMark calculates a SHA-256 hash from the same fields used at registration.</p></div>
            </li>
            <li>
              <span className="step-index">03</span>
              <div><strong>Query the ledger</strong><p>The hash is checked against the registered records on-chain.</p></div>
            </li>
            <li>
              <span className="step-index">04</span>
              <div><strong>Read the result</strong><p>A matching record returns AUTHENTIC. No match returns NOT VERIFIED.</p></div>
            </li>
            <li>
              <span className="step-index">05</span>
              <div><strong>No gas required</strong><p>Verification is read-only, so it does not create a wallet transaction.</p></div>
            </li>
          </ol>

          <div className="key-point">
            <span className="key-point-mark">↯</span>
            <div><strong>Why exact details matter</strong><p>Change even one character and the fingerprint changes completely. That mismatch is the signal that the submitted details do not match the original record.</p></div>
          </div>
        </section>

        {/* Important Note */}
        <section className="important-note">
          <div className="section-title-row">
            <span className="info-kicker">READ THIS FIRST</span>
            <h2>Important limitations</h2>
          </div>
          <p className="section-intro">Blockchain proof is powerful, but it answers a specific question: was this information registered by an authorized manufacturer?</p>
          <ul className="limitations-list">
            <li>
              <span className="limitation-icon">01</span><div><strong>Registration is not a physical inspection</strong><p>This confirms a matching record exists. It cannot prove the object in your hands is the exact registered item.</p></div>
            </li>
            <li>
              <span className="limitation-icon">02</span><div><strong>Every character counts</strong><p>Product details are case-sensitive. One different character creates a different hash and fails verification.</p></div>
            </li>
            <li>
              <span className="limitation-icon">03</span><div><strong>Printed details still matter</strong><p>The check assumes the ID, name, and batch number were copied correctly from the product.</p></div>
            </li>
            <li>
              <span className="limitation-icon">04</span><div><strong>Authorization protects registration</strong><p>Only approved wallets can write records. Physical security is still needed to deter copied or counterfeit products.</p></div>
            </li>
          </ul>

          <p className="note-text">
            <strong>Best practice</strong><span>Pair this check with holograms, secure packaging, serialized labels, or QR security features.</span>
          </p>
        </section>

        {/* Example Cases */}
        <section className="examples-section">
          <div className="section-title-row"><span className="info-kicker">THREE OUTCOMES</span><h2>Example scenarios</h2></div>

          <div className="example example-authentic">
            <span className="example-status">MATCH</span><div><h4>Authentic product</h4><p>Exact details produce the registered hash. Manufacturer information and registration date are shown.</p></div>
          </div>

          <div className="example">
            <span className="example-status">NO RECORD</span><div><h4>Product not registered</h4><p>The generated hash does not exist on the ledger, so the product is marked not verified.</p></div>
          </div>

          <div className="example">
            <span className="example-status">MISMATCH</span><div><h4>Wrong details entered</h4><p>A small difference, such as a changed batch number, creates a new hash and returns not verified.</p></div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default VerifyProduct;
