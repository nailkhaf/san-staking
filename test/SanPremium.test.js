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
    this.user1 = accounts[2]
    this.user2 = accounts[3]

    before("setup contract", async () => {
        this.token = await ERC20.deployed()
        this.lp1 = await UniswapV2Pair1.deployed()
        this.lp2 = await UniswapV2Pair2.deployed()

        this.admin = await SanProxyAdmin.deployed()
        this.proxy = await SanPremiumProxy.deployed()
        this.logicV1 = new SanPremiumLogicV1(this.proxy.address)
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
    })

    it("User2 should get votes", async () => {
        // Initially user has 0 votes
        let userVotes = await this.logicV1.votes(this.user2)
        expect(userVotes.toString()).to.equal('0')

        // Send user 1_000 tokens
        let amountToken = (new BigNumber("1000")).pow(18);
        console.log(1)
        await this.token.transfer(this.user2, amountToken, {from: this.owner})
        let user2Balance = await this.token.balanceOf(this.user2, {from: this.user2})
        console.log(2)
        userVotes = await this.logicV1.votes(this.user2)
        console.log(3)
        expect(userVotes.toString()).to.equal(user2Balance.toString())
        expect(userVotes.toString()).to.equal('0')

        // total supply at liquidity pair is 1_000_000
        // const reserve = (new BigNumber("100_000")).pow(18)
        // this.lp1.setReserves(1_000_000, 0)



    })
})
