// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {console} from "dependencies/forge-std-1.9.5/src/console.sol";
import {IERC721} from "@openzeppelin-contracts/token/ERC721/IERC721.sol";
import {ERC721Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {ERC721URIStorageUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {ContractRegistry} from "flare-periphery/src/coston2/ContractRegistry.sol";
import {IWeb2Json} from "flare-periphery/src/coston2/IWeb2Json.sol";

interface ICreatorNFT {
    function updateMilestone(IWeb2Json.Proof calldata data) external;
}

contract CreatorNFT is
    Initializable,
    ERC721URIStorageUpgradeable,
    OwnableUpgradeable
{
    uint256 public courseId;

    uint256 constant MILESTONE_COUNT = 5;
    string[5] public milestoneURIs;
    uint16[5] public milestoneThresholds;
    uint256 public currentMilestone;

    event MilestoneUpdated(uint256 newMilestone);

    struct DataTransportObject {
        uint256 num_completed;
    }

    constructor() {
        _disableInitializers();
    }

    function initialize(
        string memory _name,
        string memory _symbol,
        uint256 _courseId,
        string[5] memory _milestoneURIs,
        uint16[5] memory _milestoneThresholds,
        address ownerAddress
    ) public initializer {
        __ERC721_init(_name, _symbol);
        __ERC721URIStorage_init();
        __Ownable_init(ownerAddress);
        courseId = _courseId;
        milestoneURIs = _milestoneURIs;
        milestoneThresholds = _milestoneThresholds;
        currentMilestone = 0;

        _safeMint(ownerAddress, 0);
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

            _setTokenURI(0, milestoneURIs[milestone]);

            emit MilestoneUpdated(milestone);
        }
    }

    function updateTokenURI(string memory newTokenURI) internal {
        _setTokenURI(0, newTokenURI);
    }

    function getMilestoneThresholds() public view returns (uint16[5] memory) {
        return milestoneThresholds;
    }
}
