import React, { useState } from 'react';
import DecryptionService from '../utils/decryption';
import Debug from '../utils/debug';

function MintNFT({ contract, account }) {
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState('HUMANITY');
  const [contractAddress, setContractAddress] = useState('');

  const mintNFT = async (type) => {
    try {
      Debug.log('Starting NFT minting process', { type, account });
      setLoading(true);
      
      if (!contract) {
        throw new Error('Contract not initialized');
      }

      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      let endpoint;

      switch(type) {
        case 'HUMANITY':
          endpoint = `${backendUrl}/api/humanity-score/${account}`;
          break;
        case 'CLUSTER':
          endpoint = `${backendUrl}/api/cluster-analysis/${account}`;
          break;
        case 'SYBIL':
          if (!contractAddress) {
            alert('Please enter contract address');
            return;
          }
          endpoint = `${backendUrl}/api/sybil-activity/${account}/${contractAddress}`;
          break;
        default:
          throw new Error('Invalid NFT type');
      }

      Debug.log('Fetching data from backend', { endpoint });

      // Get encrypted data from backend
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error('Failed to fetch data from backend');
      }
      const { data: encryptedData } = await response.json();
      
      Debug.log('Received encrypted data', { dataLength: encryptedData.length });

      // Decrypt the data
      const decryptedData = DecryptionService.decryptResponse(encryptedData);
      Debug.log('Decrypted data', decryptedData);

      // Extract score and metadata based on NFT type
      let score, metadata;
      switch(type) {
        case 'HUMANITY':
          score = decryptedData.onchainScore;
          metadata = JSON.stringify(decryptedData.metadata);
          break;
        case 'CLUSTER':
          score = decryptedData.clusterScore;
          metadata = JSON.stringify(decryptedData.metadata);
          break;
        case 'SYBIL':
          score = decryptedData.sybilScore;
          metadata = JSON.stringify(decryptedData.metadata);
          break;
        default:
          throw new Error('Invalid NFT type');
      }

      Debug.log('Preparing mint transaction', { score, metadataLength: metadata.length });

      // Now mint the NFT with decrypted data
      let tx;
      switch(type) {
        case 'HUMANITY':
          tx = await contract.mintHumanityNFT(score, metadata);
          break;
        case 'CLUSTER':
          tx = await contract.mintClusterNFT(score, metadata);
          break;
        case 'SYBIL':
          tx = await contract.mintSybilNFT(score, metadata, contractAddress);
          break;
        default:
          throw new Error('Invalid NFT type');
      }

      Debug.log('Transaction submitted', { hash: tx.hash });

      await tx.wait();
      Debug.log('Transaction confirmed');
      
      alert('NFT minted successfully!');
    } catch (error) {
      Debug.error('Minting process failed', error);
      
      // Check for specific error types
      const errorMessage = error.reason || error.data?.message || error.message || 'Unknown error';
      
      if (errorMessage.includes('CALL_EXCEPTION')) {
        switch(selectedType) {
          case 'HUMANITY':
            alert('You have already minted a Humanity SBT');
            break;
          case 'CLUSTER':
            alert('You have already minted a Cluster SBT');
            break;
          case 'SYBIL':
            alert('You have already minted an SBT for this contract address');
            break;
          default:
            alert('Failed to mint NFT: Invalid token type');
        }
      } else if (errorMessage.includes('UNCONFIGURED_NAME')) {
        alert('Invalid contract address format');
      } else {
        alert(`Failed to mint NFT: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
      Debug.log('Minting process completed');
    }
  };

  return (
    <div className="mint-nft">
      <h2>Mint New SBT</h2>
      <select 
        value={selectedType} 
        onChange={(e) => setSelectedType(e.target.value)}
      >
        <option value="HUMANITY">Humanity Score</option>
        <option value="CLUSTER">Cluster Analysis</option>
        <option value="SYBIL">Sybil Activity</option>
      </select>

      {selectedType === 'SYBIL' && (
        <input
          type="text"
          placeholder="Contract Address"
          value={contractAddress}
          onChange={(e) => setContractAddress(e.target.value)}
        />
      )}

      <button 
        onClick={() => mintNFT(selectedType)} 
        disabled={loading}
      >
        {loading ? 'Minting...' : 'Mint SBT'}
      </button>
    </div>
  );
}

export default MintNFT;