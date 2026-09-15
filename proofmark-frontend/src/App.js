import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import RegisterProduct from './pages/RegisterProduct';
import VerifyProduct from './pages/VerifyProduct';
import BlockchainDetails from './pages/BlockchainDetails';
import AppShell from './components/AppShell';
import './App.css';

/**
 * Main Application Component
 * 
 * Simplified academic project with 4 essential pages:
 * - Home: Landing page and introduction
 * - RegisterProduct: Manufacturer registration flow
 * - VerifyProduct: Product verification flow
 * - BlockchainDetails: View blockchain transaction history
 */
function App() {
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    }
  };

  return (
    <div className="App">
      <AppShell
        account={account}
        setAccount={setAccount}
        isConnected={isConnected}
        setIsConnected={setIsConnected}
      >
      <Routes>
        <Route path="/" element={<Home account={account} setAccount={setAccount} isConnected={isConnected} setIsConnected={setIsConnected} />} />
        <Route path="/register" element={<RegisterProduct account={account} isConnected={isConnected} />} />
        <Route path="/verify" element={<VerifyProduct account={account} />} />
        <Route path="/blockchain-details" element={<BlockchainDetails account={account} />} />
      </Routes>
      </AppShell>
    </div>
  );
}

export default App;
