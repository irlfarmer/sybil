const etherscanService = require('./etherscan.service');
const Debug = require('../utils/debug');

const knownMixers = [ 
  '0x20bb3095a4852f4c97d7a188e9f7183c85acfc49', // ALl Current Known Tornado Relayers
  '0x47b03df2145cc9eed6d8819e02d25590f297c603',
  '0xbe4d1e137a24af091be80ae58d652279665e3a27',
  '0x18f516dd6d5f46b2875fd822b994081274be2a8b',
  '0x49136693081f2c18e2cf14428dd78cd90a22dc1f',
  '0xa0f0287683e820ff4211e67c03cf46a87431f4e1',
  '0xd6187b4a0f51355a36764558d39b2c21ac12393d',
  '0x2ca1a9d6c79367ea1ea481fc0a5e8c5bd6c62d25',
  '0x9f9f98e28456eeefc4af1c990a170e2b0d2d6027',
  '0xb326d1f0837e14ad265397800ef3bf7a538335e4',
  '0xb5cd48dd89c063b5a3fe1bcc325364be62fc0f00',
  '0x0f75c6bfaf436eba0cb977dcdfb0f30b57ff9d05',
  '0x6a2d058890cca15beaee5050caaad56b2ab54dd4',
  '0x62e142f218585827436f59997c301f7040396ad4',
  '0x85972458dfbf9269567b2a27c4ffc958a4f24761',
  '0x078ad5db2151083ec16eca1b26e2c98f79034da8',
  '0x3514cfd42e4dde9e65e283ebdbfa2888117823a6',
  '0x550c9288310482f593602dd3e426603ae00bc352',
  '0x3884e9b1e2b0f8d00666c9767b5602b709eeee06',
  '0xc6c86aa348eaa0ef1b6f8da90c279b670e67a55d',
  '0x9f340bf3791809293dc50321bd7f4c19120a98b6',
  '0xf6cb46f9c2e34cd4b7f374d225e0ae5f474ddb32',
  '0x076d4e32c6a5d888fc4658281539c94e778c796d',
  '0x28907f21f43b419f34226d6f10acbcf1832b1d4d',
  '0x6289c8a70ee2ed6914834caea431f9a82c7eaf70',
  '0xe6b23cbae6a62f4b52a021b76e7811522eb82055',
  '0xaf02873d7df5f3e6d5ff42f622f4e138a68208e7',
  '0xb9c612760dc5456e5979393cfe4ab1ff270ae9e5',
  '0xa56963fe9f46c758b2d0616a754346a8f9eba30b',
  '0x56be1f8196cc4aefce3348e679a2008496d14473',
  '0x63606c4011e97a73bcd844cde6a38d45a728bc0e',
  '0xe939c61acd8bd30366435c6b1033251117851b03',
  '0x3e9979106da74afb64b866218aeb47f224a312bb',
  '0x28f1a9b8e3941c0909059eb84e5834154a99e0fc',
  '0x9c8c81f3f5c19dffee7257dd7477b8ef6e405e82',
  '0x644d4f3b293a7fc86eb4efb6bd2439f7603c991d',
  '0x25de357c61c9f2711a605b66e83887ba5fd22ac1',
  '0x78c88ff43cd503316e8a15b6d92b2ebfa73802b2',
  '0x2c42550ff1bdc139b54c5042a9a86a56398e9d83',
  '0xf18673ab6eb72937607aa8388b8f7aa0ac3a0d32',
  '0x3a1d526d09b7e59fd88de4726f68a8246ddc2742',
  '0x7ba6781620c91676b070d319e7e894bfd4a9ec81',
  '0x9ffbd3f9ee795a4fda880ed553a2a4bd6d45ce5b',
  '0xe6184da55174cc0263a17ea2fc24e48511766505',
  '0x36989535f0290eac96692675cbf15a3bd2f42e46',
  '0x12d92fed171f16b3a05acb1542b40648e7ced384',
  '0x08657a1f4c1f06d657f31767831421ee7fadf549',
  '0xd282faed385c2dbc53c3f85f57f9dfc2f5ecc839',
  '0x42fecb4137aff76e0e85702ff4f339dbfe6d859e',
  '0xc6e531cf18afe3a64be19e40ac410f39fc9738da',
  '0x8bd0b78950fba7da35cf6eef708cc9b8e2520404',
  '0x9ee26a4bfd731e8e742b65bf955814eaddd7f151',
  '0x7e3893725d4e238b4c8c83375bbad024a66ffa42',
  '0x465403d43f48dfaa3f9385b60f0fea36c360c18a',
  '0xc7285e85a6d11c762a7d9c57ac38e31a671e9777',
  '0x74b6ea6b2eefd3ef4da5e8c4c0480776035029c2',
  '0x000000336020719e2ad785951582726a39fd33cf',
  '0x14812ae927e2ba5aa0c0f3c0ea016b3039574242',
  '0xdc957b6a3f630bef2e6104c1a22daef9650b5349',
  '0x1247749d7e28d357b4279110af0802603ac526ce',
  '0x1036af02bcdb2e3a4db2d3d40b29e5054edc79ba',
  '0x3665b1e938ce90c48502303acb5049fb065d3a85',
  '0x87bedf6ad81a2907633ab68d02c44f0415bc68c1',
  '0x0b45840ccee39aeeffdf621633d24aa8930b834c',
  '0x0b88d9e073d9c4f420cbb464d640f6a7a4a950b7',
  '0xcbd78860218160f4b463612f30806807fe6e804c',
  '0xa42303ee9b2ec1db7e2a86ed6c24af7e49e9e8b9',
  '0xa0109274f53609f6be97ec5f3052c659ab80f012',
  '0xb578603d3fb9216158c29488c1a902dd0300c115',
  '0x7b81b8680b1abd1e2e983a1589deb5468b50a544',
  '0x4750bcfcc340aa4b31be7e71fa072716d28c29c5',
  '0x36dd7b862746fdd3edd3577c8411f1b76fdc2af5',
  '0x0d13f55ba1509352f9e36190d948d7c45b854be2',
  '0x4803c6ec3e61cd1bb1735bbddb21732100aa13cc',
  '0x0f69bea3e0aa0f40d5bce1875565ff87ab058db0',
  '0x1ee815ad4a914c2c2f4650b3ed34978f8fe2fcc4',
  '0x04843e2c74018c8d94f1834a7ccb94c16691e451',
  '0x0000208a6cc0299da631c08fe8c2ede435ea83b8',
  '0x853281b7676dfb66b87e2f26c9cb9d10ce883f37',
  '0xc1d1d64a7e95909b282e359009b311ecb7b3b33d',
  '0xaaaad0b504b4cd22348c4db1071736646aa314c6',
  '0x5a0cb6505b3b99dd4035bb1ac43cc51202d4e29f',
  '0x7171717171866b60cc1a76a058ae20c8f703ae05',
  '0x30f96aef199b399b722f8819c9b0723016ceae6c',
  '0xefa22d23de9f293b11e0c4ac865d7b440647587a',
  '0xc0f12799b8d3fa8810dfe1616095170c72117f8f',
  '0x996ad81fd83ed7a87fd3d03694115dff19db0b3b',
  '0x000000cd6521ed1a65fae0678ea15af4eead74fe',
  '0x15980a3bd6ed317f42d2ed0dcf3d3d730b6bc0c5',
  '0x7853e027f37830790685622cdd8685ff0c8255a2',
  '0xf0d9b969925116074ef43e7887bcf035ff1e7b19',
  '0x97096f56b09f6aaa4230eec3ba33249995690b0e',
  '0x5555555731006f71f121144534ca7c8799f66aa3',
  '0x5007565e69e5c23c278c2e976beff38ef4d27b3d',
  '0x2ffac4d796261ba8964d859867592b952b9fc158',
  '0xcedac436cea98e93f471331ecc693ff41d730921',
  '0x94596b6a626392f5d972d6cc4d929a42c2f0008c',
  '0x065f2a0ef62878e8951af3c387e4ddc944f1b8f4',
  '0xe7c490986fc34248f77b813ed6c8971e76e0384c',
  '0xc49415493eb3ec64a0f13d8aa5056f1cfc4ce35c',
  '0xb399aa4c2f1678f72529cd125f82cea2c2a823ed',
  '0xab1723831396351f759d0c8787e5ddaa18f5424c',
  '0x2ee39ff05643bc7cc9ed31b71e142429044a425c',
  '0xd04e9f0945dea8373d882c730e2c93a74b591796',
  '0x180c58b7305152357142b33eea94cbb152058b61',
  '0xffdf1dd461e3ce4a78685d2dc0641d95b71b9f53',
  '0xd8f1eb586ecb93745392ee254a028f1f67e1437e',
  '0x0bed01a860a56266383d648320852715fecac7ae',
  '0xb0cdc0ab2d454f2360d4629d519819e13dbe816a',
  '0xe5a4c70113b90566bc5f80a3866935d0d52f990e',
  '0xaaaaaaaaecbb6b330e6345ec36e8d4cd498d2c2a',
  '0x85e935750cfc01ce89b9cb631b1720f7dda1709b',
  '0xf1f4f76c9969efbfb5c9a90a6e44c0e3696d3ef8',
  '0x187541d7d312f742040f270d0221b4fe577934b0',
  '0x0e9d9a828247f5eed7f6d31d213a39805de52441',
  '0xc6398b4e8b60720051ed33f5c5a692f9785f5580',
  '0xdd4c48c0b24039969fc16d1cdf626eab821d3384', // Gitcoin Grants: Tornado.cash
  '0xfd8610d20aa15b7b2e3be39b396a1bc3516c7144', // Tornado.Cash: 1,000 DAI
  '0xd96f2b1c14db8458374d9aca76e26c3d18364307', // Tornado.Cash: 1,000 USDC
  '0xf60dd140cff0706bae9cd734ac3ae76ad9ebc32a', // Tornado.Cash: 10,000 DAI
  '0xd691f27f38b395864ea86cfc7253969b409c362d', // Tornado.Cash: 10,000 USDC
  '0xf67721a2d8f736e75a49fdd7fad2e31d8676542a', // Tornado.Cash: 10,000 USDT
  '0xfa4c1f3f7d5dd7c12a9adb82cd7dda542e3d59ef', // Tornado.Cash: Gas Compensation Vault
  '0xffbac21a641dcfe4552920138d90f3638b3c9fba', // Tornado.Cash: Governance Impl
  '0xd82ed8786d7c69dc7e052f7a542ab047971e73d2', // Tornado.Cash: Poseidon 3
  '0xd90e2f925da726b50c4ed8d0fb90ad053324f31b', // Tornado.Cash: Router
  '0x910cbd523d972eb0a6f4cae4618ad62622b39dbf', // Tornado.Cash: 10 ETH
  '0xbb93e510bbcd0b7beb5a853875f9ec60275cf498', // Tornado.Cash: 10 WBTC
  '0xd4b88df4d29f5cedd6857912842cff3b20c8cfa3', // Tornado.Cash: 100 DAI
  '0xa160cdab225685da1d56aa342ad8841c3b53f291', // Tornado.Cash: 100 ETH
  '0x9ad122c22b14202b4490edaf288fdb3c7cb3ff5e', // Tornado.Cash: 100,000 USDT
  '0xaeaac358560e11f52454d997aaff2c5731b6f8a6', // Tornado.Cash: 5,000 cUSDC
  '0xd21be7248e0197ee08e0c20d4a96debdac3d20af', // Tornado.Cash: 5,000,000 cDAI
  '0xba214c1c1928a32bffe790263e38b4af9bfcd659', // Tornado.Cash: 50,000 cDAI
  '0xb1c8094b234dce6e03f10a5b673c1d8c69739a00', // Tornado.Cash: 500,000 cDAI
  '0xa60c772958a3ed56c1f15dd055ba37ac8e523a0d', // Tornado.Cash: 500,000 cUSDC
  '0xb04e030140b30c27bcdfaafffa98c57d80eda7b4', // Tornado.Cash: Community Fund
  '0x8589427373d6d84e98730d7795d8f6f8731fda16', // Tornado.Cash: Donate
  '0x756c4628e57f7e7f8a459ec2752968360cf4d1aa', // Tornado.Cash: Echoer
  '0xb20c66c4de72433f3ce747b58b86830c459ca911', // Tornado.Cash: Instance Registry
  '0xca0840578f57fe71599d29375e16783424023357', // Tornado.Cash: L1 Helper
  '0x746aebc06d2ae31b71ac51429a19d54e797878e9', // Tornado.Cash: Mining v2
  '0x94a1b5cdb22c43faab4abeb5c74999895464ddaf', // Tornado.Cash: Mixer 1
  '0xb541fc07bc7619fd4062a54d96268525cbc6ffef', // Tornado.Cash: Mixer 2
  '0x94c92f096437ab9958fc0a37f09348f30389ae79', // Tornado.Cash: Poseidon 2
  '0x722122df12d4e14e13ac3b6895a86e84145b6967', // Tornado.Cash: Proxy
  '0x88fd245fedec4a936e700f9173454d1931b4c307', // Tornado.Cash: Reward Verifier
  '0x77c08248c93ab53ff734ac555c932f8b9089d4c9', // Tornado.Cash: Team 3 Vesting
  '0xc3877028655ebe90b9447dd33de391c955ead267', // Tornado.Cash: Team 4 Vesting
  '0xb43432ec23e228fb7cb0fa52968949458b509f4f', // Tornado.Cash: Team 5 Vesting
  '0x77777feddddffc19ff86db637967013e6c6a116c', // Tornado.Cash: TORN Token
  '0x12d66f87a04a9e220743712ce6d9bb1b5616b8fc', // Tornado.Cash: 0.1 ETH
  '0x178169b423a011fff22b9e3f3abea13414ddd0f1', // Tornado.Cash: 0.1 WBTC
  '0x47ce0c6ed5b0ce3d3a51fdb1c52dc66a7c3c2936', // Tornado.Cash: 1 ETH
  '0x610b717796ad172b316836ac95a2ffad065ceab4', // Tornado.Cash: 1 WBTC
  '0x4736dcf1b7a3d580672cce6e7c65cd5cc9cfba9d', // Tornado.Cash: 1,00 USDC
  '0x0836222f2b2b24a3f36f98668ed8f0b38d1a872f', // Tornado.Cash: 1,000 USDT
  '0x07687e702b410fa43f4cb4af7fa097918ffd2730', // Tornado.Cash: 10,000 DAI 2
  '0x169ad27a470d064dede56a2d3ff727986b15d52b', // Tornado.Cash: 100 USDT
  '0x23773e65ed146a459791799d01336db287f25334', // Tornado.Cash: 100,000 DAI
  '0x22aaa7720ddd5388a3c0a3333430953c68f1849b', // Tornado.Cash: 5,000 cDAI
  '0x1356c899d8c9467c7f71c195612f8a395abf2f0a', // Tornado.Cash: 50,000 cUSDC
  '0x2717c5e28cf931547b621a5dddb772ab6a35b701', // Tornado.Cash: 500,000 cDAI 2
  '0x5f6c97c6ad7bdd0ae7e0dd4ca33a4ed3fdabd4d7', // Tornado.Cash: Fee Manager
  '0x5efda50f22d34f262c29268506c5fa42cb56a1ce', // Tornado.Cash: Governance
  '0x2fc93484614a34f26f7970cbb94615ba109bb4bf', // Tornado.Cash: Governance Staking
  '0x2f50508a8a3d323b91336fa3ea6ae50e55f32185', // Tornado.Cash: Governance Vault
  '0x179f48c78f57a3a78f0608cc9197b8972921d1d2', // Tornado.Cash: Governance Vesting
  '0x3f615ba21bc6cc5d4a6d798c5950cc5c42937fbd', // Tornado.Cash: L1 Unwrapper
  '0x58e8dcc13be9780fc42e8723d8ead4cf46943df2', // Tornado.Cash: Relayer Registry
  '0x5cab7692d4e94096462119ab7bf57319726eed2a', // Tornado.Cash: Reward Swap
  '0x5f48c2a71b2cc96e3f0ccae4e39318ff0dc375b2', // Tornado.Cash: Team 1 Vesting
  '0x00d5ec4cdf59374b2a47e842b799027356eac02b', // Tornado.Cash: Team 2 Vesting
  '0x653477c392c16b0765603074f157314cc4f40c32', // Tornado.Cash: Tree Update Verifier
  '0x3efa30704d2b8bbac821307230376556cf8cc39e', // Tornado.Cash: vTORN Token
  '0x912fd21d7a69678227fe6d08c64222db41477ba0', // Tornado.Cash: Withdraw Verifier 2
  '0x000f422887ea7d370ff31173fd3b46c8f66a5b1c', // Tornado.Cash: Withdraw Verifier 3
  '0x4d846da8257bb0ebd164eff513dff0f0c2c3c0ba', // Tornado.Cash: Withdraw Verifier 4
  '0x3b794929566e3ba0f25e4263e1987828b5c87161', // Tornado.Cash: Withdraw Verifier 5
  '0x5eae73d4d24b2922fe614d4f58018b34a7e20a83', // Tornado.Cash: Withdraw Verifier 6
  '0x09193888b3f38c82dedfda55259a82c0e7de875e' // Tornado.Cash: Withdraw Verifier
];

class ClusterAnalysisService {
  constructor() {
    this.timeWindowMinutes = 15; // ±15 minutes window
    this.retryAttempts = 3;
    this.retryDelay = 1000; // 1 second between retries
  }

  async analyzeCluster(walletAddress) {
    try {
      Debug.log('Starting cluster analysis for wallet:', walletAddress);

      // Fetch the first transaction to identify the funder
      const fundingTx = await etherscanService.getFirstTransaction(walletAddress);

      if (!fundingTx) {
        Debug.log('No funding transaction found for wallet:', walletAddress);
        return this.createResponse(walletAddress, null, 0);
      }

      const funderAddress = fundingTx.from.toLowerCase();
      const fundingTime = new Date(fundingTx.timeStamp * 1000);

      Debug.log('Funder identified:', {
        funder: funderAddress,
        time: fundingTime,
        value: fundingTx.value
      });

      // Determine funding source score
      const fundingSourceScore = this.calculateFundingSourceScore(funderAddress);

      // Analyze cluster size with retry logic
      const clusterSizeScore = await this.calculateClusterSizeWithRetry(
        funderAddress,
        fundingTime,
        fundingTx.value
      );

      // Calculate total score
      const totalScore = this.calculateTotalScore(fundingSourceScore, clusterSizeScore.score);

      return this.createResponse(walletAddress, funderAddress, clusterSizeScore.value, totalScore);
    } catch (error) {
      Debug.log('Cluster analysis error:', {
        wallet: walletAddress,
        error: error.message,
        stack: error.stack
      });
      throw new Error('Failed to perform cluster analysis');
    }
  }

  async calculateClusterSizeWithRetry(funderAddress, fundingTime, fundingAmount, attempt = 1) {
    try {
      return await this.calculateClusterSizeScore(funderAddress, fundingTime, fundingAmount);
    } catch (error) {
      if (attempt < this.retryAttempts) {
        Debug.log('Retrying cluster size calculation:', {
          attempt: attempt + 1,
          delay: this.retryDelay
        });
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        return this.calculateClusterSizeWithRetry(
          funderAddress,
          fundingTime,
          fundingAmount,
          attempt + 1
        );
      }
      Debug.log('Max retry attempts reached for cluster size calculation');
      return { value: 0, score: 0 };
    }
  }

  async calculateClusterSizeScore(funderAddress, fundingTime, fundingAmount) {
    try {
      Debug.log('Calculating cluster size:', {
        funder: funderAddress,
        time: fundingTime,
        amount: fundingAmount
      });

      // Calculate time window
      const startTime = new Date(fundingTime.getTime() - this.timeWindowMinutes * 60 * 1000);
      const endTime = new Date(fundingTime.getTime() + this.timeWindowMinutes * 60 * 1000);

      // Get both external and internal transactions in time window
      const [externalTxs, internalTxs] = await Promise.all([
        etherscanService.getTransactionsInTimeRange(funderAddress, startTime, endTime),
        etherscanService.getInternalTransactionsInTimeRange(funderAddress, startTime, endTime)
      ]);

      // Combine and filter transactions
      const relatedTxs = [...externalTxs, ...internalTxs].filter(tx => 
        tx.value === fundingAmount
      );

      const relatedWallets = new Set(relatedTxs.map(tx => tx.to.toLowerCase()));

      Debug.log('Found related transactions:', {
        walletCount: relatedWallets.size,
        transactionCount: relatedTxs.length,
        timeWindow: {
          start: startTime.toISOString(),
          end: endTime.toISOString()
        }
      });

      return {
        value: relatedWallets.size,
        score: this.calculateScoreFromSize(relatedWallets.size)
      };
    } catch (error) {
      Debug.log('Error in cluster size calculation:', {
        error: error.message,
        funder: funderAddress
      });
      throw error; // Let retry logic handle it
    }
  }

  calculateScoreFromSize(size) {
    if (size > 15) return 100;
    if (size >= 5) return 50;
    if (size >= 2) return 25;
    return 0;
  }

  calculateFundingSourceScore(funderAddress) {
    return knownMixers.includes(funderAddress) ? 100 : 0;
  }

  calculateTotalScore(fundingSourceScore, clusterSizeScore) {
    return (fundingSourceScore + clusterSizeScore) / 2;
  }

  createResponse(walletAddress, funderAddress, clusterSize, totalScore = 0) {
    return {
      metadata: {
        address: walletAddress,
        metrics: {
          fundingSource: {
            value: funderAddress || 'unknown',
            score: funderAddress ? this.calculateFundingSourceScore(funderAddress) : 0
          },
          clusterSize: {
            value: clusterSize,
            score: this.calculateScoreFromSize(clusterSize)
          }
        },
        timestamp: new Date().toISOString()
      },
      clusterScore: totalScore
    };
  }
}

module.exports = new ClusterAnalysisService();