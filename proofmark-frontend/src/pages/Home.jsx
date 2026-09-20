import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getBlockchainDetails } from '../utils/web3';
import '../css/pages.css';

function Home({ isConnected }) {
  const [latestRecord, setLatestRecord] = useState(null);
  const [networkSnapshot, setNetworkSnapshot] = useState(null);

  useEffect(() => {
    const savedRecord = localStorage.getItem('proofmark-latest-registration');
    if (savedRecord) setLatestRecord(JSON.parse(savedRecord));
  }, []);

  useEffect(() => {
    let active = true;
    const readNetwork = async () => {
      if (!window.ethereum) return;
      try {
        const details = await getBlockchainDetails();
        if (active) setNetworkSnapshot(details);
      } catch (error) {
        if (active) setNetworkSnapshot(null);
      }
    };
    readNetwork();
    const interval = window.setInterval(readNetwork, 12000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="hero-copy">
          <p className="eyebrow"><span /> TRUSTED PRODUCT IDENTITY</p>
          <h1>Know what you are holding.</h1>
          <p className="hero-lede">
            A clear, tamper-resistant record for every product. Register provenance on-chain,
            then verify it in seconds with the original product details.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" to="/verify">Verify a product <span>↗</span></Link>
            <Link className="button button-quiet" to="/register">Register inventory</Link>
          </div>
          <div className="hero-note">
            <span className="signal-dot" />
            {isConnected ? 'Manufacturer wallet connected' : 'Verification is open to everyone'}
          </div>
        </div>

        <div className="hero-visual" aria-label="Blockchain verification status">
          <div className="orbit orbit-large" />
          <div className="orbit orbit-small" />
          <div className="seal">
            <span className="seal-caption">ON-CHAIN</span>
            <strong>AUTHENTIC</strong>
            <span className="seal-check">✓</span>
          </div>
          <div className="visual-card visual-card-top"><span>NETWORK</span><strong>HARDHAT / 1337</strong></div>
          <div className="visual-card visual-card-bottom"><span>LAST VERIFIED</span><strong>BLOCK #004</strong></div>
        </div>
      </section>

      <section className="metric-strip">
        <div><strong>01</strong><span>Register once</span></div>
        <div><strong>02</strong><span>Hash the details</span></div>
        <div><strong>03</strong><span>Verify anywhere</span></div>
        <div className="metric-wide"><strong>SHA-256</strong><span>Every product receives a unique digital fingerprint</span></div>
      </section>

      {latestRecord && <section className="latest-record"><div><p className="eyebrow">LATEST LEDGER ENTRY</p><h2>{latestRecord.productName}</h2><p>{latestRecord.productId} / {latestRecord.batchNumber}</p></div><div className="latest-record-meta"><span>CONFIRMED</span><strong>BLOCK #{latestRecord.blockNumber}</strong><small>{latestRecord.transactionHash?.slice(0, 12)}...</small></div><Link className="button button-quiet" to="/verify">Verify again <span>↗</span></Link></section>}

      <section className="live-strip"><div className="live-pulse"><i /> LIVE LOCAL LEDGER</div><div><span>Current block</span><strong>{networkSnapshot ? `#${networkSnapshot.currentBlock}` : 'Waiting for RPC'}</strong></div><div><span>Contract</span><strong>{networkSnapshot ? `${networkSnapshot.contractAddress.slice(0, 8)}...${networkSnapshot.contractAddress.slice(-6)}` : 'Not connected'}</strong></div><Link to="/blockchain-details">View ledger <span>→</span></Link></section>

      <section className="feature-grid">
        <article className="feature-card feature-highlight">
          <p className="eyebrow"><span /> PROOF FLOW</p>
          <h3>From manufacturing to shelf check.</h3>
          <p>Every item is mapped to a unique hash, stored on-chain, and then verified instantly without a manual trust check.</p>
          <ul>
            <li>Product registration</li>
            <li>Signed blockchain entry</li>
            <li>Scan and verification</li>
          </ul>
        </article>

        <article className="feature-card">
          <p className="eyebrow"><span /> WHY IT MATTERS</p>
          <h3>Trust built into the handoff.</h3>
          <p>ProofMark helps you prove provenance, reduce counterfeit risk, and create a repeatable product record customers can verify.</p>
        </article>

        <article className="feature-card">
          <p className="eyebrow"><span /> DEMO READY</p>
          <h3>Built for quick storytelling.</h3>
          <p>Clear status states, QR-based proof, and live ledger details make the presentation feel credible from the first click.</p>
        </article>
      </section>

      <section className="home-section home-grid">
        <div>
          <p className="eyebrow">THE LEDGER MODEL</p>
          <h2>Proof that stays put.</h2>
          <p className="section-lede">ProofMark turns ordinary product details into a verifiable record. The hash is the fingerprint; the smart contract is the witness.</p>
        </div>
        <div className="principle-list">
          <article><span>01</span><div><h3>Traceable</h3><p>See who registered a product and when it entered the ledger.</p></div></article>
          <article><span>02</span><div><h3>Unaltered</h3><p>A changed ID, name, or batch creates a completely different hash.</p></div></article>
          <article><span>03</span><div><h3>Accessible</h3><p>Verification is a free, read-only check. No wallet required.</p></div></article>
        </div>
      </section>

      <section className="home-section stats-panel">
        <div className="mini-stat">
          <span>AUTHORITY</span>
          <strong>Manufacturer-led</strong>
        </div>
        <div className="mini-stat">
          <span>VERIFICATION</span>
          <strong>Instant read-only</strong>
        </div>
        <div className="mini-stat">
          <span>ACCESS</span>
          <strong>Public & private</strong>
        </div>
        <div className="mini-stat accent">
          <span>STATUS</span>
          <strong>{isConnected ? 'Connected' : 'Open demo'}</strong>
        </div>
      </section>

      <section className="action-band">
        <div><p className="eyebrow">READY WHEN YOU ARE</p><h2>Make authenticity part of the handoff.</h2></div>
        <Link className="button button-light" to="/verify">Open verifier <span>→</span></Link>
      </section>
    </main>
  );
}

export default Home;
