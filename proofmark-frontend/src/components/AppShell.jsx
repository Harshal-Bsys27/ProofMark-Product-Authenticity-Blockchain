import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const shortenAddress = (address) => (
  address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''
);

function AppShell({ children, account, setAccount, isConnected, setIsConnected }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const connectWallet = async () => {
    if (!window.ethereum) {
      window.alert('MetaMask is required to connect a manufacturer wallet.');
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
      setIsConnected(true);
    } catch (error) {
      console.error('Wallet connection failed:', error);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setIsConnected(false);
  };

  return (
    <div className="app-frame">
      <header className="site-header">
        <NavLink to="/" className="brand" onClick={() => setMenuOpen(false)}>
          <span className="brand-mark">ID</span>
          <span>
            <strong>Proof<span>Mark</span></strong>
            <small>AUTHENTICITY LEDGER</small>
          </span>
        </NavLink>

        <button
          className="menu-toggle"
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span />
          <span />
        </button>

        <nav className={`site-nav ${menuOpen ? 'is-open' : ''}`}>
          <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setMenuOpen(false)}>Overview</NavLink>
          <NavLink to="/verify" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setMenuOpen(false)}>Verify</NavLink>
          <NavLink to="/register" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setMenuOpen(false)}>Register</NavLink>
          <NavLink to="/blockchain-details" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setMenuOpen(false)}>Ledger</NavLink>
        </nav>

        <div className="header-actions">
          <span className="network-status"><i /> Hardhat Local</span>
          {isConnected ? (
            <button className="wallet-chip" type="button" onClick={disconnectWallet} title="Disconnect wallet">
              <i /> {shortenAddress(account)}
            </button>
          ) : (
            <button className="connect-button" type="button" onClick={connectWallet}>Connect wallet</button>
          )}
        </div>
      </header>

      <div className="page-context">
        <span>{location.pathname === '/' ? 'CONTROL CENTER' : location.pathname.slice(1).replace('-', ' ').toUpperCase()}</span>
        <span className="context-line" />
        <span>LOCAL NETWORK / 1337</span>
      </div>

      {children}

      <footer className="site-footer">
        <span>ProofMark / Product authenticity infrastructure</span>
        <span>SHA-256 + smart contract verification</span>
      </footer>
    </div>
  );
}

export default AppShell;
