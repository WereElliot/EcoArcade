// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EcoToken is ERC20, Ownable {
    uint256 public constant EXCHANGE_RATE = 1000; // 1 ETH/MATIC = 1000 EcoTokens

    constructor() ERC20("EcoToken", "ECO") Ownable(msg.sender) {}

    /**
     * @dev Buy tokens using native currency (ETH/MATIC)
     * e.g., to buy and fund climate projects directly
     */
    function buyTokens() public payable {
        require(msg.value > 0, "Must send value to buy tokens");
        uint256 amountToMint = msg.value * EXCHANGE_RATE;
        _mint(msg.sender, amountToMint);
    }

    /**
     * @dev Mint tokens directly. In production, this would be restricted to 
     * a trusted backend or oracle that converts off-chain EcoPoints to on-chain tokens.
     */
    function convertPointsToTokens(address to, uint256 amount) public {
        _mint(to, amount);
    }

    /**
     * @dev Allow users to securely donate their tokens to verified projects.
     * Tokens are sent to the project address on-chain for transparency.
     */
    function donate(address project, uint256 amount) public {
        require(balanceOf(msg.sender) >= amount, "Insufficient EcoToken balance");
        _transfer(msg.sender, project, amount);
    }
}
