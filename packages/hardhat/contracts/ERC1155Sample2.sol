// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./ERC1155Sample.sol";


contract ERC1155Sample2 is ERC1155Sample {

    function sayOne() public pure returns(uint256) {
        return 1;
    }
}