// Import required testing libraries
const { expect } = require("chai");
const { ethers } = require("hardhat");

// Main test suite for SoulboundNFTs contract
describe("SoulboundNFTs", function () {
  // Declare variables used across tests
  let soulboundNFTs;
  let owner;
  let addr1;
  let addr2;

  // Before each test, set up a fresh contract instance
  beforeEach(async function () {
    // Get test accounts (signers)
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy a new instance of the SoulboundNFTs contract
    const SoulboundNFTs = await ethers.getContractFactory("SoulboundNFTs");
    soulboundNFTs = await SoulboundNFTs.deploy();
  });

  // Test suite for minting and viewing NFT functionality
  describe("Minting and Viewing", function () {
    // Test that anyone can mint and view NFTs
    it("Should allow minting and viewing by anyone", async function () {
      // Mint a Humanity NFT from addr1's account
      await soulboundNFTs.connect(addr1).mintHumanityNFT(
        75, // score value
        "ipfs://QmTest123" // IPFS URI for metadata
      );

      // Test that different accounts can view the token data
      const scoreFromOwner = await soulboundNFTs.getTokenScore(0);
      const scoreFromAddr2 = await soulboundNFTs.connect(addr2).getTokenScore(0);
      const typeFromAnyone = await soulboundNFTs.getTokenType(0);
      const uriFromAnyone = await soulboundNFTs.tokenURI(0);

      // Verify the token data is correct and accessible
      expect(scoreFromOwner).to.equal(75);
      expect(scoreFromAddr2).to.equal(75);
      expect(typeFromAnyone).to.equal(0); // 0 represents HUMANITY type
      expect(uriFromAnyone).to.equal("ipfs://QmTest123");
    });

    // Test prevention of multiple mints of same NFT type
    it("Should prevent multiple mints of the same type", async function () {
      // First mint should succeed
      await soulboundNFTs.connect(addr1).mintHumanityNFT(75, "ipfs://QmTest123");

      // Second mint should fail with specific error
      await expect(
        soulboundNFTs.connect(addr1).mintHumanityNFT(80, "ipfs://QmTest456")
      ).to.be.revertedWith("Already minted Humanity NFT");
    });

    // Test Sybil NFT minting for different contracts
    it("Should allow Sybil NFT minting for different contracts", async function () {
      // Define test contract addresses
      const contract1 = "0x1234567890123456789012345678901234567890";
      const contract2 = "0x9876543210987654321098765432109876543210";

      // Mint first Sybil NFT
      await soulboundNFTs.connect(addr1).mintSybilNFT(
        60,
        "ipfs://QmTest1",
        contract1
      );

      // Mint second Sybil NFT
      await soulboundNFTs.connect(addr1).mintSybilNFT(
        70,
        "ipfs://QmTest2",
        contract2
      );

      // Verify token data for both NFTs
      const contract1Score = await soulboundNFTs.connect(addr2).getTokenScore(0);
      const contract2Score = await soulboundNFTs.connect(addr2).getTokenScore(1);
      const contract1Address = await soulboundNFTs.getTokenContract(0);

      expect(contract1Score).to.equal(60);
      expect(contract2Score).to.equal(70);
      expect(contract1Address).to.equal(contract1);
    });
  });

  // Test suite for soulbound (non-transferable) functionality
  describe("Soulbound Functionality", function () {
    // Before each test, mint a token to addr1
    beforeEach(async function () {
      await soulboundNFTs.connect(addr1).mintHumanityNFT(
        75,
        "ipfs://QmTest123"
      );
    });

    // Test that direct transfers are blocked
    it("Should prevent direct transfers", async function () {
      await expect(
        soulboundNFTs.connect(addr1).transferFrom(
          addr1.address,
          addr2.address,
          0
        )
      ).to.be.revertedWith("Err: token transfer is BLOCKED");
    });

    // Test that safe transfers are blocked
    it("Should prevent safe transfers", async function () {
      await expect(
        soulboundNFTs.connect(addr1)["safeTransferFrom(address,address,uint256)"](
          addr1.address,
          addr2.address,
          0
        )
      ).to.be.revertedWith("Err: token transfer is BLOCKED");
    });

    // Test that safe transfers with data are blocked
    it("Should prevent safe transfers with data", async function () {
      await expect(
        soulboundNFTs.connect(addr1)["safeTransferFrom(address,address,uint256,bytes)"](
          addr1.address,
          addr2.address,
          0,
          "0x"
        )
      ).to.be.revertedWith("Err: token transfer is BLOCKED");
    });

    // Test that transfers are blocked even with explicit approval
    it("Should prevent transfers even if approved", async function () {
      // Approve addr2 to transfer the token
      await soulboundNFTs.connect(addr1).approve(addr2.address, 0);

      // Attempt transfer should still fail
      await expect(
        soulboundNFTs.connect(addr2).transferFrom(
          addr1.address,
          addr2.address,
          0
        )
      ).to.be.revertedWith("Err: token transfer is BLOCKED");
    });

    // Test that transfers are blocked even with operator approval
    it("Should prevent transfers even with operator approval", async function () {
      // Approve addr2 as operator for all tokens
      await soulboundNFTs.connect(addr1).setApprovalForAll(addr2.address, true);

      // Attempt transfer should still fail
      await expect(
        soulboundNFTs.connect(addr2).transferFrom(
          addr1.address,
          addr2.address,
          0
        )
      ).to.be.revertedWith("Err: token transfer is BLOCKED");
    });
  });

  // Test suite for specific NFT type functionality
  describe("NFT Type Specific Tests", function () {
    // Test Cluster NFT minting and data retrieval
    it("Should correctly handle Cluster NFT minting and viewing", async function () {
      await soulboundNFTs.connect(addr1).mintClusterNFT(
        85,
        "ipfs://QmClusterTest"
      );

      // Verify Cluster NFT data
      const score = await soulboundNFTs.getTokenScore(0);
      const nftType = await soulboundNFTs.getTokenType(0);
      const uri = await soulboundNFTs.tokenURI(0);

      expect(score).to.equal(85);
      expect(nftType).to.equal(1); // 1 represents CLUSTER type
      expect(uri).to.equal("ipfs://QmClusterTest");
    });

    // Test contract address access restriction for non-Sybil NFTs
    it("Should prevent accessing contract address for non-Sybil NFTs", async function () {
      // Mint a Humanity NFT
      await soulboundNFTs.connect(addr1).mintHumanityNFT(
        75,
        "ipfs://QmTest123"
      );

      // Attempt to get contract address should fail
      await expect(
        soulboundNFTs.getTokenContract(0)
      ).to.be.revertedWith("Not a Sybil NFT");
    });
  });

  // Add this new test suite after the existing ones
  describe("Gas Measurements", function () {
    it("Should measure gas for minting operations", async function () {
      // Measure Humanity NFT minting
      const humanityTx = await soulboundNFTs.connect(addr1).mintHumanityNFT(
        75,
        "ipfs://QmTest123"
      );
      const humanityReceipt = await humanityTx.wait();
      console.log(`Gas used for Humanity NFT mint: ${humanityReceipt.gasUsed}`);

      // Measure Cluster NFT minting
      const clusterTx = await soulboundNFTs.connect(addr2).mintClusterNFT(
        85,
        "ipfs://QmClusterTest"
      );
      const clusterReceipt = await clusterTx.wait();
      console.log(`Gas used for Cluster NFT mint: ${clusterReceipt.gasUsed}`);

      // Measure Sybil NFT minting
      const sybilTx = await soulboundNFTs.connect(addr1).mintSybilNFT(
        60,
        "ipfs://QmTest1",
        "0x1234567890123456789012345678901234567890"
      );
      const sybilReceipt = await sybilTx.wait();
      console.log(`Gas used for Sybil NFT mint: ${sybilReceipt.gasUsed}`);
    });


    it("Should measure gas for approval operations", async function () {
      // First mint an NFT
      await soulboundNFTs.connect(addr1).mintHumanityNFT(75, "ipfs://QmTest123");

      // Measure approve
      const approveTx = await soulboundNFTs.connect(addr1).approve(addr2.address, 0);
      const approveReceipt = await approveTx.wait();
      console.log(`Gas used for approve: ${approveReceipt.gasUsed}`);

      // Measure setApprovalForAll
      const approveAllTx = await soulboundNFTs.connect(addr1).setApprovalForAll(addr2.address, true);
      const approveAllReceipt = await approveAllTx.wait();
      console.log(`Gas used for setApprovalForAll: ${approveAllReceipt.gasUsed}`);
    });
  });
});