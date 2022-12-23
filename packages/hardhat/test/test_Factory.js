const { ethers } = require('hardhat');
const { expect } = require('chai');
const chainId = '31337';


describe('FactoryTests', function () {


    describe("Create collection ERC1155", function () {
      before(async function() {
        this.accounts = await ethers.getSigners();
    
        const Factory = await ethers.getContractFactory("Factory1155");
        this.factory1155 = await Factory.deploy();
    
        await this.factory1155.deployed();
  
        this.erc1155 = (await ethers.getContractFactory("ERC1155Sample"));
      });

      it("call createCollectionERC1155 method", async function () {
          const tx = await this.factory1155.createCollectionERC1155('NFT collection', 'NFT', "https://ipfs.io/ipfs/QmaeZy3rgdecYhY3TBVc2ChRd76R26ux11M8G9Pn8bmjih/", this.accounts[1].address, this.accounts[1].address);

          const { events } = await tx.wait()
          const { address } = events?.find(Boolean);

          const instance = this.erc1155.attach(address);

          console.log(address);

          /*
        address sc_address;
        address to;
        uint256 tokenId;
        uint256 amount;
        string uri;*/
          //Test voucher
          const sc_address = String(instance.address);
          console.log(sc_address);
          const tokenId = 1;
          const uri = "https://ipfs.io/ipfs/QmaeZy3rgdecYhY3TBVc2ChRd76R26ux11M8G9Pn8bmjih/";
          let to = String(this.accounts[2].address);
          let amount = 1;
          let nonce = 1;
  
          let voucher = { sc_address, to, tokenId, amount, uri, nonce }

          console.log("contract address : ", instance.address);
  
          const signature = await this.accounts[1]._signTypedData(
            // Domain
            {
              name: 'LazyNFT-Voucher',
              version: '1.0.0',
              verifyingContract: instance.address,
              chainId: chainId,
            },
            // Types
            {
              NFTVoucher: [
                  {name: "sc_address", type: "address"},
                  {name: "to", type: "address"},
                  {name: "tokenId", type: "uint256"},
                  {name: "amount", type: "uint256"},
                  {name: "uri", type: "string"},
                  {name: "nonce", type: "uint256"},
              ],
            },
            // Value
            voucher,
          );
          await expect(instance.connect(this.accounts[3]).redeem(voucher, this.accounts[3].address, signature)).to.be.revertedWith("Signer not minter");

          await expect(instance.connect(this.accounts[2]).redeem(voucher, this.accounts[1].address, signature)).to.be.not.reverted;
          await expect(instance.connect(this.accounts[2]).redeem(voucher, this.accounts[1].address, signature)).to.be.revertedWith("Token already minted");
          //await expect(await instance.ownerOf(1)).to.equal(this.accounts[2].address);

          // ERROR : UN UTILISATEUR PEUT MINT 1 SEUL FOIS AVEC UN VOUCHER !!!!!!!!!!
      })

    })
  
    describe("Create collection ERC721", function () {
      before(async function() {
        this.accounts = await ethers.getSigners();
    
        const Factory = await ethers.getContractFactory("Factory721");
        this.factory721 = await Factory.deploy();
    
        await this.factory721.deployed();
  
        this.erc721 = (await ethers.getContractFactory("ERC721Sample"));

        console.log("End of creation ");
      });

      it("call createCollectionERC721 method", async function () {
        console.log(await this.factory721.owner);
          const tx = await this.factory721.createCollectionERC721('NFT collection', 'NFT', this.accounts[1].address, this.accounts[0].address, "ipfs://QmYEaHmR3U8ADASGzsGdvh3vW7ZUWU1URPCXYCXV8wnaQ9");

          const { events } = await tx.wait()
          const { address } = events?.find(Boolean);

          const instance = this.erc721.attach(address);

          //Test voucher
          const sc_address = String(instance.address);
          console.log(sc_address);
          const tokenId = 1;
          const uri = "ipfs://QmYEaHmR3U8ADASGzsGdvh3vW7ZUWU1URPCXYCXV8wnaQ9";
          let to = String(this.accounts[2].address);
  
          let voucher = { sc_address, to, tokenId, uri }

          console.log("contract address : ", instance.address);
  
          const signature = await this.accounts[1]._signTypedData(
            // Domain
            {
              name: 'LazyNFT-Voucher',
              version: '1.0.0',
              verifyingContract: instance.address,
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
          await expect(instance.connect(this.accounts[3]).redeem(voucher, this.accounts[3].address, signature)).to.be.revertedWith("Signer not minter");

          await expect(instance.connect(this.accounts[2]).redeem(voucher, this.accounts[1].address, signature)).to.be.not.reverted;
          await expect(instance.connect(this.accounts[2]).redeem(voucher, this.accounts[1].address, signature)).to.be.revertedWith("ERC721: token already minted");

          await expect(await instance.ownerOf(1)).to.equal(this.accounts[2].address);
      })

    })
  });