# Staking SANs

## Description

This repository contains smart contracts for ethereum as training task for santiment.net.

## Requirements

1. Function `hasAccess(address,product)->bool` must return whether a given address has access to a given Sanbase 
   product.
2. Function `votes(address)->uint256` which will return how many votes a given address has for governance purposes.
   The number of votes for a user is equal to the balance of a user's tokens + 2x the number of SAN tokens locked in 
   Uniswap. So Uniswap-locked tokens will have higher weight.
3. It should be possible to update the logic of the contract. 
4. Initially, the contract logic can be updated by a person, but later we should be able to set up a governance contract 
   which will be managed by voting and which will perform the logic update operations.

##### Notice
Disadvantage of these requirements that user can withdraw his liquidity tokens at any time. So he can provide and take back 
liquidity from uniswap pools during the day and get access to paid products. I think in production version better to use 
farming mechanism with locking tokens for some time.

### [Proxy Upgrade Pattern](https://docs.openzeppelin.com/upgrades-plugins/1.x/proxies)

I choose approach proxy upgrade pattern, as it has more flexibility and less hardcode for upgrading contracts. 
It uses `delegatecall` at implementation. 

I use *EIP-1967: Standard Proxy Storage Slots* to avoid storage collisions and to have more transparency for blockchain explorers. 
Developer has to avoid and check storage collisions during upgrading versions between proxy-logic and logic contracts.

I use intermediate contract `ProxyAdmin` to avoid clashing attack. Owner of the proxy admin is responsible for upgrading 
implementation. Owner of the logic contracts is used for access control. Ownership can be transferred to governance contract.

### Diagram

![Diagram](./diagram.jpg)

**Notices:**
* Differences in LogicV1 and LogicV2 are version number and `VOTES_UNISWAP_MULTIPLIER` from 1 to 2. It's for demonstration
the upgrading process.
* Most of the time user and owner should interact with `Proxy` contract. Please, open `SanStakingProxy` to try functionality.

### Local testing

* Install dependencies:
  > `npm i`
* In another terminal launch ganache-cli:
  > `npm run ganache`
* Deploy tokens and pools:
  > `npm run deploy-test`
* Start test:
  > `npm test`

### Ropsten testnet

* [SAN token](https://ropsten.etherscan.io/address/0x500CCDe2196A08db6A5D134c84eCd5e42Da1C0C0)
* [ETH token](https://ropsten.etherscan.io/address/0x49C0EED4B2da67eeac09eeC6d98f45FCf8f6Fba2)
* [BAC token](https://ropsten.etherscan.io/address/0xdcf8999016c21B6645219b1d7a2a6942c475cC9d)
* [Uniswap Factory](https://ropsten.etherscan.io/address/0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f)
* [SAN/ETH pair](https://ropsten.etherscan.io/address/0x828f5Ea417376BEd7A554D7e55319B502Fd4aBB2)
* [SAN/BAC pair](https://ropsten.etherscan.io/address/0x1BCdda834611f05dB774731084dE87c18530B3AB)
* [SanProxyAdmin](https://ropsten.etherscan.io/address/0x5a069773d764d1efbe4f3fF0E0F326a88E960240)
* [SanStakingLogicV1](https://ropsten.etherscan.io/address/0xac47f49579c1Aabc231502007fA056635Fc7dDa8)
* [SanStakingLogicV2](https://ropsten.etherscan.io/address/0x50A670ca720c0c9E9ad4C85bE6943a410aD47147)
* [SanStakingProxy](https://ropsten.etherscan.io/address/0x3CCA578EaC0b634BaeeD45CCFd5ebB42B05E8d55)
