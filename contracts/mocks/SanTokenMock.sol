pragma solidity ^0.7.0;

import "./ERC20Mock.sol";

contract SanTokenMock is ERC20Mock {

    constructor (uint256 totalSupply_) ERC20Mock("San", "SAN", totalSupply_) {
    }
}
