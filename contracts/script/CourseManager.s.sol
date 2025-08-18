// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {console} from "dependencies/forge-std-1.9.5/src/console.sol";
import {Script} from "dependencies/forge-std-1.9.5/src/Script.sol";
import {Strings} from "@openzeppelin-contracts/utils/Strings.sol";
import {Base} from "./Base.s.sol";
import {Base as StringsBase} from "src/utils/fdcStrings/Base.sol";
import {IWeb2Json} from "dependencies/flare-periphery-0.1.33/src/coston2/IWeb2Json.sol";
import {Surl} from "dependencies/surl-0.0.0/src/Surl.sol";
import {ICourseManager, CourseManager} from "src/CourseManager.sol";

string constant attestationTypeName = "Web2Json";
string constant contractName = "CourseManager";
string constant dirPath = "data/course-manager/";
string constant dirPathCreator = "data/creator/";
string constant dirPathLearner = "data/learner/";

contract DeployContract is Script {
    function run() external {
        string memory creatorAddressString = vm.readLine(
            string.concat(dirPathCreator, "CreatorNFT", "_impl_address", ".txt")
        );
        address creatorAddress = vm.parseAddress(creatorAddressString);

        string memory learnerAddressString = vm.readLine(
            string.concat(dirPathLearner, "LearnerNFT", "_impl_address", ".txt")
        );
        address learnerAddress = vm.parseAddress(learnerAddressString);

        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        CourseManager courseManager = new CourseManager(
            creatorAddress,
            learnerAddress,
            [
                "ipfs://bafkreidlkrxrfkutganrrkmtwpverbgw7y4g57dsnhm5vwjfemr2vo46ba",
                "ipfs://bafkreiet6z4bcbyxcxnvb6y7esb3vr7juysdo6emqco6ma522iqg53rwfu",
                "ipfs://bafkreiakqv7m5qasbn5gvy45yeniqn3zwpe7zl3nh7fw6i5bl36foeqbxy",
                "ipfs://bafkreige7cokbqsxgqtbjr7b5unxba2uy2sns227hwvpctfr5vrpzhftwq",
                "ipfs://bafkreigdd2znfa3qiy3dbnapcdpqerrpoqp4xfk3tvwlxpcjw7kwukwvzq"
            ],
            [
                "ipfs://bafkreidlkrxrfkutganrrkmtwpverbgw7y4g57dsnhm5vwjfemr2vo46ba",
                "ipfs://bafkreiet6z4bcbyxcxnvb6y7esb3vr7juysdo6emqco6ma522iqg53rwfu",
                "ipfs://bafkreiakqv7m5qasbn5gvy45yeniqn3zwpe7zl3nh7fw6i5bl36foeqbxy",
                "ipfs://bafkreige7cokbqsxgqtbjr7b5unxba2uy2sns227hwvpctfr5vrpzhftwq",
                "ipfs://bafkreigdd2znfa3qiy3dbnapcdpqerrpoqp4xfk3tvwlxpcjw7kwukwvzq"
            ],
            [0, 10, 50, 100, 500]
        );
        address _address = address(courseManager);

        vm.stopBroadcast();

        Base.writeToFile(
            dirPath,
            string.concat(contractName, "_address"),
            StringsBase.toHexString(abi.encodePacked(_address)),
            true
        );
    }
}

// contract InteractWithContract is Script {
//     function run() external {
//         string memory addressString = vm.readLine(
//             string.concat(dirPath, contractName, "_address", ".txt")
//         );
//         address _address = vm.parseAddress(addressString);

//         uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
//         vm.startBroadcast(deployerPrivateKey);
//         ICourseManager courseManager = ICourseManager(_address);
//         courseManager.createCourse(2, "Test Course", "ThaiCourse", "THAI");
//         courseManager.enroll(2);

//         vm.stopBroadcast();
//     }
// }
