// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {console} from "dependencies/forge-std-1.9.5/src/console.sol";
import {Script} from "dependencies/forge-std-1.9.5/src/Script.sol";
import {Strings} from "@openzeppelin-contracts/utils/Strings.sol";
import {Base} from "./Base.s.sol";
import {Base as StringsBase} from "src/utils/fdcStrings/Base.sol";
import {IWeb2Json} from "dependencies/flare-periphery-0.1.33/src/coston2/IWeb2Json.sol";
import {Surl} from "dependencies/surl-0.0.0/src/Surl.sol";
import {ILearnerNFT, LearnerNFT} from "src/LearnerNFT.sol";

string constant attestationTypeName = "Web2Json";
string constant contractName = "LearnerNFT";
string constant dirPath = "data/";

contract PrepareAttestationRequest is Script {
    using Surl for *;

    // Setting request data
    // string public apiUrl = "https://swapi.dev/api/people/3/";
    string public apiUrl = "https://e433e06bac25.ngrok-free.app/get-course-progress";
    string public httpMethod = "GET";
    // Defaults to "Content-Type": "application/json"
    string public headers = '{\\"Content-Type\\":\\"application/json\\"}';
    string public queryParams = '{\\"learner_id\\":\\"did:privy:cmd2wmiz80171kz0mmwjh1acf\\", \\"course_id\\":\\"4\\"}';
    string public body = "{}";
    string public postProcessJq =
        '{course_id: .course_id, learner_id: .learner_id, progress_percent: .progress_percent}';
    string public abiSignature =
        '{\\"components\\": [{\\"internalType\\": \\"uint256\\", \\"name\\": \\"course_id\\", \\"type\\": \\"uint256\\"},{\\"internalType\\": \\"string\\", \\"name\\": \\"learner_id\\", \\"type\\": \\"string\\"},{\\"internalType\\": \\"uint256\\", \\"name\\": \\"progress_percent\\", \\"type\\": \\"uint256\\"}],\\"name\\": \\"task\\",\\"type\\": \\"tuple\\"}';

    string public sourceName = "PublicWeb2";

    function prepareRequestBody(
        string memory url,
        string memory httpMethod,
        string memory headers,
        string memory queryParams,
        string memory body,
        string memory postProcessJq,
        string memory abiSignature
    ) private pure returns (string memory) {
        return
            string.concat(
                '{"url": "',
                url,
                '","httpMethod": "',
                httpMethod,
                '","headers": "',
                headers,
                '","queryParams": "',
                queryParams,
                '","body": "',
                body,
                '","postProcessJq": "',
                postProcessJq,
                '","abiSignature": "',
                abiSignature,
                '"}'
            );
    }

    function run() external {
        // Preparing request data
        string memory attestationType = Base.toUtf8HexString(
            attestationTypeName
        );
        string memory sourceId = Base.toUtf8HexString(sourceName);
        string memory requestBody = prepareRequestBody(
            apiUrl,
            httpMethod,
            headers,
            queryParams,
            body,
            postProcessJq,
            abiSignature
        );
        (string[] memory headers, string memory body) = Base
            .prepareAttestationRequest(attestationType, sourceId, requestBody);

        // string memory baseUrl = "https://testnet-verifier-fdc-test.aflabs.org/";
        string memory baseUrl = vm.envString("WEB2JSON_VERIFIER_URL_TESTNET");
        string memory url = string.concat(
            baseUrl,
            "Web2Json",
            "/prepareRequest"
        );
        console.log("url: %s", url);

        // Posting the attestation request
        (, bytes memory data) = url.post(headers, body);

        Base.AttestationResponse memory response = Base.parseAttestationRequest(
            data
        );

        // Writing abiEncodedRequest to a file
        Base.writeToFile(
            dirPath,
            string.concat(contractName, "_abiEncodedRequest"),
            StringsBase.toHexString(response.abiEncodedRequest),
            true
        );
    }
}

contract SubmitAttestationRequest is Script {
    using Surl for *;

    function run() external {
        // Reading the abiEncodedRequest from a file
        string memory fileName = string.concat(
            contractName,
            "_abiEncodedRequest",
            ".txt"
        );
        string memory filePath = string.concat(dirPath, fileName);
        string memory requestStr = vm.readLine(filePath);
        bytes memory request = vm.parseBytes(requestStr);

        // Submitting the attestation request
        uint256 timestamp = Base.submitAttestationRequest(request);
        uint256 votingRoundId = Base.calculateRoundId(timestamp);

        // Writing to a file
        Base.writeToFile(
            dirPath,
            string.concat(contractName, "_votingRoundId"),
            Strings.toString(votingRoundId),
            true
        );
    }
}

contract RetrieveDataAndProof is Script {
    using Surl for *;

    function run() external {
        string memory daLayerUrl = vm.envString("COSTON2_DA_LAYER_URL"); // XXX
        string memory apiKey = vm.envString("X_API_KEY");

        // We import the abiEncodedRequest and votingRoundId from the files
        string memory requestBytes = vm.readLine(
            string.concat(
                dirPath,
                contractName,
                "_abiEncodedRequest",
                ".txt"
            )
        );
        string memory votingRoundId = vm.readLine(
            string.concat(
                dirPath,
                contractName,
                "_votingRoundId",
                ".txt"
            )
        );

        console.log("votingRoundId: %s\n", votingRoundId);
        console.log("requestBytes: %s\n", requestBytes);

        // Preparing the proof request
        string[] memory headers = Base.prepareHeaders(apiKey);
        string memory body = string.concat(
            '{"votingRoundId":',
            votingRoundId,
            ',"requestBytes":"',
            requestBytes,
            '"}'
        );
        console.log("body: %s\n", body);
        console.log(
            "headers: %s",
            string.concat("{", headers[0], ", ", headers[1]),
            "}\n"
        );

        // Posting the proof request
        string memory url = string.concat(
            daLayerUrl,
            // "api/v0/fdc/get-proof-round-id-bytes"
            "api/v1/fdc/proof-by-request-round-raw"
        );
        console.log("url: %s\n", url);

        (, bytes memory data) = Base.postAttestationRequest(url, headers, body);

        // Decoding the response from JSON data
        bytes memory dataJson = Base.parseData(data);
        Base.ParsableProof memory proof = abi.decode(
            dataJson,
            (Base.ParsableProof)
        );

        IWeb2Json.Response memory proofResponse = abi.decode(
            proof.responseHex,
            (IWeb2Json.Response)
        );

        IWeb2Json.Proof memory _proof = IWeb2Json.Proof(
            proof.proofs,
            proofResponse
        );

        // Writing proof to a file
        Base.writeToFile(
            dirPath,
            string.concat(contractName, "_proof"),
            StringsBase.toHexString(abi.encode(_proof)),
            true
        );
    }
}

contract DeployContract is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        LearnerNFT learnerNFT = new LearnerNFT("TestCourse", "Test", 4, msg.sender);
        address _address = address(learnerNFT);

        vm.stopBroadcast();

        Base.writeToFile(
            dirPath,
            string.concat(contractName, "_address"),
            StringsBase.toHexString(abi.encodePacked(_address)),
            true
        );
    }
}

contract InteractWithContract is Script {
    function run() external {
        string memory addressString = vm.readLine(
            string.concat(dirPath, contractName, "_address", ".txt")
        );
        address _address = vm.parseAddress(addressString);
        string memory proofString = vm.readLine(
            string.concat(dirPath, contractName, "_proof", ".txt")
        );
        bytes memory proofBytes = vm.parseBytes(proofString);
        IWeb2Json.Proof memory proof = abi.decode(
            proofBytes,
            (IWeb2Json.Proof)
        );
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);
        ILearnerNFT learnerNFT = ILearnerNFT(_address);
        uint256 tokenId = learnerNFT.mint();
        learnerNFT.updateMilestone(tokenId, proof);
        vm.stopBroadcast();
    }
}
