const { ethers } = require('hardhat');
const { expect } = require('chai');
const tokens = require('./tokens.json');
const chainId = '31337';



async function deploy(name) {
  const Contract = await ethers.getContractFactory(name);
  return await Contract.deploy().then(f => f.deployed());
}

describe('ERC721LazyMintWith712SignatureChecker', function () {
  before(async function() {
    this.accounts = await ethers.getSigners();

    const Smartwallet = await ethers.getContractFactory("SmartWallet");
    this.smartwallet = await Smartwallet.deploy(this.accounts[1].address);

    await this.smartwallet.deployed();
    
    expect(await this.smartwallet.owner()).to.be.equal(this.accounts[1].address);
  });

  describe('Mint all elements', function () {
    before(async function() {
        const Registry = await ethers.getContractFactory('POC_V3_collection');
        this.registry = await Registry.deploy();
    
        await this.registry.deployed();        
        await this.registry.grantRole(await this.registry.MINTER_ROLE(), this.smartwallet.address);
        await this.registry.grantRole(await this.registry.MINTER_ROLE(), this.accounts[1].address);
    });
    it('element', async function () {
        const sc_address = String(this.registry.address);
        const tokenId = 1;
        const uri = "ipfs://QmYEaHmR3U8ADASGzsGdvh3vW7ZUWU1URPCXYCXV8wnaQ9";
        const to = String(this.accounts[2].address);

        const voucher = { sc_address, to, tokenId, uri }

        console.log("contract address : ", this.registry.address);
        

        const signature = await this.accounts[1]._signTypedData(
          // Domain
          {
            name: 'LazyNFT-Voucher',
            version: '1.0.0',
            verifyingContract: this.registry.address,
            chainId: chainId,
          },
          // Types
          {
            NFTVoucher: [
                {name: "sc_address", type: "address"},
                {name: "to", type: "address"},
                {name: "tokenId", type: "uint256"},
                {name: "uri", type: "string"},
            ],
          },
          // Value
          voucher,
        );

        await expect(this.registry.connect(this.accounts[2]).redeem(voucher, this.accounts[1].address, signature)).to.be.not.reverted;
        
        // await expect(this.registry.connect(this.accounts[2]).redeem(voucher, this.accounts[1], signature))
        //   .to.emit(this.registry, 'Transfer')
        //   .withArgs(ethers.constants.AddressZero, to, tokenId);
      });
    });
/*
  describe('Duplicate mint', function () {
    before(async function() {
      this.registry = await deploy('POC_V3_collection');
      await this.registry.grantRole(await this.registry.MINTER_ROLE(), this.smartwallet.address);

      this.token = {};
      [ this.token.tokenId, this.token.account ] = Object.entries(tokens).find(Boolean);
      this.token.signature = await this.accounts[1]._signTypedData(
        // Domain
        {
            name: 'LazyNFT-Voucher',
            version: '1.0.0',
            chainId: this.chainId,
            verifyingContract: this.registry.address,
        },
        // Types
        {
            NFTVoucher: [
                {name: "sc_address", type: "address"},
                {name: "to", type: "address"},
                {name: "tokenId", type: "uint256"},  
              ],
        },
        // Value
        this.token,
      );
    });

    it('mint once - success', async function () {
      await expect(this.registry.redeem(this.token.account, this.token.tokenId, this.smartwallet.address, this.token.signature))
        .to.emit(this.registry, 'Transfer')
        .withArgs(ethers.constants.AddressZero, this.token.account, this.token.tokenId);
    });

    it('mint twice - failure', async function () {
      await expect(this.registry.redeem(this.token.account, this.token.tokenId, this.smartwallet.address, this.token.signature))
        .to.be.revertedWith('ERC721: token already minted');
    });
  });

  describe('Frontrun', function () {
    before(async function() {
        this.registry = await deploy('POC_V3_collection');
        await this.registry.grantRole(await this.registry.MINTER_ROLE(), this.smartwallet.address);

      this.token = {};
      [ this.token.tokenId, this.token.account ] = Object.entries(tokens).find(Boolean);
      this.token.signature = await this.accounts[1]._signTypedData(
        // Domain
        {
            name: 'LazyNFT-Voucher',
            version: '1.0.0',
            chainId: this.chainId,
            verifyingContract: this.registry.address,
        },
        // Types
        {
            NFTVoucher: [
                {name: "sc_address", type: "address"},
                {name: "to", type: "address"},
                {name: "tokenId", type: "uint256"},  
              ],
        },
        // Value
        this.token,
      );
    });

    it('Change owner - success', async function () {
      await expect(this.registry.redeem(this.accounts[0].address, this.token.tokenId, this.smartwallet.address, this.token.signature))
        .to.be.revertedWith('Invalid signature');
    });
  });*/
});