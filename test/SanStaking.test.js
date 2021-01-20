const SanStakingLogicV1 = artifacts.require("SanStakingLogicV1")
const SanStakingLogicV2 = artifacts.require("SanStakingLogicV2")
const SanStakingProxy = artifacts.require("SanStakingProxy")
const SanProxyAdmin = artifacts.require("SanProxyAdmin")

const SanTokenMock = artifacts.require("SanTokenMock")
const UniswapSanEthMock = artifacts.require("UniswapSanEthMock")
const UniswapSanBacMock = artifacts.require("UniswapSanBacMock")

const expect = require('chai').expect

contract("SanStaking contracts", async function (accounts) {
    this.owner = accounts[0]
    this.user = accounts[2]

    let proThreshold = ethToWei(3000)

    const grantTokens = async () => {
        await this.token.transfer(this.user, ethToWei(5_000), {from: this.owner})
    }

    const grantLpTokens = async () => {
        await this.sanEthPool.transfer(this.user, ethToWei(100_000), {from: this.owner}) // 10% of the whole pool
        await this.sanBacPool.transfer(this.user, ethToWei(100_000), {from: this.owner}) // 10% of the whole pool

        await this.sanEthPool.setReserves(ethToWei(10_000), 0) // user owns 10% from 10k
        await this.sanBacPool.setReserves(0, ethToWei(20_000)) // user owns 10% from 20k
    }

    before("setup contract", async () => {
        this.token = await SanTokenMock.deployed()
        this.sanEthPool = await UniswapSanEthMock.deployed()
        this.sanBacPool = await UniswapSanBacMock.deployed()

        this.admin = await SanProxyAdmin.deployed()
        this.proxy = await SanStakingProxy.deployed()
        this.logicV1 = await SanStakingLogicV1.deployed()
        this.logicV2 = await SanStakingLogicV2.deployed()
        this.dapp = new SanStakingLogicV1(this.proxy.address)
    });

    afterEach("Drain tokens from user after each test", async () => {
        await drainBalance(this.token, this.user, this.owner);
        await drainBalance(this.sanEthPool, this.user, this.owner);
        await drainBalance(this.sanBacPool, this.user, this.owner);
        await resetReserves(this.sanEthPool)
        await resetReserves(this.sanBacPool)
    });

    it("Contracts must be correct deployed and initialized", async () => {
        const owner = await this.dapp.owner();
        const version = await this.dapp.version();
        expect(owner).to.equal(this.owner)
        expect(version.toString()).to.equal('1')

        const ownerProxy = await this.admin.owner()
        expect(ownerProxy).to.equal(this.owner)

        const implementation = await this.admin.getProxyImplementation(this.proxy.address)
        const adminProxy = await this.admin.getProxyAdmin(this.proxy.address)

        expect(implementation).to.equal(this.logicV1.address)
        expect(adminProxy).to.equal(this.admin.address)

        let err = await runCatching(async () => {
            await this.dapp.initialize(this.owner)
        })
        expect(err.reason).to.equal("Initializable: contract is already initialized")
    })

    it("Owner can add products", async () => {
        await this.dapp.addProduct(0, "FREE", 0, {from: this.owner});
        await this.dapp.addProduct(1, "PRO", proThreshold, {from: this.owner});

        const freeProduct = await this.dapp.products(0);
        const proProduct = await this.dapp.products(1);

        expect(freeProduct['exists']).to.equal(true)
        expect(freeProduct['name']).to.equal("FREE")
        expect(freeProduct['threshold'].toString()).to.equal('0')
        expect(proProduct['exists']).to.equal(true)
        expect(proProduct['name']).to.equal("PRO")
        expect(proProduct['threshold'].toString()).to.equal(proThreshold.toString())
    })

    it("User can't add products", async () => {
        let err = await runCatching(async () => {
            await this.dapp.addProduct(0, "FREE", 0, {from: this.user});
        })
        expect(err.reason).to.equal("Ownable: caller is not the owner")
    })

    it("User can't delete products", async () => {
        let err = await runCatching(async () => {
            await this.dapp.deleteProduct(0, {from: this.user});
        })
        expect(err.reason).to.equal("Ownable: caller is not the owner")
    })

    it("User can get pro access", async () => {
        let hasFreeAccess = await this.dapp.hasAccess(this.user, 0)
        let hasProAccess = await this.dapp.hasAccess(this.user, 1)

        expect(hasFreeAccess).to.equal(true, "User has free access because of zero threshold")
        expect(hasProAccess).to.equal(false, "User hasn't pro access")

        await grantLpTokens()

        hasProAccess = await this.dapp.hasAccess(this.user, 1)
        expect(hasProAccess).to.equal(true, "User has pro access, because total share equal 3k tokens")
    })

    it("User can get votes", async () => {
        let userVotes = await this.dapp.votes(this.user)
        expect(userVotes.toString()).to.equal('0', "Initially, user has 0 votes")

        await grantTokens()

        userVotes = await this.dapp.votes(this.user)
        expect(userVotes.toString()).to.equal(ethToWei(5_000), "User has 1_000 votes")

        await grantLpTokens()

        userVotes = await this.dapp.votes(this.user)
        expect(userVotes.toString()).to.equal(ethToWei(5_000 + 3_000), "User has 8_000 votes")
    })

    it('Upgrade logic to version 2 and consistency check', async () => {
        await this.admin.upgrade(this.proxy.address, this.logicV2.address, {from: this.owner})
        const implementation = await this.admin.getProxyImplementation(this.proxy.address)
        expect(implementation).to.equal(this.logicV2.address)

        const freeProduct = await this.dapp.products(0);
        const proProduct = await this.dapp.products(1);

        expect(freeProduct['exists']).to.equal(true)
        expect(freeProduct['name']).to.equal("FREE")
        expect(freeProduct['threshold'].toString()).to.equal('0')
        expect(proProduct['exists']).to.equal(true)
        expect(proProduct['name']).to.equal("PRO")
        expect(proProduct['threshold'].toString()).to.equal(proThreshold.toString())

        const owner = await this.dapp.owner();
        const version = await this.dapp.version();
        expect(owner).to.equal(this.owner)
        expect(version.toString()).to.equal('2')
    })

    it("After upgrade logic to v2 user should have more votes and pro access", async () => {
        await grantTokens()
        await grantLpTokens()

        const userVotes = await this.dapp.votes(this.user)
        expect(userVotes.toString()).to.equal(ethToWei(5_000 + 3_000 * 2), "User has 11_000 votes")

        const hasProAccess = await this.dapp.hasAccess(this.user, 1)
        expect(hasProAccess).to.equal(true, "User has pro access, because total share equal 3k tokens")
    })

    it("Owner can delete products", async () => {
        await this.dapp.deleteProduct(0, {from: this.owner});
        await this.dapp.deleteProduct(1, {from: this.owner});

        const freeProduct = await this.dapp.products(0);
        const proProduct = await this.dapp.products(1);

        expect(freeProduct['exists']).to.equal(false)
        expect(freeProduct['name']).to.equal("")
        expect(freeProduct['threshold'].toString()).to.equal('0')
        expect(proProduct['exists']).to.equal(false)
        expect(proProduct['name']).to.equal("")
        expect(proProduct['threshold'].toString()).to.equal('0')

        const owner = await this.dapp.owner();
        expect(owner).to.equal(this.owner)
    })
})

async function drainBalance(token, from, to) {
    const balance = await token.balanceOf(from)
    if (balance.toString() !== '0') {
        await token.transfer(to, balance, {from})
    }
}

async function resetReserves(lp) {
    const resereves = await lp.getReserves()
    if (resereves['reserve0'].toString() !== '0' || resereves['reserve1'].toString() !== '0') {
        await lp.setReserves(0, 0)
    }
}

async function runCatching(callback) {
    let err
    try {
        await callback()
    } catch (e) {
        err = e
    }
    return err
}

// return big number with 18 decimals
function ethToWei(amount) {
    return web3.utils.toWei(amount.toString(), 'ether');
}
