// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";


contract ERC1155Sample is ERC1155, EIP712, AccessControl {

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

    Addresses public addresses;
    
    struct NFTVoucher {
        address sc_address;
        address to;
        uint256 tokenId;
        uint256 amount;
        string uri;
    }

    struct Addresses {
        address recoveryAddress;
        address collectionOwnerAddress;
        address minterAddress;
    }

    constructor(
        string memory _name,
        string memory _symbol,
        string memory _tokenMetadataURI,
        Addresses memory _addresses
    ) ERC1155("") EIP712(SIGNING_DOMAIN, SIGNATURE_VERSION) {
        // grant all roles
        _grantRole(OWNER_ROLE,_addresses.collectionOwnerAddress);
        _grantRole(MINTER_ROLE,_addresses.minterAddress);

        name = _name;
        symbol = _symbol;
        // format : "https://ipfs.io/ipfs/bafybeihjjkwdrxxjnuwevlqtqmh3iegcadc32sio4wmo7bv2gbf34qs34a/{id}.json"
        _setURI(_tokenMetadataURI);
        addresses = _addresses;
    }

    function uri(
    uint256 _id
    ) public view returns (string memory) {
        require(_exists(_id), "ERC721Tradable#uri: NONEXISTENT_TOKEN");
        return Strings.strConcat(
        baseMetadataURI,
        Strings.uint2str(_id)
    );
    }    
    function setURI(string memory newuri) public onlyRole(OWNER_ROLE) {
        _setURI(newuri);
    }

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
        require(verify(voucher, signer, signature), "Invalid signature");
        require(hasRole(MINTER_ROLE, signer), "Signer not minter");
        require(voucher.sc_address == address(this), "Invalid smart contract");
        _mint(voucher.to, voucher.tokenId, voucher.amount, '0x');

    }

  function _hash(NFTVoucher calldata voucher) internal view returns (bytes32) {
    return _hashTypedDataV4(keccak256(abi.encode(
      keccak256("NFTVoucher(address sc_address,address to,uint256 tokenId,uint256 amount)"),
      voucher.sc_address,
      voucher.to,
      voucher.amount,
      voucher.tokenId
    )));
  }

    function verify(NFTVoucher calldata voucher, address signer, bytes calldata signature)
    public view returns (bool)
    {
        bytes32 digest = _hash(voucher);
        return (SignatureChecker.isValidSignatureNow(signer, digest, signature));
    }

    function _exists(uint256 _id)
    internal view returns (bool) {
        return creators[_id] != address(0);
    }

    // The following functions are overrides required by Solidity.
    function supportsInterface(bytes4 interfaceId)
    public view override(ERC1155, AccessControl) returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

}