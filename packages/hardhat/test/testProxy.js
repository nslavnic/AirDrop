const { ethers } = require('hardhat');
const { expect } = require('chai');
const chainId = '31337';


describe('FactoryTestsProxy', function () {
    describe("Create collection ERC1155 Proxy", function () {
      before(async function() {
        this.accounts = await ethers.getSigners();
    
        const Factory = await ethers.getContractFactory("Factory1155Proxy");
        this.factory1155 = await Factory.deploy();
    
        await this.factory1155.deployed();
      });

      it("call createCollectionERC1155Proxy method", async function () {
          const tx = await this.factory1155.createCollectionERC1155('NFT collection', 'NFT', "https://ipfs.io/ipfs/QmaeZy3rgdecYhY3TBVc2ChRd76R26ux11M8G9Pn8bmjih/", this.accounts[1].address, this.accounts[1].address);

          const { events } = await tx.wait()
          const { address } = events?.find(Boolean);

          const proxyToken = await hre.ethers.getContractFactory('ERC1155Sample');
          let instance = proxyToken.attach(address);

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

          await expect(instance.connect(this.accounts[2]).redeem(voucher, this.accounts[1].address, signature))
          await expect(instance.connect(this.accounts[2]).redeem(voucher, this.accounts[1].address, signature)).to.be.revertedWith("Token already minted");
          //await expect(await instance.ownerOf(1)).to.equal(this.accounts[2].address);

          // Testing swap to V2

            const v2ContractFactory= await hre.ethers.getContractFactory('ERC1155Sample2');
            const v2Contract = await v2ContractFactory.deploy();
            await v2Contract.deployed();
            console.log("V2contract: " + v2Contract.address);
            //
            await instance.connect(this.accounts[1]).upgradeTo(v2Contract.address);
            instance = v2ContractFactory.attach(v2Contract.address);
            await expect(await instance.sayOne()).to.equal(1);

      })
        it("call setImplem method", async function () {
            const tx = await this.factory1155.createCollectionERC1155('NFT collection', 'NFT', "https://ipfs.io/ipfs/QmaeZy3rgdecYhY3TBVc2ChRd76R26ux11M8G9Pn8bmjih/", this.accounts[1].address, this.accounts[1].address);

            var { events } = await tx.wait()
            var { address } = events?.find(Boolean);
  
            const proxyToken = await hre.ethers.getContractFactory('ERC1155Sample');
            let instance1 = proxyToken.attach(address);

            // Pass to V2
            const v2ContractFactory= await hre.ethers.getContractFactory('ERC1155Sample2');
            const v2Contract = await v2ContractFactory.deploy();
            await v2Contract.deployed();
            console.log("V2contract: " + v2Contract.address);

            await this.factory1155.setTokenImpl(v2Contract.address);

            const tx2 = await this.factory1155.createCollectionERC1155('NFT collection', 'NFT', "https://ipfs.io/ipfs/QmaeZy3rgdecYhY3TBVc2ChRd76R26ux11M8G9Pn8bmjih/", this.accounts[1].address, this.accounts[1].address);

            var { events } = await tx2.wait()
            var { address } = events?.find(Boolean);
  
            const proxyToken2 = await hre.ethers.getContractFactory('ERC1155Sample2');
            const instance2 = proxyToken2.attach(address);
            await expect(await instance2.sayOne()).to.equal(1);

            instance1 = proxyToken2.attach(instance1.address);
            await expect(instance1.sayOne()).to.be.reverted;
        })
    })
  });