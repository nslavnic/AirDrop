const { ethers } = require('hardhat');
const { expect } = require('chai');
const chainId = '31337';


describe('FactoryTestsBeacons', function () {
    describe("Create collection ERC1155 Beacons", function () {
      before(async function() {
        this.accounts = await ethers.getSigners();
  
        const v1ContractFactory = await hre.ethers.getContractFactory('ERC1155Sample');
        const v1Contract = await v1ContractFactory.deploy();

        const Factory = await ethers.getContractFactory("Factory1155Beacon");
        this.factory1155 = await Factory.deploy(v1Contract.address);
    
        await this.factory1155.deployed();
      });

      it("call createCollectionERC1155Beacons method", async function () {
          const tx = await this.factory1155.createCollectionERC1155('NFT collection', 'NFT', "https://ipfs.io/ipfs/QmaeZy3rgdecYhY3TBVc2ChRd76R26ux11M8G9Pn8bmjih/", this.accounts[1].address, this.accounts[1].address);

          const { events } = await tx.wait()
          const { address } = events?.find(Boolean);

          const proxyToken = await hre.ethers.getContractFactory('ERC1155Sample');
          const instance = proxyToken.attach(address);

          console.log('clone address : ' + instance.address);

          //Test voucher
          const sc_address = String(instance.address);
          const tokenId = 1;
          const uri = "https://ipfs.io/ipfs/QmaeZy3rgdecYhY3TBVc2ChRd76R26ux11M8G9Pn8bmjih/";
          let to = String(this.accounts[2].address);
          let amount = 1;
          let nonce = 1;
  
          let voucher = { sc_address, to, tokenId, amount, uri, nonce }
  
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

      })

    })

  });