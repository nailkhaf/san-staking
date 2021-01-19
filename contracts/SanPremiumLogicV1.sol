pragma solidity >=0.6.0 <0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol";

contract SanPremiumLogicV1 {
    using SafeMath for uint256;

    uint256 constant PRO_THRESHOLD = 3000;
    uint256 constant VOTES_UNISWAP_MULTIPLIER = 2;

    uint256 constant PRODUCT_FREE = 0;
    uint256 constant PRODUCT_PRO = 1;
    uint256 constant PRODUCT_PLUS = 2;

    IUniswapV2Pair public lp1 = IUniswapV2Pair(address(0));
    IUniswapV2Pair public lp2 = IUniswapV2Pair(address(0));
    IERC20 public token = IERC20(address(0));

    constructor() {
        require(lp1.token0() == address(token) && lp2.token0() == address(token), "Incorrect configuration");
    }

    function hasAccess(address who, uint256 product) public view returns (bool) {
        uint256 tokenAmount1 = computeLiquidityValue(getReserve(lp1), lp1.totalSupply(), lp1.balanceOf(who));
        uint256 tokenAmount2 = computeLiquidityValue(getReserve(lp2), lp2.totalSupply(), lp2.balanceOf(who));

        if (product == PRODUCT_PRO || product == PRODUCT_PLUS) {
            return tokenAmount1.add(tokenAmount2) >= PRO_THRESHOLD;
        } else if (product == PRODUCT_FREE) {
            return true;
        } else {
            return false;
        }
    }

    function votes(address who) public view returns (uint256) {
        uint256 tokenAmount1 = computeLiquidityValue(getReserve(lp1), lp1.totalSupply(), lp1.balanceOf(who));
        uint256 tokenAmount2 = computeLiquidityValue(getReserve(lp2), lp2.totalSupply(), lp2.balanceOf(who));

        uint256 accessVotes = 0;
        if (hasAccess(who, PRODUCT_PLUS) || hasAccess(who, PRODUCT_PRO)) {
            accessVotes = PRO_THRESHOLD;
        }

        return accessVotes.add(tokenAmount1.add(tokenAmount2).mul(VOTES_UNISWAP_MULTIPLIER));
    }

    function getReserve(IUniswapV2Pair lp) internal view returns (uint256) {
        (uint256 reserve1, uint256 reserve2, uint256 _) = lp.getReserves();
        return reserve1;
    }

    function computeLiquidityValue(
        uint256 reserve,
        uint256 totalSupply,
        uint256 liquidityAmount
    ) internal pure returns (uint256 tokenAmount) {
        tokenAmount = reserve.mul(liquidityAmount) / totalSupply;
    }
}
