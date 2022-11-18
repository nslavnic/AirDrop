const { ethers } = require('hardhat');
const { task } = require('hardhat/config');

const chainId = '31337';

task("signature", "Signing voucher with datas")
  .addPositionalParam("tokenid", "Id of the NFT token")
  .addPositionalParam("uri", "IPFS uri")
  .addPositionalParam("to", "The account's address that receive token")
  .setAction(async (taskArgs) => {
// const main = async() => {
    /*
    {"sc_address":"0x219050cbcdaf52c28dc9631d162f3166e7db9601", "to":"0x2cfa08bb98d5a3560f553a8d009729e12507b7b6", "tokenId":1, "uri":"ipfs"}
    */
   console.log((await ethers.getContract("POC_V3_collection")).address);
   
    const sc_address = (await ethers.getContract("POC_V3_collection")).address;
    // const tokenId = 2 ;
    // const uri = "ipfs";
    // const to = "0x2cfa08bb98d5a3560f553a8d009729e12507b7b6";

    this.accounts = await ethers.getSigners();

    const voucher = { sc_address, to, tokenId, uri }    

    const sign = await this.accounts[0]._signTypedData(
      // Domain
      {
        name: 'LazyNFT-Voucher',
        version: '1.0.0',
        verifyingContract: sc_address,
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
    console.log("test");
    console.log("The signature is :", sign);  
});

// main();
