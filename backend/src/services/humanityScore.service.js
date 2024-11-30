const etherscanService = require('./etherscan.service');
require('dotenv').config(); 



/**
 * Debug logging utility
 * @param {string} message - Debug message
 * @param {any} data - Data to log
 */
const debugLog = (message, data) => {
  if (process.env.DEBUG === 'true') {
    console.log('\n=== DEBUG ===');
    console.log(message);
    console.log(JSON.stringify(data, null, 2));
    console.log('============\n');
  }
};

/**
 * Service to calculate humanity scores based on transaction history
 */
class HumanityScoreService {
  // Known contract addresses
  constructor() {
    this.BRIDGE_CONTRACTS = [
      '0x0ac2d6f5f5afc669d3ca38f830dad2b4f238ad3f', // 0x: Eth2Dai Bridge
      '0x256c8919ce1ab0e33974cf6aa9c71561ef3017b6', // Across Protocol: USDC Bridge Pool
      '0x02fbb64517e1c6ed69a6faa3abf37db0482f1152', // Across Protocol: WBTC Bridge Pool
      '0x23122da8c581aa7e0d07a36ff1f16f799650232f', // Arbitrum Nova: L1 Arb-Custom Gateway
      '0x0b9857ae2d4a3dbe74ffe1d7df045bb7f96e4840', // Arbitrum: Outbox 4
      '0x14797f5432f699cb4d4db04df599b74952d78d7b', // Arbitrum: Outbox Entry
      '0x1a2a1c938ce3ec39b6d47113c7955baa9dd454f2', // Axie Infinity: Ronin Bridge
      '0x1bd0029385f95ad2584cdfaf5c19f3f20651def6', // Harmony: Token Bridge
      '0x22b1cbb8d98a01a3b71d034bb899775a76eb1cc2', // Hop Protocol: MATIC Bridge
      '0x014f808b7d4b6f58be5fef88002d5028cd0ed14b', // Lition: Token Bridge
      '0x0baba1ad5be3a5c0a66e7ac838a129bf948f1ea4', // Loopring: Exchange v2
      '0x05b70fb5477a93be33822bfb31fdaf2c171970df', // Mayan: Swap Bridge
      '0x13b432914a996b0a48695df9b2d701eda45ff264', // Multichain: BNB Bridge
      '0x10c6b61dbf44a083aec3780acf769c77be747e23', // Multichain: Moonriver Bridge
      '0x23ddd3e3692d1861ed57ede224608875809e127f', // Near: Rainbow Bridge
      '0x070cb1270a4b2ba53c81cef89d0fd584ed4f430b', // OMG Network V1: ERC-20 Vault
      '0x10e6593cdda8c58a1d0f14c5164b376352a55f2f', // Optimism: DAI Bridge
      '0x1bf68a9d1eaee7826b3593c20a0ca93293cb489a', // Orbit Chain: ETH Vault
      '0x1650683e50e075efc778be4d1a6be929f3831719', // Pheasant Network: Relayer
      '0x2140ecdc45c89ca112523637824513bae72c8671', // POA Network: AMB-ETH-POA
      '0x12ed69359919fc775bc2674860e8fe2d2b6a7b5d', // RSK: Token Bridge
      '0x0188b70b78071062c7166f77495e822ea4b86fa0', // SkyBridge: L1 NFT Bridge
      '0x045e507925d2e05d114534d0810a1abd94aca8d6', // Synthetix: L2 Bridge
      '0x104b9b1c41c6764e88edf1207f498902d840fe2a', // Zeroswap: BSC Bridge
      '0x0dd1f24cf4ff96f197a795d02d0ba1eb53448bcc', // Zeroswap: Polygon Bridge
      '0x30b44c676a05f1264d1de9cc31db5f2a945186b6', // Across Protocol: Bridge Admin
      '0x3154cf16ccdb4c6d922629664174b904d80f2c35', // Base: Base Bridge
      '0x3be8a7d4aa3e9b723a718e1b83fe8a8b5c37871c', // Counterstake: WBTC Bridge
      '0x3014ca10b91cb3d0ad85fef7a3cb95bcac9c0f79', // Fuse: Native Bridge
      '0x30f938fed5de6e06a9a7cd2ac3517131c317b1e7', // Giveth: Trace Bridge
      '0x2dccdb493827e15a5dc8f8b72147e6c4a5620857', // Harmony: ERC20 Bridge
      '0x3d4cc8a61c7528fd86c55cfe061a78dcba48edd1', // Hop Protocol: DAI Bridge
      '0x3666f603cc164936c1b87e207f36beba4ac5f18a', // Hop Protocol: USDC Bridge
      '0x3e4a3a4796d16c0cd582c382691998f7c06420b6', // Hop Protocol: USDT Bridge
      '0x37acfef331e6063c8507c2a69c97b4f78c770a5a', // InstaDapp: Maker Compound Bridge
      '0x3307c46a1e9633025d2e89658c7502a683585450', // iSwap: Ethereum Bridge
      '0x3b95bc951ee0f553ba487327278cac44f29715e5', // Manta Pacific: Bridge
      '0x3980c9ed79d2c191a89e02fa3529c60ed6e9c04b', // Metis Andromeda: Bridge
      '0x2d6775c1673d4ce55e1f827a0d53e62c43d1f304', // Nomad: Bridge
      '0x3eed23ea148d356a72ca695dbce2fceb40a32ce0', // OMG Network V1: ETH Vault
      '0x2784a755690453035f32ac5e28c52524d127afe2', // Optics: ETH Helper
      '0x401f6c983ea34274ec46f84d70b31c151321188b', // Polygon (Matic): Plasma Bridge
      '0x32666b64e9fd0f44916e1378efb2cfa3b3b96e80', // Ren: RenBridge
      '0x313416870a4da6f12505a550b67bb73c8e21d5d3', // Sora: HASHI
      '0x283751a21eafbfcd52297820d27c1f1963d9b5b4', // Starknet: StarkGate WBTC Bridge
      '0x2796317b0ff8538f253012862c06787adfb8ceb6', // Synapse: Bridge
      '0x39ea01a0298c315d149a490e34b59dbf2ec7e48f', // Synthetix: Synthetix Bridge To Optimism
      '0x3ee18b2214aff97000d974cf647e7c347e8fa585', // Wormhole: Portal Token Bridge
      '0x31efc4aeaa7c39e54a33fdc3c46ee2bd70ae0a09', // xPollinate: Transaction Manager
      '0x32400084c286cf3e17e7b677ea9583e60a000324', // zkSync Era: Diamond Proxy
      '0x43298f9f91a4545df64748e78a2c777c580573d6', // Across Protocol: Badger Bridge Pool
      '0x4d9079bb4165aeb4084c526a32695dcfd2f77381', // Across Protocol: Old Ethereum Spoke Pool V2
      '0x4dbd4fc535ac27206064b68ffcf827b0a60bab3f', // Arbitrum: Delayed Inbox
      '0x49048044d57e1c92a77f79988d21fa8faf74e97e', // Base: Base Portal
      '0x5427fefa711eff984124bfbb1ab6fbf5e3da1820', // Celer Network: cBridge V2
      '0x4add6ab943e7908bb51e7878755d0ca322c898d6', // Counterstake: USDC Bridge
      '0x43de2d77bf8027e25dbd179b491e8d64f38398aa', // deBridgeGate
      '0x4aa42145aa6ebf72e164c9bbc74fbd3788045016', // Gnosis Chain: xDai Bridge
      '0x426a61a2127fdd1318ec0edce02474f382fdad30', // Harmony: ERC721 Bridge
      '0x4d34e61caf7a3622759d69e48ccdeb8dee5021e8', // Harmony: ONE Bridge
      '0x5a1d63d3e1303e89503f2a1ecb553328f148909d', // Jointer: JNTR/e <> JNTR Bridge
      '0x50002cdfe7ccb0c41f519c6eb0653158d11cd907', // Layer Zero: Aptos Bridge
      '0x46290b0c3a234e3d538050d8f34421797532a827', // Multichain: Fusion Bridge
      '0x533e3c0e6b48010873b947bddc4721b1bdff9648', // Multichain: Old BSC Bridge
      '0x4e67df0f232c3bc985f8a63326d80ce3d9a40400', // Multichain: Shiden Network Bridge
      '0x57ed6bd35a6ce815079855cd0b21331d1d5d0a0e', // Multichain: Telos Bridge
      '0x48d7a6bbc428bca019a560cf3e8ea5364395aad3', // OMG Network V1: Exit Game
      '0x4fc16de11deac71e8b2db539d82d93be4b486892', // Optics: ERC-20 Bridge
      '0x467194771dae2967aef3ecbedd3bf9a310c76c65', // Optimism: L1 Escrow
      '0x4c36d2919e407f0cc2ee3c993ccf8ac26d9ce64e', // POA Network: AMB-ETH-XDAI
      '0x40ec5b33f54e0e8a33a975908c5ba1c14e5bbbdf', // Polygon (Matic): ERC20 Bridge
      '0x5d22045daceab03b158031ecb7d9d06fad24609b', // Rhino.fi: Bridge
      '0x5fd79d46eba7f351fe49bff9e87cdea6c821ef9f', // Synthetix: L2 Deposit Escrow
      '0x4103c267fba03a1df4fe84bc28092d629fa3f422', // Umbria: Narni Bridge
      '0x5cdaf83e077dbac2692b5864ca18b61d67453be8', // ZKSwap: ZKSpace Bridge
      '0x7355efc63ae731f584380a9838292c7046c1e433', // Across Protocol: WETH Bridge Pool
      '0x72ce9c846789fdb6fc1f34ac4ad25dd9ef7031ef', // Arbitrum One: L1 Gateway Router
      '0x667e23abd27e623c11d4cc00ca3ec4d0bd63337a', // Arbitrum: Outbox
      '0x64192819ac13ef72bf6b5ae239ac672b43a9af08', // Axie Infinity: Ronin Bridge V2
      '0x737901bea3eeb88459df9ef1be8ff3ae1b42a2ba', // Aztec: Private Rollup Bridge
      '0x66598216d8e4d9afe0f06d525b335b762229842f', // Chainlink: Transporter
      '0x74af8a878317e0f6e72e302fbcdf5f3009186398', // Counterstake: Bridge
      '0x6880f6fd960d1581c2730a451a22eed1081cfd72', // Fuel: Bridge
      '0x75ace7a086ea0fb1a79e43cc6331ad053d8c67cb', // Gluon Network
      '0x7e7669bdff02f2ee75b68b91fb81c2b38f9228c2', // Gnosis: Foreign Bridge
      '0x6ea6c65e14661c0bcab5bc862fe5e7d3b5630c2f', // Gnosis: GEN-xGEN Bridge
      '0x7301cfa0e1756b71869e93d4e4dca5c7d0eb0aa6', // Gnosis: Home Bridge
      '0x5fdcca53617f4d2b9134b29090c87d01058e27e9', // Immutable X: Bridge
      '0x66a71dcef29a0ffbdbe3c6a460a3b5bc225cd675', // LayerZero: Ethereum Endpoint
      '0x674bdf20a0f284d710bc40872100128e2d66bd3f', // Loopring: Exchange v2 Deposit
      '0x7a465d909c9c08ac907c7984747341e85268954b', // Mindsync: ETH BSC Bridge
      '0x735adbbe72226bd52e818e7181953f42e3b0ff21', // Mode: Standard Bridge Proxy
      '0x6b7a87899490ece95443e979ca9485cbe7e71522', // Multichain: Router V4
      '0x765277eebeca2e31912c9946eae1021199b39c61', // Multichain: Router V4 2
      '0x6a39909e805a3eadd2b61fff61147796ca6abb47', // Optics: Bridge
      '0x80c67432656d59144ceff962e8faf8926599bcf8', // Orbiter Finance: Bridge
      '0x659a00c33263d9254fed382de81349426c795bb6', // StarkGate: Deprecated - DAI Bridge
      '0x66ba83ba3d3ad296424a2258145d9910e9e40b7c', // Starknet: StarkGate FXS Bridge
      '0x6571d6be3d8460cf5f7d6711cd9961860029d85f', // Synapse: Bridge Zap 3
      '0x6de5bdc580f55bc9dacafcb67b91674040a247e3', // ZKSwap: V2 Bridge
      '0x8ed95d1746bf1e4dab58d8ed4724f1ef95b20db0', // 0x: Erc20 Bridge Proxy
      '0x96e471b5945373de238963b4e032d3574be4d195', // 0xHabitat: Rollup Bridge
      '0x9ea264fcb603858f21311b4591ceea9f7578b064', // Allbridge 2
      '0x8315177ab297ba92a06054ce80a67ed4dbd7ed3a', // Arbitrum: Bridge
      '0xa10c7ce4b876998858b1a9e12b10092229539400', // Arbitrum: DAI L1 Escrow
      '0x8eb8a3b98659cce290402893d0123abb75e3ab28', // Avalanche: Bridge
      '0x841ce48f9446c8e281d3f1444cb859b4a6d0738c', // Celer Network: cBridge
      '0x8898b472c54c31894e3b9bb83cea802a5d0e63c6', // Connext: Bridge
      '0x9280e0ffdfae4ec895fdf4d4978c9e1b869eb774', // Evo DeFi: Bridge
      '0x9a8c4bdcd75cfa1059a6e453ac5ce9d3f5c82a35', // Fantom: Bridge
      '0x88ad09518695c6c3712ac10a214be5109a655671', // Gnosis Chain: ETH-xDAI Omni Bridge
      '0x914f986a44acb623a277d6bd17368171fcbe4273', // Hop Protocol: HOP Bridge
      '0x893246facf345c99e4235e5a7bbee7404c988b96', // Hop Protocol: SNX Bridge
      '0x87bcb3038988ca2a89605ffa8f237fb78df1c3ae', // Multichain: Fuse Bridge
      '0x923e0a17f49fb03d936f2af2d59d379c615f5447', // Multichain: KCC Bridge
      '0x8cc49fe67a4bd7a15674c4ffd4e969d94304bbbf', // Multichain: Syscoin Bridge
      '0x88a69b4e698a4b090df6cf5bd7b2d47325ad30a3', // Nomad: ERC20 Bridge
      '0x99c9fc46f92e8a1c0dec1b1747d010903e884be1', // Optimism: Gateway
      '0x8f92e7353b180937895e0c5937d616e8ea1a2bb9', // Phala Network: Main Bridge Contract
      '0xa0c68c638235ee32657e8f720a23cec1bfc77c77', // Polygon (Matic): Bridge
      '0x8484ef722627bf18ca5ae6bcf031c23e6e922b30', // Polygon (Matic): Ether Bridge
      '0x9f96fe0633ee838d0298e8b8980e6716be81388d', // StarkGate: DAI Bridge
      '0x86ca49d37015a8541642b1b5a90af0115ec61994', // Undead Blocks: Bridge
      '0x98f3c9e6e3face36baad05fe09d375ef1464288b', // Wormhole: Ethereum Core Bridge
      '0x8eca806aecc86ce90da803b080ca4e3a9b8097ad', // ZKSwap
      '0xa6baaed2053058a3c8f11e0c7a9716304454b09e', // 0x: Uniswap Bridge
      '0xbbbd1bbb4f9b936c3604906d7592a644071de884', // Allbridge: Bridge
      '0xb2535b988dce19f9d71dfb22db6da744acac21bf', // Arbitrum Nova: L1 ERC20 Gateway
      '0xc840838bc438d73c16c2f8b22d2ce3669963cd48', // Arbitrum Nova: L1 Gateway Router
      '0xa3a7b6f88361f48403514059f1f16c8e78d60eec', // Arbitrum One: L1 ERC20 Gateway
      '0xc578cbaf5a411dfa9f0d227f97dadaa4074ad062', // Celer Network: cBridge 2.0
      '0xa4108aa1ec4967f8b52220a4f7e94a8201f2d906', // Gravity Bridge: Bridge
      '0xa929022c9107643515f5c777ce9a910f0d1e490c', // HECO Chain: Bridge
      '0xb8901acb165ed027e32754e0ffe830802919727f', // Hop Protocol: Ethereum Bridge
      '0xb98454270065a31d71bf635f6f7ee6a518dfb849', // Hop Protocol: WBTC Bridge
      '0xc10ef9f491c9b59f936957026020c321651ac078', // Multichain: anyCall V6
      '0xc564ee9f21ed8a2d8e7e76c085740d5e4c5fafbe', // Multichain: Fantom Bridge
      '0xba8da9dcf11b50b03fd5284f164ef5cdef910705', // Multichain: Router V6
      '0xcdd83050f045ab31b884f0dc49581bc7b3e0b84c', // Multichain: Velas Bridge
      '0xcd38b15a419491c7c1238b0659f65c755792e257', // Phala Network: ERC20 Bridge Handler
      '0xa68d85df56e733a06443306a095646317b5fa633', // Polygon: Hermez
      '0xc91d491227ba9968b32ae64ae3d41ee00741acd2', // SkyBridge: L1 Bridge
      '0xbf67f59d2988a46fbff7ed79a621778a3cd3985b', // StarkGate: wstETH Bridge
      '0xae0ee0a63a2ce6baeeffe56e7714fb4efe48d419', // Starknet: StarkGate ETH Bridge
      '0xb27d0dcafd63db302c155c8864886f33bd2a41e5', // Starknet: StarkGate R Bridge
      '0xbb3400f107804dfb482565ff1ec8d8ae66747605', // Starknet: StarkGate USDT Bridge
      '0xa2569370a9d4841c9a62fc51269110f2eb7e0171', // Synapse: Bridge Zap 1
      '0xcd9d4988c0ae61887b075ba77f08cbfad2b65068', // Synthetix: L2 Deposit
      '0xc145990e84155416144c532e31f89b840ca8c2ce', // THORSwap: RouterV2
      '0xabea9132b05a70803a4e85094fd0e1800777fbef', // zkSync
      '0xdfe0ec39291e3b60aca122908f86809c9ee64e90', // Across Protocol: UMA Bridge Pool
      '0xd5d6b2f2d7a7506c49bb0cb6fb39a67f065d6fc4', // Allbridge
      '0xe4e2121b479017955be0b175305b35f312330bae', // Arbitrum Nova: L1 WETH Gateway
      '0xcee284f754e854890e311e3280b767f80797180d', // Arbitrum One: L1 Arb - Custom Gateway
      '0xd3b5b60020504bc3489d6949d545893982ba3011', // Arbitrum One: L1 DAI Gateway
      '0xd92023e9d9911199a6711321d1277285e6d4e2db', // Arbitrum One: Wrapped Ether Gateway
      '0xe5896783a2f463446e1f624e64aa6836be4c6f58', // Arbitrum: Challenge Manager
      '0xdac7bb7ce4ff441a235f08408e632fa1d799a147', // Avalanche: Avalanche-Ethereum Bridge
      '0xe78388b4ce79068e89bf8aa7f218ef6b9ab0e9d0', // Avalanche: Old Bridge
      '0xdc1664458d2f0b6090bea60a8793a4e66c2f1c00', // Boba Network: Gateway
      '0xe7351fd770a37282b91d153ee690b63579d6dd7f', // Dln: Destination
      '0xd54f502e184b6b739d7d27a6410a67dc462d69c8', // dYdX: L2 Perpetual Smart Contract
      '0xe2e3441004e7d377a2d97142e75d465e0dd36af9', // Hashflow: Bridge
      '0xdaf1695c41327b61b9b9965ac6a5843a3198cf07', // Manta Pacific: New Paradigm Bridge
      '0xd779967f8b511c5edf39115341b310022900efed', // Multichain: Huobi Bridge
      '0xe4cf417081a0ab3f964b44d904bc2b534351a9a7', // Multichain: Oasis Network Bridge
      '0xe95fd76cf16008c12ff3b3a937cb16cd9cc20284', // Multichain: Router V3
      '0xe4edb277e41dc89ab076a1f049f4a3efa700bce8', // Orbiter Finance: Bridge 2
      '0xe4b679400f0f267212d5d812b95f58c83243ee71', // Ren: BTC Gateway
      '0xd8b19613723215ef8cc80fc35a1428f8e8826940', // Rubic Exchange
      '0xeae57ce9cc1984f202e15e038b964bb8bdf7229a', // Sollet: Solana Bridge
      '0xdc687e1e0b85cb589b2da3c47c933de9db3d1ebb', // Starknet: StarkGate FRAX Bridge
      '0xcf58536d6fab5e59b654228a5a4ed89b13a876c2', // Starknet: StarkGate rETH Bridge
      '0xd8e8531fdd446df5298819d3bc9189a5d8948ee8', // Starknet: StarkGate sfrxETH Bridge
      '0xe34b087bf3c99e664316a15b01e5295eb3512760', // Zapper.Fi: Ethereum to Polygon Bridge
    ];
    this.LENDING_CONTRACTS = [
      '0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9', // AAVE
      '0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B', // Compound
      '0x1cdbde50F9D122CCE8fe8D08d0D482b0161fFD15', // Silo: USDC/WETH
      '0x884725A8dd9E8591E851C88Eb665735f8D86da8C', // Silo: USDT/WETH 
      '0x992298cb9a6aafaDBc038dC85f1a1C012F45b67d', // Silo: DAI/WETH
      '0x6e7058c91F85E0F6db4fc9da2CA41241f5e4263f', // Notional Finance
      '0x315F93a074D0948E4D068e98a34092750ea8A38C', // Euler Finance: Vault
      '0xa992d3777282c44ee980E9B0ca9Bd0c0E4f737aF', // Euler Finance: Vault
      '0xa992d3777282c44ee980E9B0ca9Bd0c0E4f737aF', // Euler Finance: Vault
      '0xe2D6A2a16ff6d3bbc4C90736A7e6F7Cc3C9B8fa9', // Euler Finance: Vault
      '0x313603FA690301b0CaeEf8069c065862f9162162', // Euler Finance: Vault
      '0x67e4e4e73947257Ca62D118E0FBC56D06f11d96F', // Euler Finance: Vault
      '0xD8b27CF359b7D15710a5BE299AF6e7Bf904984C2', // Euler Finance: Vault
      '0xf9a23b059858CdD0e3ED0DDE89864BB82B88aa19', // Euler Finance: Vault
      '0xce45EF0414dE3516cAF1BCf937bF7F2Cf67873De', // Euler Finance: Vault
      '0x797DD80692c3b2dAdabCe8e30C07fDE5307D48a9', // Euler Finance: Vault
      '0x9c6e67fA86138Ab49359F595BfE4Fb163D0f16cc', // Euler Finance: Vault
      '0xcAd0be6e135C3d2859EA0c872cCD510C962765b7', // Euler Finance: Vault
      '0x056f3a2E41d2778D3a0c0714439c53af2987718E', // Euler Finance: Vault
      '0x298966b32C968884F716F762f6759e8e5811aE14', // Euler Finance: Vault
      '0x78b2d65dd1d3d9fb2972d7ef467261ca101ec2b9', // FlashStake
      '0xb89494ab70001a2f25372b5e962046908188feea', // FlashStake
      '0xcb1205ac28693beda01e0b66e9b4d06231609bfd', // FlashStake
      '0x57d551a18aae2c9de6977425f1df34dcd5db4977', // FlashStake
      '0x3d5bc3c8d13dcb8bf317092d84783c2697ae9258', // Cream.Finance: Comptroller
      '0xce4fe9b4b8ff61949dcfeb7e03bc9faca59d2eb3', // Cream.Finance: crBAL Token
      '0x19d1666f543d42ef17f66e376944a22aea1a8e46', // Cream.Finance: crCOMP Token
      '0x892b14321a4fcba80669ae30bd0cd99a7ecf6ac0', // Cream.Finance: crCREAM Token
      '0xa65405e0dd378c65308deae51da9e3bcebb81261', // Cream.Finance: crCREAM/crYFI
      '0x2ba592f78db6436527729929aaf6c908497cb200', // Cream.Finance: CREAM Token
      '0x4fd2d9d6ef05e13bf0b167509151a4ec3d4d4b93', // Cream.Finance: CREAM/USDC
      '0x1676fc274b65966ed0c6438a26d34c6c92a5981c', // Cream.Finance: CREAM/USDC Pool
      '0xa49b3c7c260ce8a7c665e20af8aa6e099a86cf8a', // Cream.Finance: CREAM/WETH
      '0x43a8ece49718e22d21077000768aff91849bceff', // Cream.Finance: CREAM/WETH Pool
      '0xd06527d5e56a3495252a528c4987003b712860ee', // Cream.Finance: crETH Token
      '0x8b86e0598616a8d4f1fdae8b59e55fb5bc33d0d6', // Cream.Finance: crLEND Token
      '0x697256caa3ccafd62bb6d3aa1c7c5671786a5fd9', // Cream.Finance: crLINK Token
      '0x44fbebd2f576670a6c33f6fc0b00aa8c5753b322', // Cream.Finance: crUSDC Token
      '0x797aab1ce7c01eb727ab980762ba88e7133d2157', // Cream.Finance: crUSDT Token
      '0x9baf8a5236d44ac410c0186fe39178d5aad0bb87', // Cream.Finance: crYCRV Token
      '0xb3284f2f22563f27cef2912637b6a00f162317c4', // Cream.Finance: crYETH/crYYCRV
      '0xcbae0a83f4f9926997c8339545fb8ee32edc6b76', // Cream.Finance: crYFI Token
      '0x4b7dba23bea9d1a2d652373bcd1b78b0e9e0188a', // Cream.Finance: Price Oracle
      '0x1e5fe7bad3672d0d0cc041b7154331ee461c3349', // Cream.Finance: UNI/CREAM
      '0xe539416a21f6d7ef7e143f1435484d333c274480', // Cream.Finance: UNI/WETH
      '0x6a3b875854f5518e85ef97620c5e7de75bbc3fa0', // Cream.Finance: yETH/WETH
      '0x7350c6d00d63ab5988250aea347f277c19bea785', // Cream.Finance: YFI-USDC
      '0x2ab765c2b4a4e197fbae769f86870f2310a04d61', // Cream.Finance: YFI/USDC
      '0x661b94d96adb18646e791a06576f7905a8d1bef6', // Cream.Finance: yyCRV/USDC
      '0x3623387773010d9214b10c551d6e7fc375d31f58', // Cream.Finance: crMTA Token
      '0x338286c0bc081891a4bda39c7667ae150bf5d206', // Cream.Finance: crSUSHI Token
      '0x780f75ad0b02afeb6039672e6a6cede7447a8b45', // Cream.Finance: 1 Year Staking
      '0xbdc3372161dfd0361161e06083ee5d52a9ce7595', // Cream.Finance: 2 Year Staking
      '0xd5586c1804d2e1795f3fbbafb1fbb9099ee20a6c', // Cream.Finance: 3 Year Staking
      '0xe618c25f580684770f2578faca31fb7acb2f5945', // Cream.Finance: 4 Year Staking
      '0x65883978ada0e707c3b2be2a6825b1c4bdf76a90', // Cream.Finance: crAKRO Token
      '0x2db6c82ce72c8d7d770ba1b5f5ed0b6e075066d6', // Cream.Finance: crAMP Token
      '0x8b950f43fcac4931d408f1fcda55c6cb6cbf3096', // Cream.Finance: crBBADGER Token
      '0x3ba3c0e8a9e5f4a01ce8e086b3d8e8a603a2129e', // Cream.Finance: crCREAM (7 day lock)
      '0xc7fd8dcee4697ceef5a2fd4608a7bd6a94c77480', // Cream.Finance: crCRV Token
      '0xb092b4601850e23903a42eacbc9d8a0eec26a4d5', // Cream.Finance: crFRAX Token
      '0x10fdbd1e48ee2fd9336a482d746138ae19e649db', // Cream.Finance: crFTT Token
      '0x59089279987dd76fc65bf94cb40e186b96e03cb3', // Cream.Finance: crOGN Token
      '0xc68251421edda00a10815e273fa4b1191fac651b', // Cream.Finance: crPICKLE Token
      '0x17107f40d70f4470d20cb3f138a052cae8ebd4be', // Cream.Finance: crRENBTC Token
      '0xc25eae724f189ba9030b2556a1533e7c8a732e14', // Cream.Finance: crSNX Token
      '0xef58b2d5a1b8d3cde67b8ab054dc5c831e9bc025', // Cream.Finance: crSRM Token
      '0x25555933a8246ab67cbf907ce3d1949884e82b55', // Cream.Finance: crSUSD Token
      '0xe89a6d0509faf730bd707bf868d9a2a744a363c7', // Cream.Finance: crUNI Token
      '0x197070723ce0d3810a0e47f06e935c30a480d4fc', // Cream.Finance: crWBTC Token
      '0x4ee15f44c6f0d8d1136c83efd2e8e4ac768954c6', // Cream.Finance: crYYCRV Token
      '0x0b471a71c3f6d4aadc7eb20aab7d730ae385e150', // Cream.Finance: cyUSD Pool
      '0xaaf841fd6409c136fa4b960e22a92b45b26c9b41', // Cream.Finance: cyUSD/CREAM 95/5
      '0xae76e0d0c4767e94eb2898f42a96696ae0061cea', // Cream.Finance: cyUSD/CREAM Pool
      '0x1d0986fb43985c88ffa9ad959cc24e6a087c7e35', // Cream.Finance: crALPHA Token
      '0xab10586c918612ba440482db77549d26b7abf8f7', // Cream.Finance: crARMOR Token
      '0xdfff11dfe6436e42a17b86e7f419ac8292990393', // Cream.Finance: crARNXM Token
      '0x8c3b7a4320ba70f8239f83770c4015b5bc4e6f91', // Cream.Finance: crFEI Token
      '0xc36080892c64821fa8e396bc1bd8678fa3b82b17', // Cream.Finance: crFTM Token
      '0x523effc8bfefc2948211a05a905f761cba5e8e9e', // Cream.Finance: crGNO Token
      '0xdbb5e3081def4b6cdd8864ac2aeda4cbf778fecf', // Cream.Finance: crMLN Token
      '0x7c3297cfb4c4bbd5f44b450c0872e0ada5203112', // Cream.Finance: crOCEAN Token
      '0x299e254a8a165bbeb76d9d69305013329eea3a3b', // Cream.Finance: crPERP Token
      '0xf8445c529d363ce114148662387eba5e62016e20', // Cream.Finance: crRAI Token
      '0x081fe64df6dc6fc70043aedf3713a3ce6f190a21', // Cream.Finance: crRARI Token
      '0x8379baa817c5c5ab929b03ee8e3c48e45018ae41', // Cream.Finance: crRune Token
      '0x28526bb33d7230e65e735db64296413731c5402e', // Cream.Finance: crSFI Token
      '0x98e329eb5aae2125af273102f3440de19094b77c', // Cream.Finance: crSWAP Token
      '0x51f48b638f82e8765f7a26373a2cb4ccb10c07af', // Cream.Finance: crUST Token
      '0x71cefcd324b732d4e058afacba040d908c441847', // Cream.Finance: crVSP Token
      '0x1a122348b73b58ea39f822a89e6ec67950c2bbd0', // Cream.Finance: crVVSP Token
      '0xe585c76573d7593abf21537b607091f76c996e73', // Cream.Finance: crWOO Token
      '0x4baa77013ccd6705ab0522853cb0e9d453579dd4', // Cream.Finance: crYUSD Token
      '0x45406ba53bb84cd32a58e7098a2d4d1b11b107f6', // Cream.Finance: crYVCurve-IB Token
      '0x6d1b9e01af17dd08d6dec08e210dfd5984ff1c20', // Cream.Finance: crYVCurve-sETH Token
      '0x1f9b4756b008106c806c7e64322d7ed3b72cb284', // Cream.Finance: crYVCurve-stETH Token
      '0x1bcafa2c1b3a522e41baa60c2e318981ea8d1eb5', // Cream.Finance: crYVSTECRV Token
      '0x4202d97e00b9189936edf37f8d01cff88bdd81d4', // Cream.Finance: crYVWETH Token
      '0xa87e8e61dfac8af5944d353cd26b96b20d5f4d01', // Cream.Finance: crYYECRV Token
      '0xf04ce2e71d32d789a259428ddcd02d3c9f97fb4e', // Cream.Finance: crAXS Token
      '0x81e346729723c4d15d0fb1c5679b9f2926ff13c6', // Cream.Finance: crBNT Token
      '0x2a867fd776b83e1bd4e13c6611afd2f6af07ea6d', // Cream.Finance: crIBBTC Token
      '0x250fb308199fe8c5220509c1bf83d21d60b7f74a', // Cream.Finance: crLON Token
      '0x58da9c9fc3eb30abbcbbab5ddabb1e6e2ef3d2ef', // Cream.Finance: crMANA Token
      '0xd7394428536f63d5659cc869ef69d10f9e66314b', // Cream.Finance: crPAX Token
      '0x1241b10e7ea55b22f5b2d007e8fecdf73dcff999', // Cream.Finance: crPAXG Token
      '0x89e42987c39f72e2ead95a8a5bc92114323d5828', // Cream.Finance: crSAND Token
      '0x4112a717edd051f77d834a6703a1ef5e3d73387f', // Cream.Finance: crYGG Token
      '0x9d029cd7cedcb194e2c361948f279f1788135bb2', // Cream.Finance: cyCREAM Token
      '0xbddeb563e90f6cbf168a7cda4927806477e5b6c6', // Cream.Finance: cyUSDP Token
      '0xfeeb92386a055e2ef7c2b598c872a4047a7db59f', // Iron Bank: cyUNI
      '0x30190a3b52b5ab1daf70d46d72536f5171f22340', // Iron Bank: iAAVE
      '0x86bbd9ac8b9b44c95ffc6baae58e25033b7548aa', // Iron Bank: iAUD
      '0x1b3e95e8ecf7a7cab6c4de1b344f94865abd12d5', // Iron Bank: iCHF
      '0xb8c5af54bbdcc61453144cf472a9276ae36109f9', // Iron Bank: iCRV
      '0xecab2c76f1a8359a06fab5fa0ceea51280a97ecf', // Iron Bank: iGBP
      '0x215f34af6557a6598dbda9aa11cc556f5ae264b1', // Iron Bank: iJPY
      '0x3c9f5385c288ce438ed55620938a4b967c080101', // Iron Bank: iKRW
      '0x6B175474E89094C44Da98b954EedeAC495271d0F', // PWN: DAI Borrowing
      '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // PWN: USDC Borrowing
      '0xdAC17F958D2ee523a2206206994597C13D831ec7', // PWN: USDT Borrowing
      '0x5f98805A4E8be255a32880FDeC7F6728C6568bA0',  // PWN: LUSD Borrowing
      '0xda0002859b2d05f66a753d8241fcde8623f26f4f', // Gearbox
      '0xda00000035fef4082f78def6a8903bee419fbf8e', // Gearbox
      '0x05a811275fe9b4de503b3311f51edf6a856d936e', // Gearbox
      '0xe7146f53dbcae9d6fa3555fe502648deb0b2f823', // Gearbox
      '0xe7146f53dbcae9d6fa3555fe502648deb0b2f823', // Gearbox
      '0x4d56c9cba373ad39df69eb18f076b7348000ae09', // Gearbox
      '0xda00010eda646913f273e10e7a5d1f659242757d', // Gearbox
      '0x8ef73f036feec873d0b2fd20892215df5b8bdd72',  // Gearbox
      '0xba0439088dc1e75f58e0a7c107627942c15cbb41', // Goldfinch: Senior Pool
      '0x4e5d9b093986d864331d88e0a13a616e1d508838',  // Goldfinch: Borrower
      '0xFE333f2c3c55138fAD556B6C1F1D9103c7268071', // Morpho
      '0xfbDEE8670b273E12b019210426E70091464b02Ab', // Morpho
      '0xF587f2e8AfF7D76618d3B6B4626621860FbD54e3', // Morpho
      '0xF2eFEBE45180C8c04edFdBfF3d88e58C9D61a03E', // Morpho
      '0xf24608E0CCb972b0b0f4A6446a0BBf58c701a026', // Morpho
      '0xeE8F4eC5672F09119b96Ab6fB59C27E1b7e44b61', // Morpho
      '0xED0A7A49f2228E01a3169C4A5a72a2EbFE8756Dc', // Morpho
      '0xeCE20f4083E043d16afA78451067ef3dAd201F9F', // Morpho
      '0xeC3B2CC4C6a8fC9a13620A91622483b56E2E6fD9', // Morpho
      '0xEbFA750279dEfa89b8D99bdd145a016F6292757b', // Morpho
      '0xE576EB9DA26c608217729C656c5B2eB3E4278af0', // Morpho
      '0xE0C98605f279e4D7946d25B75869c69802823763', // Morpho
      '0xdFF60F336a115aade8d9051E068FD4aeeeCCa901', // Morpho
      '0xDd195bc052f172a996d721B25d587A1ea5B8385D', // Morpho
      '0xdd0f28e19C1780eb6396170735D45153D261490d', // Morpho
      '0xdB90A4e973B7663ce0Ccc32B6FbD37ffb19BfA83', // Morpho
      '0xdA1F00d47054A1807f6bf2403Ce48a14d894A18b', // Morpho
      '0xD8a8daD19B1C804dF17D85809f8Fc39286a79938', // Morpho
      '0xd63070114470f685b75B74D60EEc7c1113d33a3D', // Morpho
      '0xcf0d2c68cde60C8827Ad901BA5Bfa3C6b42525ee', // Morpho
      '0xc43f5F199a055F38de4629dd14d18e69dAe9f29D', // Morpho
      '0xc28ca6bFA6C1dfEF94989DC0D0A862eff8d71065', // Morpho
      '0xC21DB71648B18C5B9E038d88393C9b254cf8eaC8', // Morpho
      '0xc1256Ae5FF1cf2719D4937adb3bbCCab2E00A2Ca', // Morpho
      '0xc0c5689e6f4D256E861F65465b691aeEcC0dEb12', // Morpho
      '0xC0A14627D6a23f70c809777CEd873238581C1032', // Morpho
      '0xc080f56504e0278828A403269DB945F6c6D6E014', // Morpho
      '0xBeEfDA19BC6114633FC17e6d074A6A2b472C756f', // Morpho
      '0xBEeFd1C0C6C1F7c94DC6b989DBA2E983A47A26A8', // Morpho
      '0xbEefc4aDBE58173FCa2C042097Fe33095E68C3D6', // Morpho
      '0xbEEFC01767ed5086f35deCb6C00e6C12bc7476C1', // Morpho
      '0xBEeFA28D5e56d41D35df760AB53B94D9FfD7051F', // Morpho
      '0xBEEFa260c2CE39122367cEAb0b4F94e6068cAcb6', // Morpho
      '0xbEEfa1aBfEbE621DF50ceaEF9f54FdB73648c92C', // Morpho
      '0xbEEfa1aBfEbE621DF50ceaEF9f54FdB73648c92C', // Morpho
      '0xBeEf796ae50ba5423857CAc27DD36369cfc8241b', // Morpho
      '0xBeEf11eCb698f4B5378685C05A210bdF71093521', // Morpho
      '0xbeEf094333AEdD535c130958c204E84f681FD9FA', // Morpho
      '0xbEeF087c8430C0f9dCBa39BA866Eb7c22200599B', // Morpho
      '0xBeEF086b8807Dc5E5A1740C5E3a7C4c366eA6ab5', // Morpho
      '0xbeEF07E929F84466a591De130e4154667214F491', // Morpho
      '0xbEeF06E7027EB8A1F0ab6ceF743542EA31b8492b', // Morpho
      '0xBEEf050ecd6a16c4e7bfFbB52Ebba7846C4b8cD4', // Morpho
      '0xbEEf050a7485865A7a8d8Ca0CC5f7536b7a3443e', // Morpho
      '0xbEef047a543E45807105E51A8BBEFCc5950fcfBa', // Morpho
      '0xBEef03f0BF3cb2e348393008a826538AaDD7d183', // Morpho
      '0xbeef033b4520267C5acFcb45414117b633fCb3Dd', // Morpho
      '0xbEEF02e5E13584ab96848af90261f0C8Ee04722a', // Morpho
      '0xBEEF01735c132Ada46AA9aA4c54623cAA92A64CB', // Morpho
      '0xbeeF010f9cb27031ad51e3333f9aF9C6B1228183', // Morpho
      '0xbEEf0075e03A5cE0D84d4ACcF3481363E0584F5c', // Morpho
      '0xBE40491F3261Fd42724F1AEb465796eb11c06ddF', // Morpho
      '0xBdD1a02e0042ee4B6a89856A8521f78A43Ef6A8C', // Morpho
      '0xBD596239F71ce6BA9993100fbD5Aff366C9366a1', // Morpho
      '0xbb819D845b573B5D7C538F5b85057160cfb5f313', // Morpho
      '0xB9C9158aB81f90996cAD891fFbAdfBaad733c8C6', // Morpho
      '0xB8C7F2a4B3bF76CC04bd55Ebc259b33a67b3b36d', // Morpho
      '0xB7890CEE6CF4792cdCC13489D36D9d42726ab863', // Morpho
      '0xB1A757A68D4a04a6B5A0F06d0cB4FD739048F614', // Morpho
      '0xAdcb88C776b97BC9F11f38729409fEe407a44BD9', // Morpho
      '0xA2Cac0023a4797b4729Db94783405189a4203AFc', // Morpho
      '0xa0E430870c4604CcfC7B38Ca7845B1FF653D0ff1', // Morpho
      '0xA02F5E93f783baF150Aa1F8b341Ae90fe0a772f7', // Morpho
      '0x9E9a74Ef35b74dfb61B778250304F4Fcb446f268', // Morpho
      '0x9AC43Dc33f7F60ffd874152Dff7C852c83f662A6', // Morpho
      '0x9a8bC3B04b7f3D87cfC09ba407dCED575f2d61D8', // Morpho
      '0x98cF0B67Da0F16E1F8f1a1D23ad8Dc64c0c70E0b', // Morpho
      '0x98b178F2495F58aA4A285ad363A97782B8EcfCEf', // Morpho
      '0x95EeF579155cd2C5510F312c8fA39208c3Be01a8', // Morpho
      '0x8eB67A509616cd6A7c1B3c8C21D48FF57df3d458', // Morpho
      '0x8E3C0A68F8065Dc666065f16cf902596A60d540e', // Morpho
      '0x8D1c8b59947E144cad164831a9b12d1030AFCa5A', // Morpho
      '0x8CB3649114051cA5119141a34C200D65dc0Faa73', // Morpho
      '0x8c3A6B12332a6354805Eb4b72ef619aEdd22BcdD', // Morpho
      '0x0d8775f648430679a709e98d2b0cb6250d2887ef', // Smart Credit
      '0x6b175474e89094c44da98b954eedeac495271d0f', // Smart Credit
      '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', // Smart Credit
      '0x514910771af9ca656af840dff83e8264ecf986ca', // Smart Credit
      '0x221657776846890989a759ba2973e427dff5c9bb', // Smart Credit
      '0x72e9D9038cE484EE986FEa183f8d8Df93f9aDA13', // Smart Credit
      '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84', // Smart Credit
      '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // Smart Credit
      '0xdAC17F958D2ee523a2206206994597C13D831ec7', // Smart Credit
      '0x6b175474e89094c44da98b954eedeac495271d0f', // Smart Credit
      '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', // Smart Credit
      '0x72e9D9038cE484EE986FEa183f8d8Df93f9aDA13', // Smart Credit
      '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // Smart Credit
      '0xdAC17F958D2ee523a2206206994597C13D831ec7', // Smart Credit
      '0x4A1819Ae5087EFd1Fb935676E486E4b4670a9F69', // Minterest: BDSystem Implementation
      '0xDbCEAF23fd639cd7cbc65f3D83EF8D6F90914093', // Minterest: BDSystem
      '0xb56413e766f5146da23889b259d628bB4505C010', // Minterest: BuybackDripper
      '0xF03877A75D93bd68A54131d89433024E79D2567F', // Minterest: Buyback
      '0xB23D96719c36a33946798c6FC77c3A7Fb535047F', // Minterest: ChainlinkPriceOracle
      '0x2B92cF5e62847384588c11a142b076F65Cbb5145', // Minterest: DeadDrop
      '0x38F81796428D41FeeD5CD824051c610714394814', // Minterest: EmissionBooster
      '0xf8A40e6fAb0EC769e466e43D03068aE30eF11bCD', // Minterest: Flasher
      '0xB3DbB6F16982bB149Bb4b7e1296bB7FeD652d80F', // Minterest: Interconnector
      '0x5F602942e6FFE126118f6EBa6235ee27D2513A14', // Minterest: Liquidation
      '0x41f4766B0368f43d1312f63350635eb155040832', // Minterest: mDAI
      '0xDFDAB67039dbe6CdEb2398b9df8C0eF5617A7728', // Minterest: NFT
      '0x17789a33956915700E6D80c85Ca2454C8C02dE88', // Minterest: MntFallbackPriceFeed
      '0x3B1FDA2692b261dE8aE079251C0c0e50CFA5de48', // Minterest: MntGovernor
      '0x149caC67F1cd5d80651E7c9Bb359ec285D821a05', // Minterest: Mnt
      '0x5ffdac6407e9904181449b570f23D194d01cAda1', // Minterest: MNTSource
      '0xcea138A2244454ae46C73e2cD22051a57027C2F9', // Minterest: MntTimelock
      '0x45e90AfE8112CbE940adb1436d89Fb9450815eeA', // Minterest: mUSDC
      '0xF629B7E362a282AD4D0018E1CB2DBd9D3576E4ff', // Minterest: mUSDT
      '0x87A25DfDCB7B4a60735d93C1B79C3596c7b3DE6b', // Minterest: mWBTC
      '0xf428189D73a7A17B8Eb8F5637654063edd728df8', // Minterest: mWETH
      '0xD05A8a917D4865C7ABD1b8B10b5443Db14b47925', // Minterest: RewardsHub
      '0xD13f50274a68ABF2384C79248ADc259b3777c081', // Minterest: Supervisor
      '0xf501dc2898f732B9Cedb1A3B2D9c3a20387Da0e9', // Minterest: Vesting
      '0x28C01147da488c84FF3Ffa3B92998f00786B9717', // Minterest: WeightAggregator
      '0xe7c6a0102Ef023dB77E8B16445DA94F12ae84f51', // Minterest: Whitelist
      '0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e', // YFI
      '0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852', // Uniswap V2: USDT-ETH
      '0x18084fba666a33d37592fa2633fd49a74dd93a88', // Fringe Finance: Lending Pool
      '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984', // UNI
      '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', // WBTC
      '0x3432b6a60d23ca0dfca7761b7ab56459d9c964d0', // FRX
      '0x3472a5a71965499acd81997a54bba8d852c6e53d', // BADGER
      '0x3845badade8e6dff049820680d1f14bd3903a5d0', // SAND
      '0x4691937a7508860f876c9c0a2a617e7d9e945d4b', // WOO
      '0x4d224452801aced8b2f0aebe155379bb5d594381', // APE
      '0x50327c6c5a14dcade707abad2e27eb517df87ab5', // Fringe Finance: Primary Lending Platform
      '0x514910771af9ca656af840dff83e8264ecf986ca', // LINK
      '0x5a98fcbea516cf06857215779fd812ca3bef1b32', // LDO
      '0x5e8422345238f34275888049021821e8e08caa1f', // PERL
      '0x5f98805a4e8be255a32880fdec7f6728c6568ba0', // LUSD
      '0x6810e776880c02933d47db1b9fc05908e5386b96', // GNO
      '0x6b175474e89094c44da98b954eedeac495271d0f', // DAI
      '0x6b3595068778dd592e39a122f4f5a5cf09c90fe2', // SUSHI
      '0x72e4f9f808c49a2a61de9c5896298920dc4eeea9', // Fringe Finance: Primary Market
      '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0', // MATIC
      '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0', // wstETH
      '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2', // MKR
      '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
      '0xa2cd3d43c775978a96bdbf12d733d5a1ed94fb18', // Fringe Finance: Primary Market Implementation
      '0xac3e018457b222d93114458476f3e3416abbe38f', // SWISE
      '0xae78736cd615f374d3085123a210448e74fc6393', // rETH
      '0xbbbbca6a901c926f240b89eacb641d8aec7aeafd', // LRC
      '0xbc396689893d065f41bc2c6ecbee5e0085233447', // PERP
      '0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f', // SNX
      '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // WETH
      '0xc18360217d8f7ab5e7c516566761ea12ce7f9d72', // ENS
      '0xc944e90c64b2c07662a292be6244bdf05cda44a7', // GRT
      '0xdac17f958d2ee523a2206206994597c13d831ec7', // USDT
      '0xdefa4e8a7bcba345f687a2f1456f5edd9ce97202', // Fringe Finance: Primary Market Proxy
      '0xe28b3b32b6c345a34ff64674606124dd5aceca30', // INJ
      '0xfaba6f8e4a5e8ab82f62fe7c39859fa577269be3', // Fringe Finance: Primary Market Implementation
      '0x304e02d700e6E37cb1E6D3D9e3c6be0539640327', // Unilend: Pool
      '0x4E34DD25Dbd367B1bF82E1B5527DBbE799fAD0d0', // Unilend: Pool
      '0x740fC8982b412e96e04b0d1bA7C66b0FE9F35427', // Unilend: Pool
      '0x68Fad04c9269eb781faac99fDC532FC26E69829a', // Unilend: Pool
      '0x67aa3ecc5831a65a5ba7be76bed3b5dc7db60796', // Venus
      '0x687a01ecf6d3907658f7a7c714749fac32336d1b', // Venus 
      '0xf522cd0360ef8c2ff48b648d53ea1717ec0f3ac3', // Venus
      '0x4e5d9b093986d864331d88e0a13a616e1d508838'  // Goldfinch: Borrower
    ];

    this.ENS_CONTRACTS = [
      '0xff252725f6122a92551a5fa9a6b6bf10eb0be035', // ENS: Bulk Renewal
      '0xfe89cc7abb2c4183683ab71653c4cdc9b02d44b7', // ENS: DAO Wallet
      '0xffc8ca4e83416b7e0443ff430cc245646434b647', // ENS: ENS Constitution Book Token
      '0xe65d8aaf34cb91087d1598e0a15b582f57f217d9', // ENS: Migration Subdomain Registrar
      '0xf7c83bd0c50e7a72b55a39fe0dabf5e3a330d749', // ENS: Short Name Claims
      '0x60c7c2a24b5e86c38639fd1586917a8fef66a56d', // ENS: Registrar Migration
      '0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85', // ENS: Base Registrar Implementation
      '0x690f0581ececcf8389c223170778cd9d029606f2', // ENS: Cold Wallet
      '0xa2c122be93b0074270ebee7f6b7292c7deb45047', // ENS: Default Reverse Resolver
      '0xa2f428617a523837d4adc81c67a296d42fd95e86', // ENS: DNS Registrar
      '0x314159265dd8dbb310642f98f50c066173c1259b', // ENS: Eth Name Service
      '0x323a76393544d5ecca80cd6ef2a560c6a395b7e3', // ENS: Governance
      '0x9b6d20f524367d7e98ed849d37fc662402dca7fb', // ENS: Mapper
      '0x911143d946ba5d467bfc476491fdb235fef4d667', // ENS: Multisig
      '0xd4416b13d2b3a9abae7acd5d6c2bbdbe25686401', // ENS: Name Wrapper
      '0xc1735677a60884abbcf72295e88d47764beda282', // ENS: Offchain Resolver
      '0x283af0b28c62c092c9727f1ee09c02ca627eb7f5', // ENS: Old ETH Registrar Controller
      '0x084b1c3c81545d370f3634392de611caabff8148', // ENS: Old Reverse Registrar 2
      '0xdaaf96c344f63131acadd0ea35170e7892d3dfba', // ENS: Public Resolver 1
      '0x4976fb03c32e5b8cfe2b6ccb31c09ba78ebaba41', // ENS: Public Resolver 2
      '0x00000000000c2e074ec69a0dfb2997ba6c7d2e1e', // ENS: Registry with Fallback
      '0x3671ae578e63fdf66ad4f3e12cc0c0d71ac7510c', // ENS: Reverse Records
      '0xa58e81fe9b61b5c3fe2afd33cf304c454abfc7cb', // ENS: Reverse Registrar
      '0xab528d626ec275e3fad363ff1393a41f581c5897', // ENS: Root
      '0xb9d374d0fe3d8341155663fae31b7beae0ae233a', // ENS: Stable Price Oracle
      '0xc32659651d137a18b79925449722855aa327231d', // ENS: Subdomain Registrar
      '0xb1377e4f32e6746444970823d5506f98f5a04201', // ENS: Token Streaming Contract
      '0xd7a029db2585553978190db5e85ec724aa4df23f', // ENS: Token Timelock
      '0x0904dac3347ea47d208f3fd67402d039a3b99859', // ENS: Wallet
      '0xb6e040c9ecaae172a89bd561c5f73e1c48d28cd9'  // ENS: Wallet 2
    ];
  }

  /**
   * Calculate active unique days score
   * @param {Array} transactions - Transaction history
   * @returns {Object} Score and details
   */
  calculateActiveDaysScore(transactions) {
    const uniqueDays = new Set(
      transactions.map(tx => new Date(tx.timeStamp * 1000).toDateString())
    ).size;

    let score = 0;
    if (uniqueDays > 180) score = 100;
    else if (uniqueDays > 90) score = 75;
    else if (uniqueDays >= 30) score = 50;
    else score = 25;

    return { score, value: uniqueDays };
  }

  /**
   * Calculate longest streak of consecutive days
   * @param {Array} transactions - Transaction history
   * @returns {Object} Score and details
   */
  calculateLongestStreakScore(transactions) {
    const dates = [...new Set(
      transactions
        .map(tx => new Date(tx.timeStamp * 1000).toDateString())
    )].sort();
    
    let maxStreak = 0;
    let currentStreak = 1;

    for (let i = 1; i < dates.length; i++) {
      const diff = Math.abs(
        (new Date(dates[i]) - new Date(dates[i-1])) / (1000 * 60 * 60 * 24)
      );
      
      if (diff === 1) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }

    let score = 0;
    if (maxStreak > 60) score = 100;
    else if (maxStreak > 30) score = 75;
    else if (maxStreak >= 10) score = 50;
    else score = 25;

    return { score, value: maxStreak };
  }

  /**
   * Calculate current streak days
   * @param {Array} transactions - Transaction history
   * @returns {Object} Score and details
   */
  calculateCurrentStreakScore(transactions) {
    const dates = [...new Set(
      transactions
        .map(tx => new Date(tx.timeStamp * 1000).toDateString())
    )].sort();
    
    let currentStreak = 1;
    const today = new Date().toDateString();
    
    for (let i = dates.length - 1; i > 0; i--) {
      const diff = Math.abs(
        (new Date(dates[i]) - new Date(dates[i-1])) / (1000 * 60 * 60 * 24)
      );
      
      if (diff === 1) currentStreak++;
      else break;
    }

    let score = 0;
    if (currentStreak > 30) score = 100;
    else if (currentStreak > 15) score = 75;
    else if (currentStreak >= 5) score = 50;
    else score = 25;

    return { score, value: currentStreak };
  }

  /**
   * Calculate activity period score
   * @param {Array} transactions - Transaction history
   * @returns {Object} Score and details
   */
  calculateActivityPeriodScore(transactions) {
    const firstTx = Math.min(...transactions.map(tx => parseInt(tx.timeStamp)));
    const lastTx = Math.max(...transactions.map(tx => parseInt(tx.timeStamp)));
    const monthsDiff = (lastTx - firstTx) / (60 * 60 * 24 * 30);

    let score = 0;
    if (monthsDiff > 12) score = 100;
    else if (monthsDiff > 6) score = 75;
    else if (monthsDiff >= 3) score = 50;
    else score = 25;

    return { score, value: Math.floor(monthsDiff) };
  }

  /**
   * Calculate bridge transactions score
   * @param {Array} transactions - Transaction history
   * @returns {Object} Score and details
   */
  calculateBridgeScore(transactions) {
    const bridgeInteractions = transactions.filter(tx => 
      this.BRIDGE_CONTRACTS.includes(tx.to.toLowerCase())
    ).length;

    let score = 0;
    if (bridgeInteractions > 10) score = 100;
    else if (bridgeInteractions > 5) score = 75;
    else if (bridgeInteractions > 2) score = 50;
    else if (bridgeInteractions > 0) score = 25;

    return { score, value: bridgeInteractions };
  }

  /**
   * Calculate lending/borrowing/staking score
   * @param {Array} transactions - Transaction history
   * @returns {Object} Score and details
   */
  calculateLendingScore(transactions) {
    const lendingInteractions = transactions.filter(tx =>
      this.LENDING_CONTRACTS.includes(tx.to.toLowerCase())
    ).length;

    let score = 0;
    if (lendingInteractions > 15) score = 100;
    else if (lendingInteractions > 7) score = 75;
    else if (lendingInteractions > 2) score = 50;
    else if (lendingInteractions > 0) score = 25;

    return { score, value: lendingInteractions };
  }

  /**
   * Calculate ENS interactions score
   * @param {Array} transactions - Transaction history
   * @returns {Object} Score and details
   */
  calculateENSScore(transactions) {
    const ensInteractions = transactions.filter(tx =>
      this.ENS_CONTRACTS.includes(tx.to.toLowerCase())
    ).length;

    let score = 0;
    if (ensInteractions > 15) score = 100;
    else if (ensInteractions > 7) score = 75;
    else if (ensInteractions > 3) score = 50;
    else if (ensInteractions > 0) score = 25;

    return { score, value: ensInteractions };
  }

  /**
   * Calculate contract deployment score
   * @param {Array} transactions - Transaction history
   * @returns {Object} Score and details
   */
  calculateContractDeploymentScore(transactions) {
    const deployments = transactions.filter(tx =>
      tx.to === '' && tx.input.length > 2
    ).length;

    let score = 0;
    if (deployments > 7) score = 100;
    else if (deployments > 3) score = 75;
    else if (deployments > 1) score = 50;
    else if (deployments === 1) score = 25;

    return { score, value: deployments };
  }

  /**
   * Calculate final humanity score
   * @param {string} address - Wallet address
   * @returns {Promise<Object>} Final score and metadata
   */
  async calculateHumanityScore(address) {
    debugLog('Fetching transaction history for address:', address);
    const txHistory = await etherscanService.getTransactionHistory(address);
    debugLog('Transaction count:', txHistory.length);
    
    const activeDays = this.calculateActiveDaysScore(txHistory);
    debugLog('Active Days Metric:', activeDays);
    
    const longestStreak = this.calculateLongestStreakScore(txHistory);
    debugLog('Longest Streak Metric:', longestStreak);
    
    const currentStreak = this.calculateCurrentStreakScore(txHistory);
    debugLog('Current Streak Metric:', currentStreak);
    
    const activityPeriod = this.calculateActivityPeriodScore(txHistory);
    debugLog('Activity Period Metric:', activityPeriod);
    
    const bridgeScore = this.calculateBridgeScore(txHistory);
    debugLog('Bridge Score Metric:', bridgeScore);
    
    const lendingScore = this.calculateLendingScore(txHistory);
    debugLog('Lending Score Metric:', lendingScore);
    
    const ensScore = this.calculateENSScore(txHistory);
    debugLog('ENS Score Metric:', ensScore);
    
    const deploymentScore = this.calculateContractDeploymentScore(txHistory);
    debugLog('Contract Deployment Metric:', deploymentScore);
    
    // Calculate average score
    const scores = [
      activeDays.score,
      longestStreak.score,
      currentStreak.score,
      activityPeriod.score,
      bridgeScore.score,
      lendingScore.score,
      ensScore.score,
      deploymentScore.score
    ];
    
    const finalScore = Math.floor(
      scores.reduce((a, b) => a + b, 0) / scores.length
    );

    return {
      metadata: {
        address,
        metrics: {
          activeDays: {
            value: activeDays.value,
            score: activeDays.score
          },
          longestStreak: {
            value: longestStreak.value,
            score: longestStreak.score
          },
          currentStreak: {
            value: currentStreak.value,
            score: currentStreak.score
          },
          activityPeriod: {
            value: activityPeriod.value,
            score: activityPeriod.score
          },
          bridgeInteractions: {
            value: bridgeScore.value,
            score: bridgeScore.score
          },
          lendingInteractions: {
            value: lendingScore.value,
            score: lendingScore.score
          },
          ensInteractions: {
            value: ensScore.value,
            score: ensScore.score
          },
          contractDeployments: {
            value: deploymentScore.value,
            score: deploymentScore.score
          }
        },
        timestamp: new Date().toISOString()
      },
      onchainScore: finalScore
    };
  }
}

module.exports = new HumanityScoreService(); 