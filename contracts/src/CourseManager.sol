// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "./CreatorNFTImpl.sol";
import "./LearnerNFTImpl.sol";
import {IWeb2Json} from "flare-periphery/src/coston2/IWeb2Json.sol";

interface ICourseManager {
    function createCourse(
        uint256 courseId,
        IWeb2Json.Proof calldata proof,
        string memory courseName
    ) external;

    function enroll(
        IWeb2Json.Proof calldata proof,
        uint256 courseId
    ) external returns (uint256);

    function getLearnerNFTAddress(
        uint256 courseId
    ) external view returns (address);

    function getCreatorNFTAddress(
        uint256 courseId
    ) external view returns (address);
}

contract CourseManager {
    using Clones for address;

    address public creatorNFTImplementation;
    address public learnerNFTImplementation;

    string[5] public creatorMilestoneURIs;
    string[5] public learnerMilestoneURIs;
    uint16[5] public creatorMilestoneThresholds;
    mapping(uint256 => mapping(address => bool)) public isEnrolled;

    struct CreateCourseDTO {
        uint256 course_id;
        address user_id;
    }

    struct EnrollDTO {
        uint256 course_id;
        address learner_id;
        bool is_enrolled;
    }

    struct Course {
        address creator;
        address creatorNFT;
        address learnerNFT;
    }

    mapping(uint256 => Course) public courses;

    event CourseCreated(
        uint256 indexed courseId,
        address indexed creator,
        address creatorNFT,
        address learnerNFT
    );

    event LearnerEnrolled(
        uint256 indexed courseId,
        address indexed learner,
        uint256 learnerTokenId
    );

    constructor(
        address _creatorNFTImpl,
        address _learnerNFTImpl,
        string[5] memory _learnerMilestoneURIs,
        string[5] memory _creatorMilestoneURIs,
        uint16[5] memory _creatorMilestoneThresholds
    ) {
        creatorNFTImplementation = _creatorNFTImpl;
        learnerNFTImplementation = _learnerNFTImpl;

        learnerMilestoneURIs = _learnerMilestoneURIs;
        creatorMilestoneURIs = _creatorMilestoneURIs;
        creatorMilestoneThresholds = _creatorMilestoneThresholds;
    }

    function isJsonApiProofValid(
        IWeb2Json.Proof calldata _proof
    ) private view returns (bool) {
        return ContractRegistry.getFdcVerification().verifyJsonApi(_proof);
    }

    function createCourse(
        uint256 courseId,
        IWeb2Json.Proof calldata proof,
        string memory courseName
    ) external {
        require(
            courses[courseId].creator == address(0),
            "Course already exists"
        );

        require(isJsonApiProofValid(proof), "Invalid proof");

        CreateCourseDTO memory dto = abi.decode(
            proof.data.responseBody.abiEncodedData,
            (CreateCourseDTO)
        );

        require(dto.course_id == courseId, "courseId doesn't match");
        require(dto.user_id == msg.sender, "Sender is not course creator");

        address creatorNFTClone = creatorNFTImplementation.clone();
        CreatorNFT(creatorNFTClone).initialize(
            courseName,
            "TEACHER",
            courseId,
            creatorMilestoneURIs,
            creatorMilestoneThresholds,
            msg.sender
        );

        address learnerNFTClone = learnerNFTImplementation.clone();
        LearnerNFT(learnerNFTClone).initialize(
            courseName,
            "LEARNER",
            courseId,
            learnerMilestoneURIs,
            msg.sender,
            address(this)
        );

        courses[courseId] = Course({
            creator: msg.sender,
            creatorNFT: address(creatorNFTClone),
            learnerNFT: address(learnerNFTClone)
        });

        emit CourseCreated(
            courseId,
            msg.sender,
            address(creatorNFTClone),
            address(learnerNFTClone)
        );
    }

    function enroll(
        IWeb2Json.Proof calldata proof,
        uint256 courseId
    ) external returns (uint256) {
        Course memory course = courses[courseId];
        require(course.learnerNFT != address(0), "Course does not exist");

        require(isJsonApiProofValid(proof), "Invalid proof");

        EnrollDTO memory dto = abi.decode(
            proof.data.responseBody.abiEncodedData,
            (EnrollDTO)
        );

        require(dto.course_id == courseId, "courseId doesn't match");
        require(dto.learner_id == msg.sender, "Sender is not learner");
        require(dto.is_enrolled, "Sender is not saved to database");
        require(!isEnrolled[courseId][msg.sender], "Already enrolled");

        LearnerNFT learnerNFT = LearnerNFT(course.learnerNFT);
        uint256 tokenId = learnerNFT.mint(msg.sender);

        isEnrolled[courseId][msg.sender] = true;

        emit LearnerEnrolled(courseId, msg.sender, tokenId);

        return tokenId;
    }

    function getLearnerNFTAddress(
        uint256 courseId
    ) external view returns (address) {
        return courses[courseId].learnerNFT;
    }

    function getCreatorNFTAddress(
        uint256 courseId
    ) external view returns (address) {
        return courses[courseId].creatorNFT;
    }
}
