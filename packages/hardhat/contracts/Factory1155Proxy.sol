// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "./ERC1155Sample.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

contract Factory1155Proxy {
    address owner;
    address tokenImplementation;
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

    function setTokenImpl(address newTokenImplementation) external onlyOwner {
        tokenImplementation = newTokenImplementation;
    }

    function createCollectionERC1155(string calldata _name, string calldata _symbol, string calldata _tokenMetadataURI, address _collectionOwnerAddress, address _minterAddress) external onlyOwner returns (address) {        

        ERC1967Proxy proxy = new ERC1967Proxy(
            tokenImplementation,
            abi.encodeWithSignature("initialize(string,string,string,address,address)", _name, _symbol, _tokenMetadataURI, _collectionOwnerAddress, _minterAddress)
        );

        clones.push(address(proxy));
        ++countCollections;

        return address(proxy);
    }
}