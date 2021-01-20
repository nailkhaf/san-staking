// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.8.0;

import "./ERC20Mock.sol";

/**
 * @dev Mock for ERC20 SAN token
 */
contract SanTokenMock is ERC20Mock {

    constructor (uint256 totalSupply_) ERC20Mock("San", "SAN", totalSupply_) {
    }
}
