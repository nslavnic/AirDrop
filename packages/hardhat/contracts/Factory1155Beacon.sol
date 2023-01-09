// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "./ERC1155Sample.sol";
import "./TokenBeacon.sol";
import "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";


contract Factory1155Beacon {
    address owner;
    address[] public clones;
    uint256 public countCollections;

    address immutable beacon;

    event Response(bool success, bytes data);

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }
    constructor(address _initBlueprint) {
        owner = msg.sender;
        beacon = address(new TokenBeacon(_initBlueprint));
    }

    function createCollectionERC1155(string calldata _name, string calldata _symbol, string calldata _tokenMetadataURI, address _collectionOwnerAddress, address _minterAddress) external onlyOwner returns (address) {

        BeaconProxy newERC1155Proxy = new BeaconProxy(
            beacon,
            abi.encodeWithSignature("initialize(string,string,string,address,address)", _name, _symbol, _tokenMetadataURI, _collectionOwnerAddress, _minterAddress));
        clones.push(address(newERC1155Proxy));
        ++countCollections;

        return address(newERC1155Proxy);
    }

}