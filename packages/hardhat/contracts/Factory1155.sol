// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "./ERC1155Sample.sol";

contract Factory1155 {
    address owner;
    address immutable tokenImplementation;
    address[] public clones;
    uint256 public countCollections;

    event Response(bool success, bytes data);

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    constructor() {
        tokenImplementation = address(new ERC1155Sample());
        owner = msg.sender;
    }

    function getTokenImpl() public view returns (address) {
        return tokenImplementation;
    }

    function createCollectionERC1155(string calldata _name, string calldata _symbol, string calldata _tokenMetadataURI, address _collectionOwnerAddress, address _minterAddress) external onlyOwner returns (address) {
        address clone = Clones.clone(tokenImplementation);
        ERC1155Sample(clone).initialize(_name, _symbol, _tokenMetadataURI, _collectionOwnerAddress, _minterAddress);
        //(bool success, bytes memory data) = clone.call(abi.encodeWithSignature("initialize(string,string,string,address,address)", _name, _symbol, _tokenMetadataURI, _collectionOwnerAddress, _minterAddress));
        //emit Response(success, data);
        clones.push(clone);
        ++countCollections;
        
        return clone;
    }
}