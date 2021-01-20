const SanPremiumLogicV1 = artifacts.require("SanPremiumLogicV1")
const SanPremiumProxy = artifacts.require("SanPremiumProxy")
const SanProxyAdmin = artifacts.require("SanProxyAdmin")

const ERC20 = artifacts.require("ERC20Mock")
const UniswapV2Pair1 = artifacts.require("UniswapV2PairMock1")
const UniswapV2Pair2 = artifacts.require("UniswapV2PairMock2")

const expect = require('chai').expect
const BigNumber = require('bignumber.js')

contract("SanPremium contracts", async function (accounts) {
    this.owner = accounts[0]
    this.user = accounts[2]

    before("setup contract", async () => {
        this.token = await ERC20.deployed()
        this.lp1 = await UniswapV2Pair1.deployed()
        this.lp2 = await UniswapV2Pair2.deployed()

        this.admin = await SanProxyAdmin.deployed()
        this.proxy = await SanPremiumProxy.deployed()
        this.logicV1 = new SanPremiumLogicV1(this.proxy.address)

        const userBalance = await this.token.balanceOf(this.user)
        if (userBalance.toString() === '0') {
            // Send 1000 token
            let amountToken = (new BigNumber("10")).pow(18 + 3);
            await this.token.transfer(this.user, amountToken, {from: this.owner})
        }

        const userLp1Balance = await this.lp1.balanceOf(this.user)
        if (userLp1Balance.toString() === '0') {
            // Send 100_000 lp1 tokens, which are 10% of the whole pool
            let amountToken = (new BigNumber("10")).pow(18 + 5);
            await this.lp1.transfer(this.user, amountToken, {from: this.owner})
        }

        const userLp2Balance = await this.lp2.balanceOf(this.user)
        if (userLp2Balance.toString() === '0') {
            // Send 100_000 lp2 tokens, which are 10% of the whole pool
            let amountToken = (new BigNumber("10")).pow(18 + 5);
            await this.lp2.transfer(this.user, amountToken, {from: this.owner})
        }

        // Token reserve 10_000 token, as user has 10% share so his amount of tokens equals 1_000
        const tokenReserve = (new BigNumber("10")).pow(18 + 4)
        this.lp1.setReserves(tokenReserve, 0)
        this.lp2.setReserves(tokenReserve, 0)
    });

    it("SanPremium must be initialized", async () => {
        let err
        try {
            await this.logicV1.initialize()
        } catch (e) {
            err = e
        }

        expect(err.reason).to.equal("Initializable: contract is already initialized")
    })

    it("User1 should get access to PRO", async () => {
        let hasFreeAccess = await this.logicV1.hasAccess(this.user, 0)
    })

    it("User2 should get votes", async () => {
        // Check user votes, expected result is 1000 tokens + (1000 lp1 + 1000 lp2) * 2 = 5_000
        let expectedResult = (new BigNumber("10")).pow(18 + 3).multipliedBy(5).toFixed()
        let userVotes = await this.logicV1.votes(this.user)
        expect(userVotes.toString()).to.equal(expectedResult.toString())
    })
})
