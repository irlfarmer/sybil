import React, { useState } from 'react';
import Debug from '../utils/debug';

function TokenLookup({ contract }) {
  const [tokenId, setTokenId] = useState('');
  const [tokenData, setTokenData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const lookupToken = async () => {
    try {
      if (!contract) {
        throw new Error('Contract not initialized');
      }

      setLoading(true);
      setError(null);
      setTokenData(null);

      Debug.log('Looking up token:', tokenId);

      // First check if token exists
      try {
        const owner = await contract.ownerOf(tokenId);
        Debug.log('Token owner:', owner);

        // Get token type first
        const tokenType = await contract.getTokenType(tokenId);
        const tokenScore = await contract.getTokenScore(tokenId);
        
        let tokenDetails = {
          id: tokenId,
          owner,
          type: ['HUMANITY', 'CLUSTER', 'SYBIL'][Number(tokenType)],
          score: tokenScore.toString()
        };

        // Only try to get contract address if it's a Sybil token
        if (Number(tokenType) === 2) {
          try {
            const contractAddress = await contract.getTokenContract(tokenId);
            tokenDetails.contractAddress = contractAddress;
          } catch (err) {
            Debug.error('Error getting contract address:', err);
          }
        }

        setTokenData(tokenDetails);
        Debug.log('Token data:', tokenDetails);

      } catch (e) {
        if (e.code === 'CALL_EXCEPTION') {
          throw new Error('Token does not exist');
        }
        throw e;
      }
    } catch (error) {
      Debug.error('Token lookup error:', error);
      setError(error.message || 'Failed to lookup token');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="token-lookup">
      <h2>Look up SBT</h2>
      <div className="lookup-form">
        <input
          type="number"
          value={tokenId}
          onChange={(e) => setTokenId(e.target.value)}
          placeholder="Enter Token ID"
        />
        <button onClick={lookupToken} disabled={loading || !tokenId}>
          {loading ? 'Looking up...' : 'Look up'}
        </button>
      </div>

      {error && <div className="error">{error}</div>}
      
      {tokenData && (
        <div className="token-details">
          <h3>{tokenData.type} SBT</h3>
          <p>Owner: {tokenData.owner.slice(0, 6)}...{tokenData.owner.slice(-4)}</p>
          <p>Token ID: {tokenData.id}</p>
          <p>Score: {tokenData.score}</p>
          {tokenData.type === 'SYBIL' && tokenData.contractAddress && (
            <p>Contract: {tokenData.contractAddress.slice(0, 6)}...{tokenData.contractAddress.slice(-4)}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default TokenLookup; 