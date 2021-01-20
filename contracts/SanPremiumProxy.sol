// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.8.0;

import "./proxy/TransparentUpgradeableProxy.sol";

/**
 * @dev San staking proxy contract
 */
contract SanStakingProxy is TransparentUpgradeableProxy {

    constructor(address logic_, address admin_, bytes memory data_) TransparentUpgradeableProxy(logic_, admin_, data_) {
    }
}
