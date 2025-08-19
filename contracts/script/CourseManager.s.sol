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
                "ipfs://bafkreibut5xzzjfi35bn7drkia5zmagjjnubuxvavyejmvdrob7ptsdnla",
                "ipfs://bafkreia5p6lglj6vyf54z4lxlwfg6y3icrcwguj74fdp6rox2xrf3sw5ya",
                "ipfs://bafkreiahrdxbceyizglojlduqvw5wbskqkrxxsub2qhikyjkcgqkibgz3u",
                "ipfs://bafkreidcietdnovqwdj22dqsoovfuk3euo63yifjfxhiwnfbgf7iereoaa",
                "ipfs://bafkreigiqq3pxu6egvdb5zcblfypoolgnro6ovhg6sd23qwapmh5bd4axa"
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
