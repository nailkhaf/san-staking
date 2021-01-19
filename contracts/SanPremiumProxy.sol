pragma solidity ^0.7.0;

import "./proxy/TransparentUpgradeableProxy.sol";

contract SanPremiumProxy is TransparentUpgradeableProxy {

    constructor(address logic_, address admin_, bytes memory data_) payable TransparentUpgradeableProxy(logic_, admin_, data_) {
    }
}
