const SanPremiumLogicV1 = artifacts.require("SanPremiumLogicV1")
const SanPremiumProxy = artifacts.require("SanPremiumProxy")
const SanProxyAdmin = artifacts.require("SanProxyAdmin")

module.exports = async (deployer, network, accounts) => {
    await deployer.deploy(SanProxyAdmin, {from: accounts[0]})
    await deployer.deploy(SanPremiumLogicV1, {from: accounts[0]})

    const logic = await SanPremiumLogicV1.deployed()
    const initCall = logic.contract.methods["initialize"]().encodeABI()

    await deployer.deploy(SanPremiumProxy, SanPremiumLogicV1.address, SanProxyAdmin.address, initCall, {from: accounts[0]})
};
