import React, { useState, useEffect } from 'react';
import Debug from '../utils/debug';

function TokenDisplay({ contract, account }) {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        if (!contract || !account) return;

        Debug.log('Fetching tokens for account:', account);
        
        // Get all Transfer events where this account is the recipient
        const filterTo = contract.filters.Transfer(null, account, null);
        const filterFrom = contract.filters.Transfer(account, null, null);
        
        const [eventsTo, eventsFrom] = await Promise.all([
          contract.queryFilter(filterTo),
          contract.queryFilter(filterFrom)
        ]);

        Debug.log('Transfer events to account:', eventsTo.length);
        Debug.log('Transfer events from account:', eventsFrom.length);

        // Create a map of token ownership
        const tokenOwnership = new Map();

        // Process transfers to this account
        eventsTo.forEach(event => {
          tokenOwnership.set(event.args.tokenId.toString(), true);
        });

        // Process transfers from this account
        eventsFrom.forEach(event => {
          tokenOwnership.delete(event.args.tokenId.toString());
        });

        // Get the token IDs currently owned by the account
        const ownedTokenIds = Array.from(tokenOwnership.keys());
        Debug.log('Owned token IDs:', ownedTokenIds);

        // Verify ownership and get details for each token
        const tokenPromises = ownedTokenIds.map(async (tokenId) => {
          try {
            // Verify current ownership
            const currentOwner = await contract.ownerOf(tokenId);
            if (currentOwner.toLowerCase() !== account.toLowerCase()) {
              return null;
            }

            // Get basic token info
            const tokenType = await contract.getTokenType(tokenId);
            const tokenScore = await contract.getTokenScore(tokenId);
            let tokenData = {
              id: tokenId,
              type: ['HUMANITY', 'CLUSTER', 'SYBIL'][Number(tokenType)],
              score: tokenScore.toString()
            };

            // If it's a Sybil token, get the contract address
            if (Number(tokenType) === 2) {
              try {
                const contractAddress = await contract.getTokenContract(tokenId);
                tokenData.contractAddress = contractAddress;
              } catch (err) {
                Debug.error('Error getting contract address:', err);
              }
            }

            return tokenData;
          } catch (err) {
            Debug.error('Error fetching token details:', err, { tokenId });
            return null;
          }
        });

        const fetchedTokens = (await Promise.all(tokenPromises)).filter(token => token !== null);
        Debug.log('Fetched tokens:', fetchedTokens);
        setTokens(fetchedTokens);
        setError(null);
      } catch (error) {
        Debug.error('Error fetching tokens:', error);
        setError('Failed to fetch tokens');
      } finally {
        setLoading(false);
      }
    };

    fetchTokens();
  }, [contract, account]);

  if (loading) return <div>Loading tokens...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="token-display">
      <h2>Your SBTs</h2>
      {tokens.length === 0 ? (
        <p>No tokens found</p>
      ) : (
        <div className="token-grid">
          {tokens.map(token => (
            <div key={token.id} className="token-card">
              <h3>{token.type} SBT</h3>
              <p>Token ID: {token.id}</p>
              <p>Score: {token.score}</p>
              {token.type === 'SYBIL' && token.contractAddress && (
                <p>Contract: {token.contractAddress.slice(0, 6)}...{token.contractAddress.slice(-4)}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TokenDisplay; 