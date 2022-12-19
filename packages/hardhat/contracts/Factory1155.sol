pragma solidity >=0.8;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "./ERC1155Sample.sol";

contract FactoryNFT {
    address owner;
    address immutable tokenImplementation;
    address[] public clones;
    uint256 public countCollections;

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }
    constructor() {
        tokenImplementation = address(new ERC1155Sample());
        owner = msg.sender;
    }

    function createCollectionERC1155(string calldata _name, string calldata _symbol, string calldata _tokenMetadataURI, address _collectionOwnerAddress, address _minterAddress) external onlyOwner returns (address) {
        address clone = Clones.clone(tokenImplementation);
        ERC1155Sample(clone).initialize(_name, _symbol, _tokenMetadataURI, _collectionOwnerAddress, _minterAddress);
        clones.push(clone);
        ++countCollections;
        return clone;
    }

}