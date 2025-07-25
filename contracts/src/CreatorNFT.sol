// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {console} from "dependencies/forge-std-1.9.5/src/console.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import {ContractRegistry} from "flare-periphery/src/coston2/ContractRegistry.sol";
import {IWeb2Json} from "flare-periphery/src/coston2/IWeb2Json.sol";

interface ICreatorNFT {
    function updateMilestone(IWeb2Json.Proof calldata data) external;
}

contract CreatorNFT is ERC721URIStorage, Ownable {
    uint256 public courseId;
    string public courseName;

    uint256 constant MILESTONE_COUNT = 5;
    string[5] public milestoneURIs;
    uint16[5] public milestoneThresholds;
    uint256 public currentMilestone;

    event MilestoneUpdated(uint256 newMilestone);

    struct DataTransportObject {
        uint256 num_completed;
    }

    constructor(
        string memory _courseName,
        string memory _name,
        string memory _symbol,
        uint256 _courseId,
        string[5] memory _milestoneURIs,
        uint16[5] memory _milestoneThresholds
    ) ERC721(_name, _symbol) Ownable(msg.sender) {
        courseId = _courseId;
        courseName = _courseName;
        milestoneURIs = _milestoneURIs;
        milestoneThresholds = _milestoneThresholds;
        currentMilestone = 0;

        _safeMint(msg.sender, 0);
        _setTokenURI(0, milestoneURIs[0]);
    }

    function isJsonApiProofValid(
        IWeb2Json.Proof calldata _proof
    ) private view returns (bool) {
        return ContractRegistry.getFdcVerification().verifyJsonApi(_proof);
    }

    function updateMilestone(IWeb2Json.Proof calldata proof) external {
        address owner = ownerOf(0);
        require(owner == msg.sender, "Not token owner");
        require(isJsonApiProofValid(proof), "Invalid proof");

        DataTransportObject memory dto = abi.decode(
            proof.data.responseBody.abiEncodedData,
            (DataTransportObject)
        );

        uint16[5] memory thresholds = milestoneThresholds;
        uint256 milestone = 0;

        unchecked {
            for (uint256 i = 0; i < MILESTONE_COUNT; ++i) {
                if (dto.num_completed >= thresholds[i]) {
                    milestone = i + 1;
                } else {
                    break;
                }
            }
        }

        uint256 current = currentMilestone;
        if (milestone > current) {
            currentMilestone = milestone;

            _setTokenURI(0, milestoneURIs[milestone - 1]);

            emit MilestoneUpdated(milestone);
        }
    }

    function updateTokenURI(string memory newTokenURI) internal {
        _setTokenURI(0, newTokenURI);
    }

    function getMilestoneThresholds() public view returns (uint16[5] memory) {
        return milestoneThresholds;
    }

    function transferFrom(
        address,
        address,
        uint256
    ) public pure override(ERC721, IERC721) {
        revert("Soulbound: Transfers disabled");
    }

    function safeTransferFrom(address, address, uint256) public pure override(ERC721, IERC721) {
        revert("Soulbound: Transfers disabled");
    }

    function safeTransferFrom(
        address,
        address,
        uint256,
        bytes memory
    ) public pure override(ERC721, IERC721) {
        revert("Soulbound: Transfers disabled");
    }

    function approve(address, uint256) public pure override(ERC721, IERC721) {
        revert("Soulbound: Approvals disabled");
    }

    function setApprovalForAll(address, bool) public pure override(ERC721, IERC721) {
        revert("Soulbound: Approvals disabled");
    }
}
