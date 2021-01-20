// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.8.0;

import "./ERC20Mock.sol";

/**
 * @dev Mock for ERC20 ETH token
 */
contract EthTokenMock is ERC20Mock {

    constructor (uint256 totalSupply_) ERC20Mock("Eth", "ETH", totalSupply_) {
    }
}
