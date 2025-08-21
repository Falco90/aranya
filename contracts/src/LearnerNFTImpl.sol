// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {console} from "dependencies/forge-std-1.9.5/src/console.sol";
import {IERC721} from "@openzeppelin-contracts/token/ERC721/IERC721.sol";
import {ERC721Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {ERC721URIStorageUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {ContractRegistry} from "flare-periphery/src/coston2/ContractRegistry.sol";
import {IWeb2Json} from "flare-periphery/src/coston2/IWeb2Json.sol";

interface ILearnerNFT {
    function updateMilestone(
        uint256 tokenId,
        IWeb2Json.Proof calldata data
    ) external;
    function mint(address to) external returns (uint256);
    function learnerTokenIds(address learner) external view returns (uint256);
    function tokenMilestones(uint256 tokenId) external view returns (uint256);
}

contract LearnerNFT is
    Initializable,
    ERC721URIStorageUpgradeable,
    OwnableUpgradeable
{
    address public courseManager;
    uint256 public tokenCounter;
    uint256 public courseId;
    string[5] public milestoneURIs;
    mapping(address => uint256) public learnerTokenIds;
    mapping(uint256 => uint256) public tokenMilestones;

    mapping(uint256 => bool) public tokenExists;

    struct DataTransportObject {
        uint256 course_id;
        address learner_id;
        uint8 progress_percent;
    }

    event LearnerNFTMinted(address indexed learner, uint256 indexed tokenId);

    event MilestoneUpdated(
        address indexed learner,
        uint256 indexed tokenId,
        uint256 newLevel
    );

    constructor() {
        _disableInitializers();
    }

    function initialize(
        string memory _name,
        string memory _symbol,
        uint256 _courseId,
        string[5] memory _milestoneURIs,
        address ownerAddress,
        address _courseManager
    ) public initializer {
        __ERC721_init(_name, _symbol);
        __ERC721URIStorage_init();
        __Ownable_init(ownerAddress);

        courseManager = _courseManager;
        courseId = _courseId;
        milestoneURIs = _milestoneURIs;
        tokenCounter = 0;
    }

    function isJsonApiProofValid(
        IWeb2Json.Proof calldata _proof
    ) private view returns (bool) {
        return ContractRegistry.getFdcVerification().verifyJsonApi(_proof);
    }

    function mint(address to) external returns (uint256) {
        require(msg.sender == courseManager, "Only CourseManager can mint");
        require(learnerTokenIds[to] == 0, "Already enrolled");

        uint256 tokenId = ++tokenCounter;
        _safeMint(to, tokenId);
        tokenExists[tokenId] = true;
        tokenMilestones[tokenId] = 0;
        updateTokenURI(tokenId, milestoneURIs[0]);
        emit LearnerNFTMinted(msg.sender, tokenId);
        learnerTokenIds[to] = tokenId;
        return tokenId;
    }

    function updateMilestone(
        uint256 tokenId,
        IWeb2Json.Proof calldata proof
    ) external {
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        require(isJsonApiProofValid(proof), "Invalid proof");

        DataTransportObject memory dto = abi.decode(
            proof.data.responseBody.abiEncodedData,
            (DataTransportObject)
        );

        require(dto.course_id == courseId, "CourseId doesn't match");
        require(
            dto.learner_id == msg.sender,
            "LearnerId doesn't match with sender"
        );

        uint256 newMilestone = dto.progress_percent / 25;
        uint256 currentMilestone = tokenMilestones[tokenId];

        if (newMilestone > currentMilestone) {
            tokenMilestones[tokenId] = newMilestone;
            updateTokenURI(tokenId, milestoneURIs[newMilestone]);
            emit MilestoneUpdated(msg.sender, tokenId, newMilestone);
        }
    }

    function updateTokenURI(
        uint256 tokenId,
        string memory newTokenURI
    ) internal {
        _setTokenURI(tokenId, newTokenURI);
    }

    // The following functions are overrides required by Solidity.

    function tokenURI(
        uint256 tokenId
    )
        public
        view
        override(ERC721URIStorageUpgradeable)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721URIStorageUpgradeable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
