// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/draft-EIP712Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "hardhat/console.sol";


contract ERC721Sample is Initializable, ERC721Upgradeable, EIP712Upgradeable, ERC721URIStorageUpgradeable, AccessControlUpgradeable {
    string private constant SIGNING_DOMAIN = "LazyNFT-Voucher";
    string private constant SIGNATURE_VERSION = "1.0.0";
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant OWNER_ROLE = keccak256("OWNER_ROLE");
    
    address public collectionOwnerAddress;
    address public minterAddress;

    string public MetadataUri;
    
    /// @dev metadata info
    string public contractUri;

    struct NFTVoucher {
        address sc_address;
        address to;
        uint256 tokenId;
        string uri;
    }

    function initialize(string memory _name, string memory _symbol, address _minterAddress, address _collectionOwnerAddress, string memory _MetadataUri) public initializer{
        //Init contracts
        __ERC721_init(_name, _symbol);
        __EIP712_init(SIGNING_DOMAIN, SIGNATURE_VERSION);
        __AccessControl_init();

        // grant all roles
        _grantRole(OWNER_ROLE, _collectionOwnerAddress);
        _grantRole(MINTER_ROLE, _minterAddress);

        //set addresses
        collectionOwnerAddress = _collectionOwnerAddress;
        minterAddress = _minterAddress;

        //set Uri
        MetadataUri = _MetadataUri;

    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721Upgradeable, AccessControlUpgradeable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function _baseURI() internal view override returns (string memory) {
        return MetadataUri;
    }

    function _burn(uint256 tokenId) internal override(ERC721Upgradeable, ERC721URIStorageUpgradeable) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721Upgradeable, ERC721URIStorageUpgradeable) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function redeem(NFTVoucher calldata voucher, address signer, bytes calldata signature)
    external {
        require(hasRole(MINTER_ROLE, signer), "Signer not minter");
        require(verify(voucher, signer, signature), "Invalid signature");
        require(voucher.sc_address == address(this), "Invalid smart contract");
        //require(keccak256(abi.encodePacked(voucher.uri)) == keccak256(abi.encodePacked(MetadataUri)), "Invalid uri in signature");
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

    function contractURI() public view returns (string memory) {
        return contractUri;
    }

    function setContractURI(string memory newContractURI) public onlyRole(OWNER_ROLE) {
        contractUri = newContractURI;
    }
    
}
