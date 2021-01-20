const SanPremiumLogicV1 = artifacts.require("SanPremiumLogicV1")
const SanPremiumProxy = artifacts.require("SanPremiumProxy")
const SanProxyAdmin = artifacts.require("SanProxyAdmin")

module.exports = async (deployer, network, accounts) => {
    let owner = accounts[0];

    await deployer.deploy(SanProxyAdmin, {from: owner})
    await deployer.deploy(SanPremiumLogicV1, {from: owner})

    const logic = await SanPremiumLogicV1.deployed()
    const initCall = logic.contract.methods["initialize"](owner).encodeABI()

    await deployer.deploy(SanPremiumProxy, SanPremiumLogicV1.address, SanProxyAdmin.address, initCall, {from: owner})
};
