// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.8.0;

import "./IERC20.sol";

/**
 * @dev Standard part of the UniswapV2Pair interface.
 */
interface IUniswapV2Pair is IERC20 {
    function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast);
    function token0() external view returns (address);
    function token1() external view returns (address);
}
