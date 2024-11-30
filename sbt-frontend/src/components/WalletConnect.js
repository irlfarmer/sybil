import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import Debug from '../utils/debug';
import contractABI from '../contracts/SoulboundNFTs.json';

function WalletConnect({ account, setAccount, setContract, provider }) {
  const [error, setError] = useState(null);
  const SEPOLIA_CHAIN_ID = '0xaa36a7';
  const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;

  const initContract = useCallback(async (provider) => {
    try {
      Debug.log('Initializing contract with address:', CONTRACT_ADDRESS);
      
      if (!CONTRACT_ADDRESS) {
        throw new Error('Contract address not configured');
      }

      const signer = await provider.getSigner();
      Debug.log('Got signer:', { signer });

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        contractABI,
        signer
      );
      
      Debug.log('Contract initialized:', { 
        address: contract.target,
        hasValidMethods: !!contract.mintHumanityNFT
      });

      setContract(contract);
    } catch (err) {
      Debug.error('Contract initialization error:', err);
      setError(`Failed to initialize contract: ${err.message}`);
    }
  }, [CONTRACT_ADDRESS, setContract]);

  const handleAccountsChanged = useCallback(async (accounts) => {
    if (accounts.length === 0) {
      setAccount(null);
      setContract(null);
      setError('Please connect your wallet');
      localStorage.removeItem('walletConnected');
    } else {
      const newAccount = accounts[0];
      setAccount(newAccount);
      setError(null);
      if (provider) {
        await initContract(provider);
      }
      localStorage.setItem('walletConnected', 'true');
    }
  }, [setAccount, setContract, provider, initContract]);

  const handleChainChanged = useCallback(async (chainId) => {
    if (chainId !== SEPOLIA_CHAIN_ID) {
      setError('Please connect to Sepolia network');
      setAccount(null);
      setContract(null);
    } else {
      setError(null);
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        handleAccountsChanged(accounts);
      }
    }
  }, [SEPOLIA_CHAIN_ID, handleAccountsChanged, setAccount, setContract]);

  const checkConnection = useCallback(async () => {
    try {
      if (window.ethereum && localStorage.getItem('walletConnected') === 'true') {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          if (chainId !== SEPOLIA_CHAIN_ID) {
            setError('Please connect to Sepolia network');
            return;
          }
          handleAccountsChanged(accounts);
        }
      }
    } catch (err) {
      Debug.error('Connection check error:', err);
    }
  }, [SEPOLIA_CHAIN_ID, handleAccountsChanged]);

  useEffect(() => {
    if (provider) {
      checkConnection();
    }
    
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [provider, checkConnection, handleAccountsChanged, handleChainChanged]);

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        setError('Please install MetaMask');
        return;
      }

      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (chainId !== SEPOLIA_CHAIN_ID) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: SEPOLIA_CHAIN_ID }],
          });
        } catch (switchError) {
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: SEPOLIA_CHAIN_ID,
                  chainName: 'Sepolia Test Network',
                  nativeCurrency: {
                    name: 'SepoliaETH',
                    symbol: 'SEP',
                    decimals: 18
                  },
                  rpcUrls: ['https://sepolia.infura.io/v3/'],
                  blockExplorerUrls: ['https://sepolia.etherscan.io']
                }],
              });
            } catch (addError) {
              setError('Failed to add Sepolia network');
              return;
            }
          } else {
            setError('Failed to switch to Sepolia network');
            return;
          }
        }
      }

      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      handleAccountsChanged(accounts);
      
    } catch (err) {
      Debug.error('Wallet connection error:', err);
      setError('Failed to connect wallet');
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setContract(null);
    setError(null);
    localStorage.removeItem('walletConnected');
  };

  return (
    <div className="wallet-connect">
      {error && <div className="error">{error}</div>}
      
      {!account ? (
        <button className="connect-button" onClick={connectWallet}>
          Connect Wallet
        </button>
      ) : (
        <div className="wallet-info">
          <span>Connected: {account.slice(0, 6)}...{account.slice(-4)}</span>
          <button className="disconnect-button" onClick={disconnectWallet}>
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}

export default WalletConnect;