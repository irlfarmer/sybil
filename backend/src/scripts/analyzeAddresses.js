const addressAnalysisService = require('../services/addressAnalysis.service');
const Debug = require('../utils/debug');
const path = require('path');
const fs = require('fs').promises;

async function main() {
  const projectRoot = path.resolve(__dirname, '../../..');
  const filePath = path.join(projectRoot, 'aidrop_list', 'uniswap.txt');
  
  Debug.log('Reading from file path:', filePath);

  try {
    // Check if file exists
    await fs.access(filePath);
    await addressAnalysisService.analyzeAddressFile(filePath);
  } catch (error) {
    if (error.code === 'ENOENT') {
      Debug.log('File not found:', filePath);
    } else {
      Debug.log('Error running address analysis:', error);
    }
    process.exit(1);
  }
}

main();