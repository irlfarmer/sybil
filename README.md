# Sybil Defense System

A blockchain-based solution for Sybil resistance that issues Soulbound NFTs based on identity verification through human behavior analysis, cluster analysis, and smart contract interaction patterns.

## Overview

This system helps prevent Sybil attacks in blockchain applications by:
1. Analyzing user behavior to determine human authenticity
2. Performing cluster analysis to detect related accounts
3. Analyzing smart contract interactions to establish behavior patterns
4. Issuing non-transferable Soulbound NFTs to verified identities

## Project Structure 
sybil/
├── backend/ # Node.js backend server
├── sbt-frontend/ # React frontend application
└── contracts/ # Solidity smart contracts

## Tech Stack
- Frontend: React.js
- Backend: Node.js/Express
- Smart Contracts: Solidity
- Blockchain: Ethereum

## Prerequisites
- Node.js >= 14.x
- npm >= 6.x
- MetaMask or similar Web3 wallet
- Hardhat (for smart contract development)

## Installation & Setup

### 1. Clone Repository
ash
git clone 
cd sybil

### 2. Backend Setup
cd backend
npm install

# Create .env file
cp .env.example .env
```

Required environment variables for backend:
```bash
PORT=5000
ETHERSCAN_API_KEY=your_api_key
DEBUG=true
PRIVATE_KEY_PATH="enc_keys/private.pem"
PUBLIC_KEY_PATH="enc_keys/public.pem"
DISPLAY_LINKS=true

# Development Settings
ALLOW_EMPTY_WALLETS=true    # Enable to allow minting for wallets with no transactions
BYPASS_ERRORS=true          # Enable to bypass certain errors during development

# Production Settings
ALLOW_EMPTY_WALLETS=false   # Disable in production
BYPASS_ERRORS=false         # Disable in production
```

Start the backend:
```bash
npm run dev     # Development
npm start       # Production
```

### 3. Frontend Setup
```bash
cd sbt-frontend
npm install
npm start
```

### 4. Smart Contract Setup
```bash
cd contracts
npm install
npx hardhat compile
```

## Features

### Frontend Application
- Web3 wallet connection
- Soulbound NFT minting interface
- NFT viewer for owned tokens
- Search functionality for NFT IDs
- Identity verification status display

### Backend Services
- Identity verification endpoints
- Human behavior analysis
- Cluster analysis for wallet relationships
- Smart contract interaction analysis
- Encrypted data handling

### Smart Contracts
- ERC-721 based Soulbound implementation
- Non-transferable token logic
- Identity verification checks
- Access control mechanisms

## Development vs Production

### Development Mode
- `ALLOW_EMPTY_WALLETS=true`: Enables minting for new or empty wallets
- `BYPASS_ERRORS=true`: Allows testing without complete verification
- Debug logging enabled
- Local blockchain network (Hardhat)

### Production Mode
- `ALLOW_EMPTY_WALLETS=false`: Requires wallet activity for minting
- `BYPASS_ERRORS=false`: Enforces all verification checks
- Minimal logging
- Mainnet/testnet deployment
- Enhanced security measures

## API Endpoints

### Backend Routes
- `POST /api/verify`: Submit wallet for verification
- `POST /api/mint`: Mint new Soulbound NFT
- `GET /api/nft/:id`: Get NFT details
- `GET /api/verify/status/:address`: Check verification status

## Security Considerations
- Private keys stored securely
- Encrypted communication between components
- Non-transferable NFT implementation
- Rate limiting on API endpoints
- Input validation and sanitization

## Testing
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd sbt-frontend
npm test

# Smart contract tests
cd contracts
npx hardhat test
```

## Quick Start Guide

1. **Setup Environment**
   - Install all dependencies in each directory
   - Configure environment variables
   - Start backend server
   - Start frontend application

2. **Development Testing**
   - Ensure `ALLOW_EMPTY_WALLETS=true` and `BYPASS_ERRORS=true` in development
   - Connect MetaMask to local network
   - Use test accounts for minting
   - Monitor backend logs for verification process

3. **Production Deployment**
   - Set `ALLOW_EMPTY_WALLETS=false` and `BYPASS_ERRORS=false`
   - Configure production environment variables
   - Deploy smart contracts to mainnet/testnet
   - Setup secure key management
   - Enable all security measures

## Troubleshooting

Common issues and solutions:
1. **Wallet Connection Issues**
   - Ensure MetaMask is installed and connected
   - Check network configuration

2. **Minting Errors**
   - Verify wallet has required balance
   - Check verification status
   - Review backend logs

3. **Verification Process**
   - Ensure all required data is submitted
   - Check backend services are running
   - Verify API endpoints are accessible

