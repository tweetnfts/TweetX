// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts@4.9.1/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts@4.9.1/access/Ownable.sol";
import "@openzeppelin/contracts@4.9.1/security/Pausable.sol";
import "@openzeppelin/contracts@4.9.1/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts@4.9.1/token/ERC1155/extensions/ERC1155Supply.sol";

contract TweetX is ERC1155, Ownable, Pausable, ERC1155Burnable, ERC1155Supply {
    constructor(string memory uri) ERC1155(uri) {
    }
    mapping (uint256 => string) private _tokenURIs;
    function uri(uint256 _tokenId) public view override returns (string memory) {
        string memory _tokenURI = _tokenURIs[_tokenId];
        return _tokenURI;
    }

    function setURI(string memory newuri) public onlyOwner {
        _setURI(newuri);
    }

    function updateURI(string memory newuri, uint256 id) public onlyOwner {
				_tokenURIs[id] = newuri;
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function mint(
        address account,
        uint256 id,
        uint256 amount,
        string memory tokenURI,
        bytes memory data
    ) public onlyOwner {
        _mint(account, id, amount, data);
        _tokenURIs[id] = tokenURI;
    }

    function _beforeTokenTransfer(address operator, address from, address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data)
        internal
        whenNotPaused
        override(ERC1155, ERC1155Supply)
    {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }
}
