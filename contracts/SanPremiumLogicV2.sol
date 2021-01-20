pragma solidity ^0.7.0;

import "./interfaces/IERC20.sol";
import "./libraries/SafeMath.sol";
import "./interfaces/IUniswapV2Pair.sol";
import "./proxy/Initializable.sol";
import "./libraries/Ownable.sol";
import "./Addresses.sol";

contract SanPremiumLogicV2 is Ownable, Initializable, Addresses {
    using SafeMath for uint256;

    uint256 constant LOGIC_VERSION = 2;
    uint256 constant public VOTES_UNISWAP_MULTIPLIER = 2;

    IERC20 constant public token = IERC20(tokenAddr);
    IUniswapV2Pair constant public lp1 = IUniswapV2Pair(uniPool1Addr);
    IUniswapV2Pair constant public lp2 = IUniswapV2Pair(uniPool2Addr);

    struct Product {
        bool exists;
        string name;
        uint256 threshold;
    }

    mapping(uint256 => Product) public products; // productId => Product

    function initialize(address _owner) public initializer {
        require(lp1.token0() == address(token) && lp2.token0() == address(token), "SanPremiumLogicV2: Incorrect configuration token and liquidity pools");
        require(_owner != address(0), "SanPremiumLogicV2: Owner is the zero address");
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

    function hasAccess(address user, uint256 productId) public view returns (bool) {
        Product storage product = products[productId];
        require(product.exists, "SanPremiumLogicV2: Product doesn't exists");

        uint256 tokenAmount1 = computeLiquidityValue(getReserve(lp1), lp1.totalSupply(), lp1.balanceOf(user));
        uint256 tokenAmount2 = computeLiquidityValue(getReserve(lp2), lp2.totalSupply(), lp2.balanceOf(user));

        return tokenAmount1.add(tokenAmount2) >= product.threshold;
    }

    function votes(address user) public view returns (uint256) {
        uint256 tokenAmount1 = computeLiquidityValue(getReserve(lp1), lp1.totalSupply(), lp1.balanceOf(user));
        uint256 tokenAmount2 = computeLiquidityValue(getReserve(lp2), lp2.totalSupply(), lp2.balanceOf(user));

        uint256 userBalance = token.balanceOf(user);

        return userBalance.add(tokenAmount1.add(tokenAmount2).mul(VOTES_UNISWAP_MULTIPLIER));
    }

    function version() public view returns (uint256) {
        return LOGIC_VERSION;
    }

    function getReserve(IUniswapV2Pair lp) private view returns (uint256) {
        (uint256 reserve1,,) = lp.getReserves();
        return reserve1;
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
