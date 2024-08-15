// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTContract is ERC721, ERC721URIStorage, ERC721Enumerable, Ownable {
    mapping(uint256 => uint256) private _swarmHashes;

    event MetadataUpdated(
        address indexed owner,
        uint256 indexed tokenId,
        uint256 swarmHash
    );

    constructor(address initialOwner)
        ERC721("TrackableNFT", "TNFT")
        Ownable(initialOwner)
    {}

    function safeMint(
        address to,
        uint256 tokenId,
        uint256 swarmHash
    ) public {
        require(
            _ownerOf(tokenId) == address(0),
            "This token ID already exists"
        );
        _safeMint(to, tokenId);
        _swarmHashes[tokenId] = swarmHash;

        emit MetadataUpdated(to, tokenId, swarmHash);
    }

    function updateMetadata(uint256 tokenId, uint256 swarmHash) public {
        require(
            _ownerOf(tokenId) == _msgSender(),
            "ERC721: caller is not owner of the NFT"
        );
        _swarmHashes[tokenId] = swarmHash;

        emit MetadataUpdated(_msgSender(), tokenId, swarmHash);
    }

    function metadata(uint256 tokenId) public view returns (uint256) {
        return _swarmHashes[tokenId];
    }

    // The following functions are overrides required by Solidity.

    function setTokenURI(uint256 tokenId, string memory uri) public {
        require(
            _ownerOf(tokenId) == _msgSender(),
            "ERC721: caller is not owner of the NFT"
        );
        _setTokenURI(tokenId, uri);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721, ERC721Enumerable) returns (address) {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 amount)
        internal
        override(ERC721, ERC721Enumerable)
    {
        return super._increaseBalance(account, amount);
    }
}
