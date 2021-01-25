// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.8.0;

import "./interfaces/IERC20.sol";
import "./libraries/SafeMath.sol";
import "./interfaces/IUniswapV2Pair.sol";
import "./proxy/Initializable.sol";
import "./libraries/Ownable.sol";
import "./Addresses.sol";
import "./interfaces/ISanStaking.sol";

/**
 * @dev San Staking contract version 1
 */
contract SanStakingLogicV2 is Ownable, Initializable, Addresses, ISanStaking {
    using SafeMath for uint256;

    uint256 constant private LOGIC_VERSION = 2;
    uint256 constant private VOTES_UNISWAP_MULTIPLIER = 2;

    IERC20 constant public ERC20_TOKEN = IERC20(TOKEN_ADDR);
    IUniswapV2Pair constant public PAIR_POOL_1 = IUniswapV2Pair(UNI_POOL_1_ADDR);
    IUniswapV2Pair constant public PAIR_POOL_2 = IUniswapV2Pair(UNI_POOL_2_ADDR);

    struct Product {
        bool exists;
        string name;
        uint256 threshold;
    }

    mapping(uint256 => Product) public products; // productId => Product

    /**
     * @dev Upgradeable proxy-constructor
     */
    function initialize(address _owner) public initializer {
        require(getTokenIndex(PAIR_POOL_1) != -1  && getTokenIndex(PAIR_POOL_2) != -1, "SanStakingLogicV2: Incorrect configuration token and liquidity pools");
        require(_owner != address(0), "SanStakingLogicV2: Owner is the zero address");
        initializeOwner(_owner);
    }

    function addProduct(uint256 productId, string calldata name, uint256 threshold) external onlyOwner {
        Product storage product = products[productId];
        product.exists = true;
        product.name = name;
        product.threshold = threshold;
    }

    function deleteProduct(uint256 productId) external onlyOwner {
        delete products[productId];
    }

    function hasAccess(address user, uint256 productId) public view override returns (bool) {
        Product storage product = products[productId];
        require(product.exists, "SanStakingLogicV2: Product doesn't exists");

        uint256 tokenAmount1 = computeLiquidityValue(getReserve(PAIR_POOL_1), PAIR_POOL_1.totalSupply(), PAIR_POOL_1.balanceOf(user));
        uint256 tokenAmount2 = computeLiquidityValue(getReserve(PAIR_POOL_2), PAIR_POOL_2.totalSupply(), PAIR_POOL_2.balanceOf(user));

        return tokenAmount1.add(tokenAmount2) >= product.threshold;
    }

    function votes(address user) public view override returns (uint256) {
        uint256 tokenAmount1 = computeLiquidityValue(getReserve(PAIR_POOL_1), PAIR_POOL_1.totalSupply(), PAIR_POOL_1.balanceOf(user));
        uint256 tokenAmount2 = computeLiquidityValue(getReserve(PAIR_POOL_2), PAIR_POOL_2.totalSupply(), PAIR_POOL_2.balanceOf(user));

        uint256 userBalance = ERC20_TOKEN.balanceOf(user);

        return userBalance.add(tokenAmount1.add(tokenAmount2).mul(VOTES_UNISWAP_MULTIPLIER));
    }

    function version() public pure returns (uint256) {
        return LOGIC_VERSION;
    }

    function getTokenIndex(IUniswapV2Pair lp) private view returns (int8) {
        if (lp.token0() == address(ERC20_TOKEN)) {
            return 0;
        } else if (lp.token1() == address(ERC20_TOKEN)) {
            return 1;
        } else {
            return -1;
        }
    }

    function getReserve(IUniswapV2Pair lp) private view returns (uint256) {
        int8 index = getTokenIndex(lp);
        require(index >= 0, "SanStakingLogicV2: token isn't found in pool");

        (uint256 reserve0, uint256 reserve1,) = lp.getReserves();
        return index == 0 ? reserve0 : reserve1;
    }

    function computeLiquidityValue(
        uint256 reserve,
        uint256 totalSupply,
        uint256 liquidityAmount
    ) private pure returns (uint256 tokenAmount) {
        if (totalSupply != 0) {
            tokenAmount = reserve.mul(liquidityAmount) / totalSupply;
        } else {
            tokenAmount = 0;
        }
    }
}
