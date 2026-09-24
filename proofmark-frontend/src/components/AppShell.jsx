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
  const [network, setNetwork] = useState({ name: 'Hardhat Local', chainId: 1337, rpcUrl: 'http://127.0.0.1:8545' });
  const [isFullscreen, setIsFullscreen] = useState(Boolean(document.fullscreenElement));
  const location = useLocation();

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const refreshNetwork = async () => {
    if (!window.ethereum) return;
    const chainId = Number.parseInt(await window.ethereum.request({ method: 'eth_chainId' }), 16);
    const knownNetworks = {
      1337: { name: 'Hardhat Local', rpcUrl: 'http://127.0.0.1:8545' },
      11155111: { name: 'Sepolia Testnet', rpcUrl: 'https://sepolia.etherscan.io' },
    };
    setNetwork({ chainId, ...(knownNetworks[chainId] || { name: `Chain ${chainId}`, rpcUrl: '' }) });
  };

  useEffect(() => {
    refreshNetwork();
    if (!window.ethereum) return undefined;
    window.ethereum.on('chainChanged', refreshNetwork);
    return () => window.ethereum.removeListener('chainChanged', refreshNetwork);
  }, []);

  useEffect(() => {
    if (!window.ethereum) return undefined;
    const handleAccountsChanged = (accounts) => {
      setAccount(accounts[0] || null);
      setIsConnected(accounts.length > 0);
    };
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    return () => window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
  }, [setAccount, setIsConnected]);

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

      const toggleFullscreen = async () => {
        try {
          if (document.fullscreenElement) {
            await document.exitFullscreen();
          } else {
            await document.documentElement.requestFullscreen();
          }
        } catch (error) {
          window.dispatchEvent(new CustomEvent('proofmark:toast', { detail: 'Fullscreen is not available in this browser' }));
        }
      };
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
      try {
        await window.ethereum.request({
          method: 'wallet_requestPermissions',
          params: [{ eth_accounts: {} }],
        });
      } catch (permissionError) {
        if (permissionError.code === 4001) return;
        // Older wallet versions may not support wallet_requestPermissions.
      }
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
      setIsConnected(true);
    } catch (error) {
      console.error('Wallet connection failed:', error);
    }
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
          <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setMenuOpen(false)}><span>01</span>Overview</NavLink>
          <NavLink to="/verify" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setMenuOpen(false)}><span>02</span>Verify</NavLink>
          <NavLink to="/register" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setMenuOpen(false)}><span>03</span>Register</NavLink>
          <NavLink to="/blockchain-details" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setMenuOpen(false)}><span>04</span>Ledger</NavLink>
        </nav>

        <div className="header-actions">
          <div className="header-badges">
            <span className="network-status"><i /><span><small>NETWORK</small>{network.name}</span></span>
            <span className="status-pill-inline">Demo mode</span>
          </div>
          {isConnected ? (
            <button className="wallet-chip" type="button" onClick={connectWallet} title="Switch MetaMask account">
              <i /><span><small>CONNECTED / {balance === null ? '--' : `${balance} ETH`}</small>{shortenAddress(account)}</span>
            </button>
          ) : (
            <button className="connect-button" type="button" onClick={connectWallet}><span>+</span> Connect wallet</button>
          )}
          <button className="theme-toggle" type="button" onClick={() => setDarkMode(!darkMode)} title="Toggle theme" aria-label="Toggle theme">
            {darkMode ? '☼' : '◐'}
          </button>
          <button
            className="fullscreen-toggle"
            type="button"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit fullscreen' : 'Open fullscreen'}
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Open fullscreen'}
          >
            {isFullscreen ? '×' : '⛶'}
          </button>
        </div>
      </header>

      <div className="page-context">
        <span>{location.pathname === '/' ? 'CONTROL CENTER' : location.pathname.slice(1).replace('-', ' ').toUpperCase()}</span>
        <span className="context-line" />
        <span>{network.name.toUpperCase()} / {network.chainId}</span>
        <button className="context-copy" type="button" onClick={() => copyText(network.rpcUrl)} title="Copy network endpoint">COPY NETWORK</button>
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
