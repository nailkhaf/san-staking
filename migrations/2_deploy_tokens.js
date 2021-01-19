// Deploy mock contracts for testing purpose
const ERC20 = artifacts.require("ERC20Mock")
const UniswapV2Pair1Mock = artifacts.require("UniswapV2PairMock1")
const UniswapV2Pair2Mock = artifacts.require("UniswapV2PairMock2")

module.exports = async (deployer, network, accounts) => {
    await deployer.deploy(ERC20, "Token", "TKT", 1_000_000_000, {from: accounts[0], overwrite: false})

    await deployer.deploy(
        UniswapV2Pair1Mock, ERC20.address, ERC20.address, "TKTLP1", "TKT/TKT", 1_000_000, {from: accounts[0], overwrite: false}
    )
    await deployer.deploy(
        UniswapV2Pair2Mock, ERC20.address, ERC20.address, "TKTLP2", "TKT/TKT", 1_000_000, {from: accounts[0], overwrite: false}
    )
};
