const express = require('express');
const router = express.Router();
const encryptionService = require('../utils/encryption');
const humanityScoreService = require('../services/humanityScore.service');
const clusterAnalysisService = require('../services/clusterAnalysis.service');
const sybilActivityService = require('../services/sybilActivity.service');
const Debug = require('../utils/debug');

/**
 * Validate wallet address middleware
 */
const validateWalletAddress = (req, res, next) => {
  const walletAddress = req.params.walletAddress;
  // Basic Ethereum address validation
  if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
    return res.status(400).json({ error: 'Invalid wallet address' });
  }
  next();
};

// Empty response templates
const emptyResponses = {
  humanity: (address) => ({
    metadata: {
      address,
      metrics: {
        activeDays: { value: 0, score: 0 },
        longestStreak: { value: 0, score: 0 },
        currentStreak: { value: 0, score: 0 },
        activityPeriod: { value: 0, score: 0 },
        bridgeInteractions: { value: 0, score: 0 },
        lendingInteractions: { value: 0, score: 0 },
        ensInteractions: { value: 0, score: 0 },
        contractDeployments: { value: 0, score: 0 }
      },
      timestamp: new Date().toISOString()
    },
    onchainScore: 0
  }),

  cluster: (address) => ({
    metadata: {
      address,
      metrics: {
        fundingSource: {
          value: 'unknown',
          score: 0
        },
        clusterSize: {
          value: 0,
          score: 0
        }
      },
      timestamp: new Date().toISOString()
    },
    clusterScore: 0
  }),

  sybil: (address, contractAddress) => ({
    metadata: {
      address,
      contractAddress,
      metrics: {
        occurrences: {
          value: 0,
          score: 0
        },
        coordination: {
          value: false,
          score: 0
        }
      },
      timestamp: new Date().toISOString()
    },
    sybilScore: 0
  })
};

// Error handler helper
const handleError = (error, type, params) => {
  const allowEmpty = process.env.ALLOW_EMPTY_WALLETS === 'true';
  const bypassErrors = process.env.BYPASS_ERRORS === 'true';
  
  if ((allowEmpty && error.message.includes('No transactions found')) || bypassErrors) {
    Debug.log(`Returning empty ${type} response due to configuration`, {
      allowEmpty,
      bypassErrors,
      error: error.message
    });
    return emptyResponses[type](...params);
  }
  throw error;
};

/**
 * @route GET /api/humanity-score/:walletAddress
 * @description Get humanity score for a wallet address
 */
router.get('/humanity-score/:walletAddress', validateWalletAddress, async (req, res) => {
  try {
    Debug.log('Received request for wallet:', req.params.walletAddress);
    const result = await humanityScoreService.calculateHumanityScore(req.params.walletAddress);
    Debug.log('Original result:', result);
    const encryptedResponse = encryptionService.encryptResponse(result);
    res.json({ data: encryptedResponse });
  } catch (error) {
    Debug.error('Humanity score calculation error:', error);
    try {
      const emptyResult = handleError(error, 'humanity', [req.params.walletAddress]);
      const encryptedResponse = encryptionService.encryptResponse(emptyResult);
      res.json({ data: encryptedResponse });
    } catch (e) {
      res.status(500).json({ error: 'Failed to calculate humanity score' });
    }
  }
});

/**
 * @route GET /api/cluster-analysis/:walletAddress
 * @description Get cluster analysis for a wallet address
 */
router.get('/cluster-analysis/:walletAddress', validateWalletAddress, async (req, res) => {
  try {
    Debug.log('Received request for cluster analysis:', req.params.walletAddress);
    const result = await clusterAnalysisService.analyzeCluster(req.params.walletAddress);
    Debug.log('Cluster analysis result:', result);
    const encryptedResponse = encryptionService.encryptResponse(result);
    res.json({ data: encryptedResponse });
  } catch (error) {
    Debug.error('Cluster analysis error:', error);
    try {
      const emptyResult = handleError(error, 'cluster', [req.params.walletAddress]);
      const encryptedResponse = encryptionService.encryptResponse(emptyResult);
      res.json({ data: encryptedResponse });
    } catch (e) {
      res.status(500).json({ error: 'Failed to get cluster analysis' });
    }
  }
});

/**
 * @route GET /api/sybil-activity/:walletAddress/:contractAddress
 * @description Get sybil activity for a wallet and contract address
 */
router.get('/sybil-activity/:walletAddress/:contractAddress', validateWalletAddress, async (req, res) => {
  try {
    Debug.log('Received request for Sybil activity:', {
      wallet: req.params.walletAddress,
      contract: req.params.contractAddress
    });
    const result = await sybilActivityService.analyzeSybilActivity(
      req.params.walletAddress,
      req.params.contractAddress
    );
    Debug.log('Sybil analysis result:', result);
    const encryptedResponse = encryptionService.encryptResponse(result);
    res.json({ data: encryptedResponse });
  } catch (error) {
    Debug.error('Sybil activity analysis error:', error);
    try {
      const emptyResult = handleError(error, 'sybil', [
        req.params.walletAddress,
        req.params.contractAddress
      ]);
      const encryptedResponse = encryptionService.encryptResponse(emptyResult);
      res.json({ data: encryptedResponse });
    } catch (e) {
      res.status(500).json({ error: 'Failed to analyze Sybil activity' });
    }
  }
});

module.exports = router; 