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

### [Proxy Upgrade Pattern](https://docs.openzeppelin.com/upgrades-plugins/1.x/proxies)

I choose approach proxy upgrade pattern, as it has more flexibility and less hardcode for upgrading contracts. 
It uses `delegatecall` at implementation. 

I use *EIP-1967: Standard Proxy Storage Slots* to avoid storage collisions and to have more transparency for blockchain explorers. 
Developer has to avoid and check storage collisions during upgrading versions between proxy-logic and logic contracts.

I use intermediate contract `ProxyAdmin` to avoid clashing attack. Owner of the proxy admin is responsible for upgrading 
implementation. Owner of the logic contracts is used for access control. Ownership can be transferred to governance contract.

### Diagram

![Diagram](./diagram.jpg)
