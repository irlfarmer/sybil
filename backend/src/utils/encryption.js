const forge = require('node-forge');
const fs = require('fs');
const path = require('path');
const Debug = require('./debug');

class EncryptionService {
  constructor() {
    try {
      const privateKeyPath = path.resolve(__dirname, '..', '..', process.env.PRIVATE_KEY_PATH);
      const publicKeyPath = path.resolve(__dirname, '..', '..', process.env.PUBLIC_KEY_PATH);

      this.privateKey = fs.readFileSync(privateKeyPath, 'utf8');
      this.publicKey = fs.readFileSync(publicKeyPath, 'utf8');

      Debug.log('Encryption service initialized', {
        privateKeyExists: !!this.privateKey,
        publicKeyExists: !!this.publicKey
      });
    } catch (error) {
      Debug.log('Error loading keys:', error);
      throw new Error('Failed to load encryption keys');
    }
  }

  /**
   * Encrypts data using the public key
   * @param {any} data - Data to encrypt
   * @returns {string} - Encrypted data in base64 format
   */
  encryptResponse(data) {
    try {
      Debug.log('Starting encryption for data:', { dataSize: JSON.stringify(data).length });

      // Convert data to JSON string
      const jsonString = JSON.stringify(data);
      
      // Create RSA public key
      const publicKey = forge.pki.publicKeyFromPem(this.publicKey);
      
      // Split data into chunks if necessary (RSA has size limitations)
      const maxLength = 245; // Maximum size for RSA-2048
      const chunks = [];
      
      for (let i = 0; i < jsonString.length; i += maxLength) {
        const chunk = jsonString.slice(i, i + maxLength);
        const encrypted = publicKey.encrypt(chunk);
        chunks.push(forge.util.encode64(encrypted));
      }

      Debug.log('Encryption successful', { 
        chunks: chunks.length,
        totalSize: chunks.join('').length 
      });

      // Join chunks with a delimiter
      return chunks.join('|');

    } catch (error) {
      Debug.log('Encryption error:', {
        error: error.message,
        stack: error.stack
      });
      throw new Error('Encryption failed: ' + error.message);
    }
  }

  /**
   * Decrypts data using the private key
   * @param {string} encryptedData - Encrypted data in base64 format
   * @returns {any} - Decrypted data
   */
  decryptResponse(encryptedData) {
    try {
      // Split the chunks
      const chunks = encryptedData.split('|');
      const privateKey = forge.pki.privateKeyFromPem(this.privateKey);
      
      // Decrypt each chunk
      const decryptedChunks = chunks.map(chunk => {
        const buffer = forge.util.decode64(chunk);
        return privateKey.decrypt(buffer);
      });

      // Join chunks and parse JSON
      const jsonString = decryptedChunks.join('');
      return JSON.parse(jsonString);

    } catch (error) {
      Debug.log('Decryption error:', error);
      throw new Error('Decryption failed');
    }
  }
}

module.exports = new EncryptionService(); 