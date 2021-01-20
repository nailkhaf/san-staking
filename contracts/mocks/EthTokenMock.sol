pragma solidity ^0.7.0;

import "./ERC20Mock.sol";

contract EthTokenMock is ERC20Mock {

    constructor (uint256 totalSupply_) ERC20Mock("Eth", "ETH", totalSupply_) {
    }
}
