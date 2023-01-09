// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "./ERC1155Sample.sol";
import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";

contract Factory1155 is EIP712 {
    string private constant SIGNING_DOMAIN = "LazyFactory-Voucher";
    string private constant SIGNATURE_VERSION = "1.0.0";
    address owner;
    address immutable tokenImplementation;
    address[] public clones;
    uint256 public countCollections;

    struct Voucher {
        address sc_address;
        address developer;
        uint256 tokenId;
    }

    event Response(bool success, bytes data);

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    constructor() EIP712(SIGNING_DOMAIN, SIGNATURE_VERSION) {
        tokenImplementation = address(new ERC1155Sample());
        owner = msg.sender;
    }

    function getTokenImpl() public view returns (address) {
        return tokenImplementation;
    }

    function createCollectionERC1155(Voucher calldata voucher, address signer, bytes calldata signature, string calldata _name, string calldata _symbol, string calldata _tokenMetadataURI, address _collectionOwnerAddress, address _minterAddress) external onlyOwner returns (address) {
        require(owner == signer, "Signer not valid");
        require(verify(voucher, signer, signature), "Invalid signature");
        require(voucher.sc_address == address(this), "Invalid smart contract");
        address clone = Clones.clone(tokenImplementation);
        ERC1155Sample(clone).initialize(_name, _symbol, _tokenMetadataURI, _collectionOwnerAddress, _minterAddress);
        //(bool success, bytes memory data) = clone.call(abi.encodeWithSignature("initialize(string,string,string,address,address)", _name, _symbol, _tokenMetadataURI, _collectionOwnerAddress, _minterAddress));
        //emit Response(success, data);
        clones.push(clone);
        ++countCollections;
        
        return clone;
    }

    function _hash(Voucher calldata voucher) internal view returns (bytes32) {
    return _hashTypedDataV4(keccak256(abi.encode(
      keccak256("NFTVoucher(address sc_address,address to,uint256 tokenId)"),
      voucher.sc_address,
      voucher.developer,
      voucher.tokenId
    )));
  }

    function verify(Voucher calldata voucher, address signer, bytes calldata signature)
    public view returns (bool)
    {
        bytes32 digest = _hash(voucher);
        return (SignatureChecker.isValidSignatureNow(signer, digest, signature));
    }
}