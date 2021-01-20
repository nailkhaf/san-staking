// Deploy mock contracts for testing purpose
const ERC20 = artifacts.require("ERC20Mock")
const UniswapV2PairMock1 = artifacts.require("UniswapV2PairMock1")
const UniswapV2PairMock2 = artifacts.require("UniswapV2PairMock2")

module.exports = async (deployer, network, accounts) => {
    await deployer.deploy(ERC20, "Token", "TKT", 1_000_000_000, {from: accounts[0], overwrite: false})

    await deployer.deploy(
        UniswapV2PairMock1, ERC20.address, ERC20.address, "TKTLP1", "TKT/TKT", 1_000_000, {from: accounts[0], overwrite: false}
    )
    await deployer.deploy(
        UniswapV2PairMock2, ERC20.address, ERC20.address, "TKTLP2", "TKT/TKT", 1_000_000, {from: accounts[0], overwrite: false}
    )

    console.log(`------------------------------------`)
    console.log(`Token deployed at: ${ERC20.address}`)
    console.log(`Liquidity Pool 1 deployed at: ${UniswapV2PairMock1.address}`)
    console.log(`Liquidity Pool 1 deployed at: ${UniswapV2PairMock2.address}`)
    console.log(`------------------------------------`)
};
