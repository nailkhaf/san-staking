// Deploy mock contracts for testing purpose
const SanTokenMock = artifacts.require("SanTokenMock")
const BacTokenMock = artifacts.require("BacTokenMock")
const EthTokenMock = artifacts.require("EthTokenMock")

const UniswapSanEthMock = artifacts.require("UniswapSanEthMock")
const UniswapSanBacMock = artifacts.require("UniswapSanBacMock")

const fs = require('fs')
const promisify = require('util').promisify
const writeFile = promisify(fs.writeFile)

module.exports = async (deployer, network, accounts) => {
    let owner = accounts[0];

    await deployer.deploy(SanTokenMock, 1_000_000_000, {from: owner, overwrite: false})
    await deployer.deploy(EthTokenMock, 1_000_000_000, {from: owner, overwrite: false})
    await deployer.deploy(BacTokenMock, 1_000_000_000, {from: owner, overwrite: false})

    await deployer.deploy(
        UniswapSanEthMock, SanTokenMock.address, EthTokenMock.address, "SAN/ETH", "SAN/ETH", 1_000_000, {
            from: owner,
            overwrite: false
        }
    )
    await deployer.deploy(
        UniswapSanBacMock, BacTokenMock.address, SanTokenMock.address, "SAN/BAC", "SAN/BAC", 1_000_000, {
            from: owner,
            overwrite: false
        }
    )

    await writeFile("contracts/Addresses.sol", addressesContractTemplate(SanTokenMock.address, UniswapSanEthMock.address, UniswapSanBacMock.address))
};

function addressesContractTemplate(token, pool1, pool2) {
    return `// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.8.0;

/**
 * @dev Address constants for dapp
 */
 abstract contract Addresses {
    address constant internal TOKEN_ADDR = address(${token});
    address constant internal UNI_POOL_1_ADDR = address(${pool1});
    address constant internal UNI_POOL_2_ADDR = address(${pool2});
}
`
}
