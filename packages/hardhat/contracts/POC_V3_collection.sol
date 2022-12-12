// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "hardhat/console.sol";


contract POC_V3_collection is ERC721, EIP712, ERC721URIStorage, AccessControl {
    string private constant SIGNING_DOMAIN = "LazyNFT-Voucher";
    string private constant SIGNATURE_VERSION = "1.0.0";
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");


    //Testing GraphQl
    event SetVoucher(address sender, string voucher);

    string public testvoucher = "Building Unstoppable Apps!!!";

    function setVoucher(string memory newVoucher) public payable {
        testvoucher = newVoucher;
        console.log(msg.sender,"set purpose to",testvoucher);
        emit SetVoucher(msg.sender, testvoucher);
    }
    
    struct NFTVoucher {
        address sc_address;
        address to;
        uint256 tokenId;
        string uri;
    }

    constructor() ERC721("POC V3 Collection", "PVC") EIP712(SIGNING_DOMAIN, SIGNATURE_VERSION){
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        console.log(address(this));
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function _baseURI() internal pure override returns (string memory) {
        return "";
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function redeem(NFTVoucher calldata voucher, address signer, bytes calldata signature)
    external {
        require(verify(voucher, signer, signature), "Invalid signature");
        require(hasRole(MINTER_ROLE, signer), "Signer not minter");
        require(voucher.sc_address == address(this), "Invalid smart contract");
        _safeMint(voucher.to, voucher.tokenId);
        _setTokenURI(voucher.tokenId, voucher.uri);

    }

  function _hash(NFTVoucher calldata voucher) internal view returns (bytes32) {
    return _hashTypedDataV4(keccak256(abi.encode(
      keccak256("NFTVoucher(address sc_address,address to,uint256 tokenId,string uri)"),
      voucher.sc_address,
      voucher.to,
      voucher.tokenId,
      keccak256(bytes(voucher.uri))
    )));
  }

    function verify(NFTVoucher calldata voucher, address signer, bytes calldata signature)
    public view returns (bool)
    {
        bytes32 digest = _hash(voucher);
        return (SignatureChecker.isValidSignatureNow(signer, digest, signature));
    }
    
}
