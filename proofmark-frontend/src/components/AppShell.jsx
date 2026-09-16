import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const shortenAddress = (address) => (
  address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''
);

function AppShell({ children, account, setAccount, isConnected, setIsConnected }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [balance, setBalance] = useState(null);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('proofmark-theme') === 'dark');
  const [toast, setToast] = useState('');
  const location = useLocation();

  useEffect(() => {
    document.body.classList.toggle('theme-dark', darkMode);
    localStorage.setItem('proofmark-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    if (!window.ethereum || !account) {
      setBalance(null);
      return undefined;
    }
    const updateBalance = async () => {
      try {
        const rawBalance = await window.ethereum.request({ method: 'eth_getBalance', params: [account, 'latest'] });
        const value = Number.parseFloat((Number.parseInt(rawBalance, 16) / 1e18).toFixed(3));
        setBalance(value);
      } catch (error) {
        setBalance(null);
      }
    };
    updateBalance();
    return () => setBalance(null);
  }, [account]);

  useEffect(() => {
    const handleToast = (event) => {
      setToast(event.detail);
      window.setTimeout(() => setToast(''), 2200);
    };
    window.addEventListener('proofmark:toast', handleToast);
    return () => window.removeEventListener('proofmark:toast', handleToast);
  }, []);

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      window.dispatchEvent(new CustomEvent('proofmark:toast', { detail: 'Copied to clipboard' }));
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

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

        <nav className={`site-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Primary navigation">
          <span className="nav-label">WORKSPACE</span>
          <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setMenuOpen(false)}><span>01</span>Overview</NavLink>
          <NavLink to="/verify" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setMenuOpen(false)}><span>02</span>Verify</NavLink>
          <NavLink to="/register" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setMenuOpen(false)}><span>03</span>Register</NavLink>
          <NavLink to="/blockchain-details" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setMenuOpen(false)}><span>04</span>Ledger</NavLink>
        </nav>

        <div className="header-actions">
          <span className="network-status"><i /><span><small>NETWORK</small>Hardhat Local</span></span>
          {isConnected ? (
            <button className="wallet-chip" type="button" onClick={disconnectWallet} title="Disconnect wallet">
              <i /><span><small>CONNECTED / {balance === null ? '--' : `${balance} ETH`}</small>{shortenAddress(account)}</span>
            </button>
          ) : (
            <button className="connect-button" type="button" onClick={connectWallet}><span>+</span> Connect wallet</button>
          )}
          <button className="theme-toggle" type="button" onClick={() => setDarkMode(!darkMode)} title="Toggle theme" aria-label="Toggle theme">
            {darkMode ? '☼' : '◐'}
          </button>
        </div>
      </header>

      <div className="page-context">
        <span>{location.pathname === '/' ? 'CONTROL CENTER' : location.pathname.slice(1).replace('-', ' ').toUpperCase()}</span>
        <span className="context-line" />
        <span>LOCAL NETWORK / 1337</span>
        <button className="context-copy" type="button" onClick={() => copyText('http://127.0.0.1:8545')} title="Copy RPC URL">COPY RPC</button>
      </div>

      {children}

      {toast && <div className="app-toast" role="status">✓ {toast}</div>}

      <footer className="site-footer">
        <span>ProofMark / Product authenticity infrastructure</span>
        <span>SHA-256 + smart contract verification</span>
      </footer>
    </div>
  );
}

export default AppShell;
