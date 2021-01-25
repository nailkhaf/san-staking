// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.8.0;

/** @title San Staking interface. */
interface ISanStaking {

    /**
     * @dev check if user has access for specific product. If product doesn't exist throw error.
     * @param user address of user wallet
     * @param productId id of product
     * @return true if user has access to product, false if not
     */
    function hasAccess(address user, uint256 productId) external view returns (bool);

    /**
     * @dev get amount of votes power for user
     * @param user address of user wallet
     * @return amount of user's votes
     */
    function votes(address user) external view returns (uint256);
}
