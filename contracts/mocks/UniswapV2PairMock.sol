// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.8.0;

import "../interfaces/IERC20.sol";
import "./ERC20Mock.sol";
import "../interfaces/IUniswapV2Pair.sol";

/**
 * @dev Mock implementation of UniswapV2Pair
 */
abstract contract UniswapV2PairMock is IUniswapV2Pair, ERC20Mock {

    address private _token0;
    address private _token1;

    uint112 private _reserve0;
    uint112 private _reserve1;

    constructor(
        address token0_,
        address token1_,
        string memory name,
        string memory symbol,
        uint256 totalSupply
    ) ERC20Mock(name, symbol, totalSupply) {
        _token0 = token0_;
        _token1 = token1_;
    }

    function setReserves(uint112 reserve0, uint112 reserve1) external {
        _reserve0 = reserve0;
        _reserve1 = reserve1;
    }

    function getReserves() public view override returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast) {
        reserve0 = _reserve0;
        reserve1 = _reserve1;
        blockTimestampLast = 0;
    }

    function token0() external view override returns (address) {
        return _token0;
    }
    function token1() external view override returns (address) {
        return _token1;
    }
}
