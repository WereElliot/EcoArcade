// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract StewardshipNFT is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    // Track original hashes/URIs to prevent duplicate claims of same action
    mapping(string => bool) public usedActionURIs;

    constructor() ERC721("StewardshipAction", "STEWARD") Ownable(msg.sender) {}

    /**
     * @dev Mint an NFT representing a verified climate action.
     * Requires the `tokenURI` (e.g. IPFS JSON mapping to GPS EXIF data and Image).
     */
    function mintAction(address to, string memory uri) public returns (uint256) {
        require(!usedActionURIs[uri], "This specific action/photo data has already been minted.");

        uint256 tokenId = _nextTokenId++;
        _mint(to, tokenId);
        _setTokenURI(tokenId, uri);
        
        usedActionURIs[uri] = true;

        return tokenId;
    }
}
