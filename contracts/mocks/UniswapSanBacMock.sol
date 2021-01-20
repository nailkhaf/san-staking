// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.8.0;

import "./UniswapV2PairMock.sol";

/**
 * @dev Mock for uniswap SAN/BAC pool
 */
contract UniswapSanBacMock is UniswapV2PairMock {

    constructor(
        address token0_,
        address token1_,
        string memory name,
        string memory symbol,
        uint256 totalSupply
    ) UniswapV2PairMock(token0_, token1_, name, symbol, totalSupply) {
    }
}
