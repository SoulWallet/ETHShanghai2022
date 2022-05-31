// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/// @title SoulToken
/// @notice issue soul bond token
/// @dev
contract SoulToken is ERC721URIStorage, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    /// @notice Nft Id counter
    Counters.Counter private _tokenIds;

    struct Propose {
        address from;
        address to;
        uint256 eventId;
        string tokenURI;
        bool acceptStatus;
        bool mutualMint;
        uint256 createAt;
        uint256 confirmAt;
    }

    /// @notice mapping propose Id to propose detail
    mapping(bytes32 => Propose) public proposeInfo;
    /// @notice get list of propose Ids created By address
    mapping(address => bytes32[]) public proposeIdByAddr;
    event MakePropose(
        address indexed from,
        address indexed to,
        bytes32 proposeId,
        uint256 eventId
    );

     event TokenMinted(
        uint256 indexed tokenId,
        string indexed tokenURI
    );
    /// @notice mapping pendingConfirm based on address
    mapping(address => mapping(uint256 => bytes32)) public pendingConfirm;
    /// @notice number of pending confirms by address
    mapping(address => uint256) public pendingConfirmCount;
    /// @notice mapping address pending index based on pending hash of address
    mapping(address => mapping(bytes32 => uint256))
        public pendingConfirmHashIndex;

    event Witness(uint256 tokenId, address withnessAddr);

    /// @notice request fee
    uint256 public fee;

    /// @notice constructor
    /// @dev
    /// @param _fee request fee
    constructor(uint256 _fee) ERC721("Proof Of Soul", "POS") {
        fee = _fee;
    }

    /// @notice function to send request for mint soul bond token
    /// @dev
    /// @param _party The address that will receive the soul bond token request.
    /// @param _eventId event id for this request
    /// @param _mutualMint A boolean that indicates if the soul bond token needs to mutual mint
    /// @param _tokenURI token uri for this soul bond token
    function sendRequest(
        address _party,
        uint256 _eventId,
        bool _mutualMint,
        string memory _tokenURI
    ) public payable nonReentrant {
        require(
            !proposeExists(msg.sender, _party, _eventId),
            "An offer already exists."
        );
        require(msg.value == fee, "Please pay fee.");
        makePropose(_party, _eventId, _mutualMint, _tokenURI);
    }

    /// @notice batch send request to list of addresses
    /// @dev
    /// @param _parties  The addresses that will receive the soul bond token request.
    /// @param _eventId event id for this request
    /// @param _mutualMint A boolean that indicates if the soul bond token needs to mutual mint
    /// @param _tokenURI token uri for this soul bond token
    function sendBatchRequest(
        address[] memory _parties,
        uint256 _eventId,
        bool _mutualMint,
        string memory _tokenURI
    ) public payable nonReentrant {
        for (uint256 i = 0; i < _parties.length; i++) {
            address _party = _parties[i];
            require(
                !proposeExists(msg.sender, _party, _eventId),
                "An offer already exists."
            );
            require(msg.value == fee, "Please pay fee.");
            makePropose(_party, _eventId, _mutualMint, _tokenURI);
        }
    }

    /// @notice internal function to create propose struct
    /// @dev
    /// @param _party the address which will receive soul bond token request
    /// @param _eventId event id for this request
    /// @param _mutualMint A boolean that indicates if the soul bond token needs to mutual mint
    /// @param _tokenURI token uri for this soul bond token
    function makePropose(
        address _party,
        uint256 _eventId,
        bool _mutualMint,
        string memory _tokenURI
    ) internal {
        //push
        bytes32 proposeHash = _hash(msg.sender, _party, _eventId);
        proposeInfo[proposeHash] = Propose(
            msg.sender,
            _party,
            block.number,
            _tokenURI,
            false,
            _mutualMint,
            block.timestamp,
            0
        );
        proposeIdByAddr[msg.sender].push(proposeHash);
        addPendingConfirmEnumeration(_party, proposeHash);
        emit MakePropose(msg.sender, _party, proposeHash, _eventId);
    }

    /// @notice function add pending confrim enumeration of the address
    /// @dev
    /// @param _party the address receive the request
    /// @param _proposeHash propose id
    function addPendingConfirmEnumeration(address _party, bytes32 _proposeHash)
        internal
    {
        pendingConfirm[_party][pendingConfirmCount[_party]] = _proposeHash;
        pendingConfirmHashIndex[_party][_proposeHash] = pendingConfirmCount[
            _party
        ];
        pendingConfirmCount[_party] += 1;
    }

    /// @notice function remove pending confrim enumeration of the address
    /// @dev
    /// @param _party the address receive the request
    /// @param _proposeHash propose id
    function removePendingConfirmEnumeration(
        address _party,
        bytes32 _proposeHash
    ) internal {
        uint256 lastConfirmIndex = pendingConfirmCount[_party] - 1;
        uint256 confirmIndex = pendingConfirmHashIndex[_party][_proposeHash];

        if (confirmIndex != lastConfirmIndex) {
            bytes32 lastConfirmHash = pendingConfirm[_party][lastConfirmIndex];
            pendingConfirm[_party][confirmIndex] = lastConfirmHash;
            pendingConfirmHashIndex[_party][lastConfirmHash] = confirmIndex;
        }

        delete pendingConfirmHashIndex[_party][_proposeHash];
        delete pendingConfirm[_party][lastConfirmIndex];
         pendingConfirmCount[_party] -=1;
    }

    /// @notice compute the request hash
    /// @dev
    /// @param _from the address send the soul bond token request
    /// @param _to the address receive soul bond toke request
    /// @param eventId unique event Id
    /// @return
    function _hash(
        address _from,
        address _to,
        uint256 eventId
    ) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(_from, _to, eventId));
    }

    /// @notice function to approve the soul bond token request
    /// @dev
    /// @param _proposeHash propose Hash
    function approvePropose(bytes32 _proposeHash) public nonReentrant {
        require(proposeHashExists(_proposeHash), "propose not exists.");

        Propose storage p = proposeInfo[_proposeHash];

        require(p.acceptStatus == false, "Already accept propose");
        p.acceptStatus = true; //reentrancy proof
        p.confirmAt = block.timestamp;
        removePendingConfirmEnumeration(msg.sender, _proposeHash);

        if (p.mutualMint) {
            awardToken(p.from, p.tokenURI);
        }
        awardToken(p.to, p.tokenURI);
    }

    /// @notice function to witness event happend
    /// @dev
    /// @param tokenId
    function witness(uint256 tokenId) public nonReentrant {
        emit Witness(tokenId, msg.sender);
    }

    /// @notice function return the pending request id based on the address and the index
    /// @dev
    /// @param _party address to check
    /// @param index pending index
    /// @return
    function pendingConfirmByIndex(address _party, uint256 index)
        public
        view
        virtual
        returns (bytes32)
    {
        return pendingConfirm[_party][index];
    }

    /// @notice get the index of pending confrim of the address by request id
    /// @dev
    /// @param _party address to check
    /// @param _hashId  request id
    /// @return
    function pendingConfirmIndexByHash(address _party, bytes32 _hashId)
        public
        view
        virtual
        returns (uint256)
    {
        return pendingConfirmHashIndex[_party][_hashId];
    }

    /// @notice function to mint token
    /// @dev
    /// @param _party address receive soul bond token
    /// @param _tokenURI token uri
    /// @return
    function awardToken(address _party, string memory _tokenURI)
        private
        returns (uint256)
    {
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(_party, newItemId);
        _setTokenURI(newItemId, _tokenURI);

        emit TokenMinted(newItemId, _tokenURI);
        return newItemId;
    }

    /// @notice check if the propose exist
    /// @dev
    /// @param _from the address send soul bond request
    /// @param _to the address receive soul bond request
    /// @param _eventId event Id
    /// @return boolean status
    function proposeExists(
        address _from,
        address _to,
        uint256 _eventId
    ) public view virtual returns (bool) {
        bytes32 proposeHash = _hash(_from, _to, _eventId);
        if (proposeInfo[proposeHash].from == _from) {
            return true;
        }
        return false;
    }

    /// @notice check if the propose hash exist
    /// @dev
    /// @param _proposeHash
    /// @return
    function proposeHashExists(bytes32 _proposeHash)
        public
        view
        virtual
        returns (bool)
    {
        if (proposeInfo[_proposeHash].from == address(0)) {
            return false;
        }
        return true;
    }

    /// @notice before hook for ERC721 transfer
    /// @dev
    /// @param from the address send the token transfer
    /// @param to the address receive the token transfer
    /// @param startTokenId erc721 id
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 startTokenId
    ) internal virtual override {
        if (to == address(0)) {
            // allow burn token
            super._beforeTokenTransfer(from, to, startTokenId);
        } else {
            require(from == address(0), "Cannot transfer soul bond token");
            super._beforeTokenTransfer(from, to, startTokenId);
        }
    }

    function burn(uint256 tokenId) external {
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "caller is not owner nor approved"
        );
        _burn(tokenId);
    }

     function getproposeIdByAddr(address _addr) external view returns (bytes32[] memory){
        return proposeIdByAddr[_addr];
    }
    /// @notice withdraw the ether in the contract
    /// @dev
    /// @return
    function withdraw() external onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }
}
