require('dotenv').config();
const axios = require('axios');
const Debug = require('../utils/debug');

/**
 * Service to handle Etherscan API interactions
 */
class EtherscanService {
  constructor() {
    this.apiKey = process.env.ETHERSCAN_API_KEY;
    this.baseUrl = 'https://api.etherscan.io/api';
    this.lastRequestTime = 0;
    this.minRequestInterval = 250; // 250ms between requests to stay under rate limit
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second delay between retries
    
    Debug.log('EtherscanService initialized with:', {
      baseUrl: this.baseUrl,
      apiKeyLength: this.apiKey?.length || 0
    });
  }

  async makeRequest(params, retryCount = 0) {
    try {
      // Ensure minimum time between requests
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;
      if (timeSinceLastRequest < this.minRequestInterval) {
        await new Promise(resolve => 
          setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest)
        );
      }

      this.lastRequestTime = Date.now();
      const response = await axios.get(this.baseUrl, { params });

      // Check for rate limit error
      if (response.data.status === '0' && 
          response.data.message === 'NOTOK' && 
          response.data.result?.includes('rate limit')) {
        if (retryCount < this.maxRetries) {
          Debug.log('Rate limit hit, retrying after delay...', {
            retryCount: retryCount + 1,
            delay: this.retryDelay
          });
          await new Promise(resolve => setTimeout(resolve, this.retryDelay));
          return this.makeRequest(params, retryCount + 1);
        }
      }

      return response;
    } catch (error) {
      if (retryCount < this.maxRetries) {
        Debug.log('Request failed, retrying...', {
          error: error.message,
          retryCount: retryCount + 1
        });
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        return this.makeRequest(params, retryCount + 1);
      }
      throw error;
    }
  }

  /**
   * Fetch transaction history for an address
   * @param {string} address - Wallet address to analyze
   * @returns {Promise<Array>} - Transaction history
   */
  async getTransactionHistory(address) {
    try {
      Debug.log('Fetching transactions for address:', address);
      
      const params = {
        module: 'account',
        action: 'txlist',
        address: address,
        apikey: this.apiKey
      };

      if (process.env.DISPLAY_LINKS === 'true') {
        const url = `${this.baseUrl}?${new URLSearchParams(params)}`;
        Debug.log('API URL:', url);
      }

      const response = await this.makeRequest(params);

      if (response.data.status === '1') {
        Debug.log('Successfully fetched transactions:', {
          count: response.data.result.length
        });
        return response.data.result;
      }
      throw new Error(`Failed to fetch transaction data: ${response.data.message || 'Unknown error'}`);
    } catch (error) {
      Debug.log('Etherscan API error:', {
        message: error.message,
        response: error.response?.data
      });
      throw error;
    }
  }

  /**
   * Fetch internal transaction history for an address
   * @param {string} address - Wallet address to analyze
   * @returns {Promise<Array>} - Internal transaction history
   */
  async getInternalTransactionHistory(address) {
    try {
      Debug.log('Fetching internal transactions for address:', address);
      
      const params = {
        module: 'account',
        action: 'txlistinternal',
        address: address,
        startblock: 0,
        endblock: 99999999,
        sort: 'asc',
        apikey: this.apiKey
      };

      if (process.env.DISPLAY_LINKS === 'true') {
        const url = `${this.baseUrl}?${new URLSearchParams(params)}`;
        Debug.log('API URL:', url);
      }

      const response = await this.makeRequest(params);

      if (response.data.status === '1') {
        Debug.log('Successfully fetched internal transactions:', {
          count: response.data.result.length
        });
        return response.data.result;
      }
      throw new Error(`Failed to fetch internal transaction data: ${response.data.message || 'Unknown error'}`);
    } catch (error) {
      Debug.log('Etherscan API error:', {
        message: error.message,
        response: error.response?.data
      });
      throw error;
    }
  }

  /**
   * Fetch the first transaction for an address to identify the funder
   * @param {string} address - Wallet address to analyze
   * @returns {Promise<Object>} - First transaction
   */
  async getFirstTransaction(address) {
    try {
      Debug.log('Fetching first transaction for address:', address);
      
      const params = {
        module: 'account',
        action: 'txlist',
        address: address,
        startblock: 0,
        endblock: 99999999,
        sort: 'asc',
        page: 1,
        offset: 1,
        apikey: this.apiKey
      };

      if (process.env.DISPLAY_LINKS === 'true') {
        const url = `${this.baseUrl}?${new URLSearchParams(params)}`;
        Debug.log('API URL:', url);
      }

      const response = await this.makeRequest(params);

      if (response.data.status === '1' && response.data.result.length > 0) {
        Debug.log('Successfully fetched first transaction:', response.data.result[0]);
        return response.data.result[0];
      }
      throw new Error(`Failed to fetch first transaction: ${response.data.message || 'No transactions found'}`);
    } catch (error) {
      Debug.log('Etherscan API error:', {
        message: error.message,
        response: error.response?.data
      });
      throw error;
    }
  }

  /**
   * Get block number for a specific timestamp
   * @param {number} timestamp - Unix timestamp
   * @returns {Promise<number>} - Block number
   */
  async getBlockNumberByTime(timestamp) {
    try {
      Debug.log('Getting block number for timestamp:', timestamp);
      
      const params = {
        module: 'block',
        action: 'getblocknobytime',
        timestamp: Math.floor(timestamp),
        closest: 'before',
        apikey: this.apiKey
      };

      if (process.env.DISPLAY_LINKS === 'true') {
        const url = `${this.baseUrl}?${new URLSearchParams(params)}`;
        Debug.log('API URL:', url);
      }

      const response = await this.makeRequest(params);

      Debug.log('Block number API response:', {
        status: response.data.status,
        message: response.data.message,
        result: response.data.result
      });

      if (response.data.status === '1' && response.data.result) {
        const blockNumber = parseInt(response.data.result);
        Debug.log('Successfully got block number:', blockNumber);
        return blockNumber;
      }

      throw new Error(`Failed to fetch block number: ${response.data.message || 'Unknown error'}`);
    } catch (error) {
      Debug.log('Error fetching block number:', {
        message: error.message,
        response: error.response?.data
      });
      throw error;
    }
  }

  /**
   * Fetch transactions for an address within a specific time window
   * @param {string} address - Address to query
   * @param {Date} startTime - Start of time window
   * @param {Date} endTime - End of time window
   * @returns {Promise<Array>} - Transactions within time window
   */
  async getTransactionsInTimeRange(address, startTime, endTime) {
    try {
      Debug.log('Fetching transactions in time range:', {
        address,
        startTime,
        endTime
      });

      // Convert dates to Unix timestamps
      const startTimestamp = Math.floor(startTime.getTime() / 1000);
      const endTimestamp = Math.floor(endTime.getTime() / 1000);

      Debug.log('Converted timestamps:', {
        startTimestamp,
        endTimestamp
      });

      // Get block numbers for start and end times
      const startBlock = await this.getBlockNumberByTime(startTimestamp);
      await new Promise(resolve => setTimeout(resolve, this.minRequestInterval));
      const endBlock = await this.getBlockNumberByTime(endTimestamp);

      Debug.log('Retrieved block numbers:', {
        startBlock,
        endBlock
      });

      const params = {
        module: 'account',
        action: 'txlist',
        address: address,
        startblock: startBlock,
        endblock: endBlock,
        sort: 'asc',
        apikey: this.apiKey
      };

      if (process.env.DISPLAY_LINKS === 'true') {
        const url = `${this.baseUrl}?${new URLSearchParams(params)}`;
        Debug.log('API URL:', url);
      }

      const response = await this.makeRequest(params);

      if (response.data.status === '1') {
        const transactions = response.data.result;
        Debug.log('Successfully fetched transactions:', {
          count: transactions.length
        });
        return transactions;
      }
      
      throw new Error(`Failed to fetch transactions: ${response.data.message || 'Unknown error'}`);
    } catch (error) {
      Debug.log('Error fetching transactions:', {
        message: error.message,
        response: error.response?.data
      });
      throw error;
    }
  }

  /**
   * Fetch internal transactions for an address within a specific time window
   * @param {string} address - Address to query
   * @param {Date} startTime - Start of time window
   * @param {Date} endTime - End of time window
   * @returns {Promise<Array>} - Internal transactions within time window
   */
  async getInternalTransactionsInTimeRange(address, startTime, endTime) {
    try {
      Debug.log('Fetching internal transactions in time range:', {
        address,
        startTime,
        endTime
      });

      // Convert dates to Unix timestamps
      const startTimestamp = Math.floor(startTime.getTime() / 1000);
      const endTimestamp = Math.floor(endTime.getTime() / 1000);

      Debug.log('Converted timestamps:', {
        startTimestamp,
        endTimestamp
      });

      // Get block numbers for start and end times
      const startBlock = await this.getBlockNumberByTime(startTimestamp);
      await new Promise(resolve => setTimeout(resolve, this.minRequestInterval));
      const endBlock = await this.getBlockNumberByTime(endTimestamp);

      Debug.log('Retrieved block numbers:', {
        startBlock,
        endBlock
      });

      const params = {
        module: 'account',
        action: 'txlistinternal',
        address: address,
        startblock: startBlock,
        endblock: endBlock,
        sort: 'asc',
        apikey: this.apiKey
      };

      if (process.env.DISPLAY_LINKS === 'true') {
        const url = `${this.baseUrl}?${new URLSearchParams(params)}`;
        Debug.log('API URL:', url);
      }

      const response = await this.makeRequest(params);

      if (response.data.status === '1') {
        const transactions = response.data.result;
        Debug.log('Successfully fetched internal transactions:', {
          count: transactions.length
        });
        return transactions;
      }
      
      throw new Error(`Failed to fetch internal transactions: ${response.data.message || 'Unknown error'}`);
    } catch (error) {
      Debug.log('Error fetching internal transactions:', {
        message: error.message,
        response: error.response?.data
      });
      throw error;
    }
  }

  /**
   * Fetch ERC20 token transfers for an address
   * @param {string} address - Wallet address
   * @returns {Promise<Array>} - Token transfers
   */
  async getTokenTransfers(address) {
    try {
      Debug.log('Fetching token transfers for address:', address);
      
      const params = {
        module: 'account',
        action: 'tokentx',
        address: address,
        startblock: 0,
        endblock: 99999999,
        sort: 'asc',
        apikey: this.apiKey
      };

      const response = await this.makeRequest(params);

      if (response.data.status === '1') {
        Debug.log('Successfully fetched token transfers:', {
          count: response.data.result.length
        });
        return response.data.result;
      }
      throw new Error(`Failed to fetch token transfers: ${response.data.message || 'Unknown error'}`);
    } catch (error) {
      Debug.log('Error fetching token transfers:', error);
      throw error;
    }
  }

  /**
   * Fetch ERC721 (NFT) transfers for an address
   * @param {string} address - Wallet address
   * @returns {Promise<Array>} - NFT transfers
   */
  async getNFTTransfers(address) {
    try {
      Debug.log('Fetching NFT transfers for address:', address);
      
      const params = {
        module: 'account',
        action: 'tokennfttx',
        address: address,
        startblock: 0,
        endblock: 99999999,
        sort: 'asc',
        apikey: this.apiKey
      };

      const response = await this.makeRequest(params);

      if (response.data.status === '1') {
        Debug.log('Successfully fetched NFT transfers:', {
          count: response.data.result.length
        });
        return response.data.result;
      }
      throw new Error(`Failed to fetch NFT transfers: ${response.data.message || 'Unknown error'}`);
    } catch (error) {
      Debug.log('Error fetching NFT transfers:', error);
      throw error;
    }
  }

  /**
   * Fetch token transfers in time range
   * @param {string} address - Address to query
   * @param {Date} startTime - Start of time window
   * @param {Date} endTime - End of time window
   * @returns {Promise<Array>} - Token transfers within time window
   */
  async getTokenTransfersInTimeRange(address, startTime, endTime) {
    try {
      const startBlock = await this.getBlockNumberByTime(Math.floor(startTime.getTime() / 1000));
      await new Promise(resolve => setTimeout(resolve, this.minRequestInterval));
      const endBlock = await this.getBlockNumberByTime(Math.floor(endTime.getTime() / 1000));

      const params = {
        module: 'account',
        action: 'tokentx',
        address: address,
        startblock: startBlock,
        endblock: endBlock,
        sort: 'asc',
        apikey: this.apiKey
      };

      const response = await this.makeRequest(params);

      if (response.data.status === '1') {
        return response.data.result;
      }
      throw new Error(`Failed to fetch token transfers in range: ${response.data.message}`);
    } catch (error) {
      Debug.log('Error fetching token transfers in range:', error);
      throw error;
    }
  }

  /**
   * Fetch NFT transfers in time range
   * @param {string} address - Address to query
   * @param {Date} startTime - Start of time window
   * @param {Date} endTime - End of time window
   * @returns {Promise<Array>} - NFT transfers within time window
   */
  async getNFTTransfersInTimeRange(address, startTime, endTime) {
    try {
      const startBlock = await this.getBlockNumberByTime(Math.floor(startTime.getTime() / 1000));
      await new Promise(resolve => setTimeout(resolve, this.minRequestInterval));
      const endBlock = await this.getBlockNumberByTime(Math.floor(endTime.getTime() / 1000));

      const params = {
        module: 'account',
        action: 'tokennfttx',
        address: address,
        startblock: startBlock,
        endblock: endBlock,
        sort: 'asc',
        apikey: this.apiKey
      };

      const response = await this.makeRequest(params);

      if (response.data.status === '1') {
        return response.data.result;
      }
      throw new Error(`Failed to fetch NFT transfers in range: ${response.data.message}`);
    } catch (error) {
      Debug.log('Error fetching NFT transfers in range:', error);
      throw error;
    }
  }
}

module.exports = new EtherscanService();