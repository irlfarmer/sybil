const etherscanService = require('./etherscan.service');
const Debug = require('../utils/debug');

class SybilActivityService {
  constructor() {
    this.timeWindowMinutes = 15; // ±15 minutes window
    this.retryAttempts = 3;
    this.retryDelay = 1000;
  }

  async analyzeSybilActivity(walletAddress, contractAddress) {
    try {
      Debug.log('Starting Sybil analysis for:', {
        wallet: walletAddress,
        contract: contractAddress
      });

      // Get all types of transactions
      const [
        externalTxs, 
        internalTxs,
        tokenTxs,
        nftTxs
      ] = await Promise.all([
        etherscanService.getTransactionHistory(walletAddress),
        etherscanService.getInternalTransactionHistory(walletAddress),
        etherscanService.getTokenTransfers(walletAddress),
        etherscanService.getNFTTransfers(walletAddress)
      ]);

      // Filter transactions related to the target contract
      const filteredEthTxs = this.filterContractTransactions(externalTxs, contractAddress);
      const filteredInternalTxs = this.filterContractTransactions(internalTxs, contractAddress);
      const filteredTokenTxs = this.filterTokenTransactions(tokenTxs, contractAddress);
      const filteredNFTTxs = this.filterNFTTransactions(nftTxs, contractAddress);

      const contractTxs = [
        ...filteredEthTxs,
        ...filteredInternalTxs,
        ...filteredTokenTxs,
        ...filteredNFTTxs
      ].sort((a, b) => a.timeStamp - b.timeStamp);

      if (contractTxs.length === 0) {
        Debug.log('No contract interactions found');
        return this.createResponse(walletAddress, contractAddress, 0, 0);
      }

      Debug.log('Found contract interactions:', {
        total: contractTxs.length,
        eth: filteredEthTxs.length + filteredInternalTxs.length,
        tokens: filteredTokenTxs.length,
        nfts: filteredNFTTxs.length
      });

      // Analyze patterns
      const sybilPatterns = await this.analyzeSybilPatterns(contractTxs, walletAddress, contractAddress);
      
      // Calculate scores
      const occurrenceScore = this.calculateOccurrenceScore(sybilPatterns.length);
      const coordinationScore = this.calculateCoordinationScore(sybilPatterns);
      const sybilScore = Math.min(occurrenceScore + coordinationScore, 100);

      Debug.log('Analysis complete:', {
        patterns: sybilPatterns.length,
        occurrenceScore,
        coordinationScore,
        sybilScore
      });

      return this.createResponse(walletAddress, contractAddress, sybilScore, sybilPatterns.length);
    } catch (error) {
      Debug.log('Sybil analysis error:', error);
      throw new Error('Failed to analyze Sybil activity');
    }
  }

  filterContractTransactions(txs, contractAddress) {
    if (!Array.isArray(txs)) return [];
    return txs.filter(tx => 
      tx.to?.toLowerCase() === contractAddress.toLowerCase() || 
      tx.from?.toLowerCase() === contractAddress.toLowerCase()
    );
  }

  filterTokenTransactions(txs, contractAddress) {
    if (!Array.isArray(txs)) return [];
    return txs.filter(tx => 
      tx.contractAddress?.toLowerCase() === contractAddress.toLowerCase() ||
      tx.to?.toLowerCase() === contractAddress.toLowerCase() || 
      tx.from?.toLowerCase() === contractAddress.toLowerCase()
    ).map(tx => ({
      ...tx,
      isToken: true,
      tokenSymbol: tx.tokenSymbol,
      tokenDecimal: tx.tokenDecimal
    }));
  }

  filterNFTTransactions(txs, contractAddress) {
    if (!Array.isArray(txs)) return [];
    return txs.filter(tx => 
      tx.contractAddress?.toLowerCase() === contractAddress.toLowerCase() ||
      tx.to?.toLowerCase() === contractAddress.toLowerCase() || 
      tx.from?.toLowerCase() === contractAddress.toLowerCase()
    ).map(tx => ({
      ...tx,
      isNFT: true,
      tokenID: tx.tokenID,
      tokenName: tx.tokenName
    }));
  }

  async analyzeSybilPatterns(transactions, walletAddress, contractAddress) {
    const sybilPatterns = [];
    const processedPatterns = new Set();

    for (const tx of transactions) {
      try {
        const txTime = new Date(tx.timeStamp * 1000);
        const windowStart = new Date(txTime.getTime() - this.timeWindowMinutes * 60 * 1000);
        const windowEnd = new Date(txTime.getTime() + this.timeWindowMinutes * 60 * 1000);
        
        // Create unique pattern identifier
        const patternKey = this.createPatternKey(tx);
        if (processedPatterns.has(patternKey)) continue;
        processedPatterns.add(patternKey);

        Debug.log('Analyzing transaction window:', {
          type: this.getTransactionType(tx),
          time: txTime,
          windowStart,
          windowEnd,
          value: tx.value || tx.tokenID || tx.amount
        });

        // Add delay between windows
        if (sybilPatterns.length > 0) {
          await new Promise(resolve => setTimeout(resolve, 250));
        }

        // Get all types of transactions in time window
        const [windowTxs, windowTokenTxs, windowNFTTxs] = await Promise.all([
          etherscanService.getTransactionsInTimeRange(contractAddress, windowStart, windowEnd),
          etherscanService.getTokenTransfersInTimeRange(contractAddress, windowStart, windowEnd),
          etherscanService.getNFTTransfersInTimeRange(contractAddress, windowStart, windowEnd)
        ]);

        // Find similar patterns based on transaction type
        const similarPatterns = this.findSimilarPatterns(
          tx,
          [...windowTxs, ...windowTokenTxs, ...windowNFTTxs],
          walletAddress
        );

        Debug.log('Found similar transactions:', {
          type: this.getTransactionType(tx),
          count: similarPatterns.length
        });

        if (similarPatterns.length > 0) {
          sybilPatterns.push({
            timestamp: txTime,
            type: this.getTransactionType(tx),
            value: tx.value || tx.tokenID || tx.amount,
            direction: tx.to.toLowerCase() === contractAddress.toLowerCase() ? 'send' : 'receive',
            similarWallets: similarPatterns.map(p => 
              p.to.toLowerCase() === contractAddress.toLowerCase() ? p.from : p.to
            )
          });
        }
      } catch (error) {
        Debug.log('Error analyzing transaction window:', {
          error: error.message,
          transaction: tx
        });
        continue;
      }
    }

    return sybilPatterns;
  }

  createPatternKey(tx) {
    if (tx.isNFT) {
      return `nft_${tx.timeStamp}_${tx.tokenID}`;
    }
    if (tx.isToken) {
      return `token_${tx.timeStamp}_${tx.value}_${tx.contractAddress}`;
    }
    return `eth_${tx.timeStamp}_${tx.value}`;
  }

  getTransactionType(tx) {
    if (tx.isNFT) return 'NFT';
    if (tx.isToken) return 'TOKEN';
    return 'ETH';
  }

  findSimilarPatterns(tx, windowTxs, walletAddress) {
    return windowTxs.filter(wtx => {
      // Skip the original transaction
      if (wtx.hash === tx.hash) return false;
      
      // Skip transactions from/to the analyzed wallet
      if (wtx.from.toLowerCase() === walletAddress.toLowerCase() || 
          wtx.to.toLowerCase() === walletAddress.toLowerCase()) return false;

      // Match based on transaction type
      if (tx.isNFT) {
        return wtx.isNFT && wtx.tokenID === tx.tokenID;
      }
      if (tx.isToken) {
        return wtx.isToken && 
               wtx.contractAddress === tx.contractAddress && 
               wtx.value === tx.value;
      }
      return wtx.value === tx.value;
    });
  }

  calculateOccurrenceScore(occurrences) {
    if (occurrences <= 1) return 0;
    if (occurrences <= 3) return 50;
    if (occurrences <= 6) return 75;
    return 100;
  }

  calculateCoordinationScore(patterns) {
    // Count repeated wallet sets
    const walletSets = patterns.map(p => new Set(p.similarWallets));
    let repeatedSets = 0;

    for (let i = 0; i < walletSets.length; i++) {
      for (let j = i + 1; j < walletSets.length; j++) {
        if (this.areSetsEqual(walletSets[i], walletSets[j])) {
          repeatedSets++;
          break;
        }
      }
    }

    return Math.min(repeatedSets * 10, 100);
  }

  areSetsEqual(setA, setB) {
    if (setA.size !== setB.size) return false;
    for (const a of setA) if (!setB.has(a)) return false;
    return true;
  }

  createResponse(walletAddress, contractAddress, sybilScore, occurrences) {
    return {
      metadata: {
        address: walletAddress,
        contractAddress: contractAddress,
        metrics: {
          occurrences: {
            value: occurrences,
            score: this.calculateOccurrenceScore(occurrences)
          },
          coordination: {
            value: sybilScore > this.calculateOccurrenceScore(occurrences),
            score: sybilScore - this.calculateOccurrenceScore(occurrences)
          }
        },
        timestamp: new Date().toISOString()
      },
      sybilScore: sybilScore
    };
  }
}

module.exports = new SybilActivityService();