// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "./ERC721Sample.sol";

contract Factory721 {
    address owner;
    address immutable tokenImplementation;
    address[] public clones;
    uint256 public countCollections;

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }
    constructor() {
        tokenImplementation = address(new ERC721Sample());
        owner = msg.sender;
    }

    function getTokenImpl() public view returns (address) {
        return tokenImplementation;
    }

    function createCollectionERC721(string calldata _name, string calldata _symbol, address _minterAddress, address _collectionOwnerAddress, string calldata _MetadataUri) external onlyOwner returns (address) {
        address clone = Clones.clone(tokenImplementation);
        ERC721Sample(clone).initialize(_name, _symbol, _minterAddress, _collectionOwnerAddress, _MetadataUri);
        clones.push(clone);
        ++countCollections;
        return clone;
    }
}