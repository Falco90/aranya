// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {console} from "dependencies/forge-std-1.9.5/src/console.sol";
import {Script} from "dependencies/forge-std-1.9.5/src/Script.sol";
import {Strings} from "@openzeppelin-contracts/utils/Strings.sol";
import {Base} from "./Base.s.sol";
import {Base as StringsBase} from "src/utils/fdcStrings/Base.sol";
import {IWeb2Json} from "dependencies/flare-periphery-0.1.33/src/coston2/IWeb2Json.sol";
import {Surl} from "dependencies/surl-0.0.0/src/Surl.sol";
import {ILearnerNFT, LearnerNFT} from "src/LearnerNFTImpl.sol";

string constant attestationTypeName = "Web2Json";
string constant contractName = "LearnerNFT";
string constant dirPath = "data/learner/";

contract DeployContract is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        LearnerNFT learnerNFT = new LearnerNFT();
        address _address = address(learnerNFT);

        vm.stopBroadcast();

        Base.writeToFile(
            dirPath,
            string.concat(contractName, "_impl_address"),
            StringsBase.toHexString(abi.encodePacked(_address)),
            true
        );
    }
}
