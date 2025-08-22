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
                "ipfs://bafkreifwa3ccs3lwy3wdtqrtmsst6vbk7k6q4d5wpi3oy2ssy7ewn5w3ci",
                "ipfs://bafkreierrs53ikuicavcuxmnjjwnm7nsy2lvv42n6pci76bn4duremimjq",
                "ipfs://bafkreif3zsgtueqw2i77m6vqozloe67rksahgqmqmdrwyigfcypywlmsda",
                "ipfs://bafkreiamyx5g4tjwl5i7jyur4fxgq4kyrhzgx6tg2l3nfuo7nj7oeftgw4",
                "ipfs://bafkreiedfgcpa2lptppajs3midqacaivoozlf2bugc6xasr2zdllv4jcwi"
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
