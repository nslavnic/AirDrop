// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/draft-EIP712Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";


contract ERC1155Sample is Initializable, ERC1155Upgradeable, EIP712Upgradeable, AccessControlUpgradeable {

    bytes32 public constant OWNER_ROLE = keccak256("OWNER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    string private constant SIGNING_DOMAIN = "LazyNFT-Voucher";
    string private constant SIGNATURE_VERSION = "1.0.0";

    string public name;
    string public symbol;
    uint256[] public prices;
    uint256[] public supplies;
    uint256[] public totalSupplies;
    uint256[] public maxPerTransactions;

    /// @dev toggle for api mints
    bool public allowBuy;

    /// @dev metadata info
    string public contractURI;
// https://etherscan.io/address/0x6b4020ed97c3c7bd69ac7aac49f780574e905508#code
    address public collectionOwnerAddress;
    address public minterAddress;

    string public tokenMetadataURI;

    mapping(uint256 => bool) minted;
    
    struct NFTVoucher {
        address sc_address;
        address to;
        uint256 tokenId;
        uint256 amount;
        string uri;
        uint256 nonce;
    }

    function initialize(
        string memory _name,
        string memory _symbol,
        string memory _tokenMetadataURI,
        address _collectionOwnerAddress,
        address _minterAddress) public initializer {

        //initialization
        __ERC1155_init("");
        __EIP712_init(SIGNING_DOMAIN, SIGNATURE_VERSION);
        __AccessControl_init();

        // grant all roles
        _grantRole(OWNER_ROLE, _collectionOwnerAddress);
        _grantRole(MINTER_ROLE, _minterAddress);

        //set addresses
        collectionOwnerAddress = _collectionOwnerAddress;
        minterAddress = _minterAddress;

        name = _name;
        symbol = _symbol;
        // format : "https://ipfs.io/ipfs/QmaeZy3rgdecYhY3TBVc2ChRd76R26ux11M8G9Pn8bmjih/{id}.json"
        _setURI(_tokenMetadataURI);
        tokenMetadataURI = _tokenMetadataURI;
    }

    function TokenUri(uint256 _tokenid) public view returns (string memory) {
        return string(
            abi.encodePacked(
                uri(_tokenid),
                Strings.toString(_tokenid),".json"
            )
        );
    }

    // function setURI(string memory newuri) public onlyRole(OWNER_ROLE) {
    //     _setURI(newuri);
    // }

    function mint(address account, uint256 id, uint256 amount, bytes memory data)
        public
        onlyRole(MINTER_ROLE)
    {
        _mint(account, id, amount, data);
    }

    function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data)
        public
        onlyRole(MINTER_ROLE)
    {
        _mintBatch(to, ids, amounts, data);
    }


    function redeem(NFTVoucher calldata voucher, address signer, bytes calldata signature)
    external {
        require(hasRole(MINTER_ROLE, signer), "Signer not minter");
        require(verify(voucher, signer, signature), "Invalid signature");
        require(voucher.sc_address == address(this), "Invalid smart contract");
        require(keccak256(abi.encodePacked(voucher.uri)) == keccak256(abi.encodePacked(tokenMetadataURI)), "Invalid uri in signature");
        _mint(voucher.to, voucher.tokenId, voucher.amount, '0x');
        minted[voucher.nonce] = true;
    }

  function _hash(NFTVoucher calldata voucher) internal view returns (bytes32) {
    return _hashTypedDataV4(keccak256(abi.encode(
      keccak256("NFTVoucher(address sc_address,address to,uint256 tokenId,uint256 amount,string uri,uint256 nonce)"),
      voucher.sc_address,
      voucher.to,
      voucher.tokenId,
      voucher.amount,
      keccak256(bytes(voucher.uri)),
      voucher.nonce
    )));
  }

    function verify(NFTVoucher calldata voucher, address signer, bytes calldata signature)
    public view returns (bool)
    {
        require(!minted[voucher.nonce], "Token already minted");
        bytes32 digest = _hash(voucher);
        return (SignatureChecker.isValidSignatureNow(signer, digest, signature));
    }

    // The following functions are overrides required by Solidity.
    function supportsInterface(bytes4 interfaceId)
    public view override(ERC1155Upgradeable, AccessControlUpgradeable) returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

}