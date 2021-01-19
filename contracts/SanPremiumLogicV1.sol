pragma solidity ^0.7.0;

import "./interfaces/IERC20.sol";
import "./libraries/SafeMath.sol";
import "./interfaces/IUniswapV2Pair.sol";
import "./proxy/Initializable.sol";

contract SanPremiumLogicV1 is Initializable {
    using SafeMath for uint256;

    uint256 constant PRO_THRESHOLD = 3000 * 1 ether; // SAN token decimals equals 18
    uint256 constant VOTES_UNISWAP_MULTIPLIER = 2;

    uint256 constant PRODUCT_FREE = 0;
    uint256 constant PRODUCT_PRO = 1;

    IERC20 constant public token = IERC20(address(0x6866D061567F09DFc134d0D335731868698328f6));
    IUniswapV2Pair constant public lp1 = IUniswapV2Pair(address(0x24EbcaEac7A26b7aAB8a7Dd0D19b77E796BC2326));
    IUniswapV2Pair constant public lp2 = IUniswapV2Pair(address(0x64C9Fd9d46B2283637eeFa612CCcbF8845654965));

    function initialize() public payable initializer {
        require(lp1.token0() == address(token) && lp2.token0() == address(token), "Incorrect configuration");
    }

    function hasAccess(address who, uint256 product) public view returns (bool) {
        uint256 tokenAmount1 = computeLiquidityValue(getReserve(lp1), lp1.totalSupply(), lp1.balanceOf(who));
        uint256 tokenAmount2 = computeLiquidityValue(getReserve(lp2), lp2.totalSupply(), lp2.balanceOf(who));

        if (product == PRODUCT_PRO) {
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

        uint256 userBalance = token.balanceOf(who);

        return userBalance.add(tokenAmount1.add(tokenAmount2).mul(VOTES_UNISWAP_MULTIPLIER));
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
        if (totalSupply != 0) {
            tokenAmount = reserve.mul(liquidityAmount) / totalSupply;
        } else {
            tokenAmount = 0;
        }
    }
}
