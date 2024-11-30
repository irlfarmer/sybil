import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './App.css';
import WalletConnect from './components/WalletConnect';
import MintNFT from './components/MintNFT';
import TokenDisplay from './components/TokenDisplay';
import TokenLookup from './components/TokenLookup';

function App() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);

  useEffect(() => {
    const initEthers = async () => {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(provider);
      }
    };
    initEthers();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Soulbound Token Dashboard</h1>
        <WalletConnect 
          account={account} 
          setAccount={setAccount}
          setContract={setContract}
          provider={provider}
        />
      </header>
      <main>
        {account && (
          <>
            <MintNFT contract={contract} account={account} />
            <TokenDisplay contract={contract} account={account} />
            <TokenLookup contract={contract} />
          </>
        )}
      </main>
    </div>
  );
}

export default App; 