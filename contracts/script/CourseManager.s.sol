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
                "ipfs://bafkreift6et2dm4bdx5oenfpfqa7vgowoiovwtmot5bma4vjolzwqw5sce",
                "ipfs://bafkreidqkfqyy5l6vlmbp3nlyzjcmrrf6xvbzwc62pp2snbiynkr3zre3i",
                "ipfs://bafkreigdd2znfa3qiy3dbnapcdpqerrpoqp4xfk3tvwlxpcjw7kwukwvzq"
            ],
            [
                "ipfs://bafkreifc52v7hwctcr6e3oz3ueknl4dcgkmhgj44uli4spkequ6xtqwzn4",
                "ipfs://bafkreidqh57kf34zk33gntmc2dol5upp35kpmqdc2fm6qicn34iozkhfcy",
                "ipfs://bafkreifa3syi25nxe2e6g2agy7rfuwao52tk2al22anfk3thcejkip5rkq",
                "ipfs://bafkreigotdq4jamxn6yhc6udyqfx5kh26znqnmebwbqd2n63pnt2r6xcpq",
                "ipfs://bafkreicgume2ptvqbsv4gus4txo3wbbx2alx6uaatwprrdgwbpejiah5ea"
            ],
            [0, 1, 2, 3, 500]
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
