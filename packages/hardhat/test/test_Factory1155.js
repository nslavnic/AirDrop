const { ethers } = require('hardhat');
const { expect } = require('chai');
const chainId = '31337';


describe('FactoryTests', function () {
    before(async function() {
      this.accounts = await ethers.getSigners();
  
      const Factory = await ethers.getContractFactory("Factory1155");
      this.factory1155 = await Factory.deploy();
  
      await this.factory1155.deployed();

      this.erc1155 = (await ethers.getContractFactory("ERC1155Sample"));

      //console.log(await this.factory1155.getTokenImpl());
      
      //expect(await this.factory1155.owner).to.be.equal(this.accounts[0].address);
    });

    describe("Create collection ERC1155", function () {
        it("call createCollectionERC1155 method", async function () {
            const tx = await this.factory1155.createCollectionERC1155('NFT collection', 'NFT', "https://ipfs.io/ipfs/QmaeZy3rgdecYhY3TBVc2ChRd76R26ux11M8G9Pn8bmjih/", this.accounts[0].address, this.accounts[0].address);

            const { events } = await tx.wait()
            const { address } = events?.find(Boolean);

            const instance = this.erc1155.attach(address);

            console.log(address);
            //console.log(instance);
        })
    })
  
    // describe('Mint all elements', function () {
    //   before(async function() {
    //       const Registry = await ethers.getContractFactory('POC_V3_collection');
    //       this.registry = await Registry.deploy();
      
    //       await this.registry.deployed();        
    //       await this.registry.grantRole(await this.registry.MINTER_ROLE(), this.smartwallet.address);
    //       await this.registry.grantRole(await this.registry.MINTER_ROLE(), this.accounts[1].address);
    //   });
    //   it('element', async function () {
    //       const sc_address = String(this.registry.address);
    //       const tokenId = 1;
    //       const uri = "ipfs://QmYEaHmR3U8ADASGzsGdvh3vW7ZUWU1URPCXYCXV8wnaQ9";
    //       let to = String(this.accounts[2].address);
  
    //       let voucher = { sc_address, to, tokenId, uri }
    //       console.log(voucher);
  
    //       console.log("contract address : ", this.registry.address);
          
  
    //       const signature = await this.accounts[1]._signTypedData(
    //         // Domain
    //         {
    //           name: 'LazyNFT-Voucher',
    //           version: '1.0.0',
    //           verifyingContract: this.registry.address,
    //           chainId: chainId,
    //         },
    //         // Types
    //         {
    //           NFTVoucher: [
    //               {name: "sc_address", type: "address"},
    //               {name: "to", type: "address"},
    //               {name: "tokenId", type: "uint256"},
    //               {name: "uri", type: "string"},
    //           ],
    //         },
    //         // Value
    //         voucher,
    //       );
  
    //       await expect(this.registry.connect(this.accounts[2]).redeem(voucher, this.accounts[1].address, signature)).to.be.not.reverted;
          
    //       console.log(await this.registry.ownerOf(1));
  
    //       to = String(this.accounts[2].address);
    //       voucher = { sc_address, to, tokenId, uri }
    //       const signature2 = await this.accounts[1]._signTypedData(
    //         // Domain
    //         {
    //           name: 'LazyNFT-Voucher',
    //           version: '1.0.0',
    //           verifyingContract: this.registry.address,
    //           chainId: chainId,
    //         },
    //         // Types
    //         {
    //           NFTVoucher: [
    //               {name: "sc_address", type: "address"},
    //               {name: "to", type: "address"},
    //               {name: "tokenId", type: "uint256"},
    //               {name: "uri", type: "string"},
    //           ],
    //         },
    //         // Value
    //         voucher,
    //       );
    //       await expect(this.registry.connect(this.accounts[3]).redeem({ sc_address, to, tokenId, uri }, this.accounts[1].address, signature2)).to.be.revertedWith("ERC721: token already minted");
          
    //     });
    //   });
  
  });