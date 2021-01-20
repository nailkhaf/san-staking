const SanStakingLogicV1 = artifacts.require("SanStakingLogicV1")
const SanStakingLogicV2 = artifacts.require("SanStakingLogicV2")
const SanStakingProxy = artifacts.require("SanStakingProxy")
const SanProxyAdmin = artifacts.require("SanProxyAdmin")

module.exports = async (deployer, network, accounts) => {
    let owner = accounts[0];

    await deployer.deploy(SanProxyAdmin, {from: owner})
    await deployer.deploy(SanStakingLogicV1, {from: owner})
    await deployer.deploy(SanStakingLogicV2, {from: owner})

    const logic = await SanStakingLogicV1.deployed()
    const initCall = logic.contract.methods["initialize"](owner).encodeABI()

    await deployer.deploy(SanStakingProxy, SanStakingLogicV1.address, SanProxyAdmin.address, initCall, {from: owner})
};
