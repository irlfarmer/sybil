const fs = require('fs').promises;
const path = require('path');
const Debug = require('../utils/debug');
const humanityService = require('./humanityScore.service');

class AddressAnalysisService {
  constructor() {
    this.outputDir = path.join(__dirname, '../../output');
    this.outputPath = path.join(this.outputDir, 'analysis_results.csv');
  }

  async ensureOutputDirectory() {
    try {
      await fs.access(this.outputDir);
    } catch {
      Debug.log('Creating output directory:', this.outputDir);
      await fs.mkdir(this.outputDir, { recursive: true });
    }
  }

  async analyzeAddressFile(filePath) {
    try {
      Debug.log('Starting address analysis from file:', filePath);
      await this.ensureOutputDirectory();

      const fileContent = await fs.readFile(filePath, 'utf8');
      const addresses = fileContent.split('\n')
        .map(line => line.trim())
        .filter(line => line && line.startsWith('0x'));

      Debug.log('Found addresses to analyze:', addresses.length);

      // Check if output file exists and create header if it doesn't
      try {
        await fs.access(this.outputPath);
      } catch {
        await fs.writeFile(this.outputPath, 'Address,Humanity Score\n');
      }

      // Read existing results to skip already processed addresses
      const existingContent = await fs.readFile(this.outputPath, 'utf8');
      const processedAddresses = new Set(
        existingContent.split('\n')
          .slice(1) // Skip header
          .map(line => line.split(',')[0])
          .filter(Boolean)
      );

      for (let i = 0; i < addresses.length; i++) {
        const address = addresses[i];
        Debug.log(`Processing address ${i + 1}/${addresses.length}:`, address);

        // Skip if already processed
        if (processedAddresses.has(address)) {
          Debug.log(`Skipping already processed address: ${address}`);
          continue;
        }

        try {
          // Get humanity score
          const humanityResult = await humanityService.calculateHumanityScore(address);
          const humanityScore = humanityResult.onchainScore;

          // Format and append result immediately
          const resultLine = `${address},${humanityScore}\n`;
          await fs.appendFile(this.outputPath, resultLine);

          Debug.log(`Completed analysis for address ${i + 1}:`, {
            address,
            humanityScore
          });

        } catch (error) {
          Debug.log(`Error processing address ${i + 1}:`, {
            address,
            error: error.message
          });
          await fs.appendFile(this.outputPath, `${address},ERROR\n`);
        }

        // Add delay between addresses
        if (i < addresses.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      Debug.log('Analysis complete. Results saved to:', this.outputPath);
    } catch (error) {
      Debug.log('Fatal error during analysis:', error);
      throw error;
    }
  }
}

module.exports = new AddressAnalysisService();