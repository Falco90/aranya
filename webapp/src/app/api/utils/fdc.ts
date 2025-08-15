import { ethers } from "ethers";
import { toUtf8HexString, sleep } from "./core";
import {
    getContractAddressByName,
    getFlareSystemsManager,
    getFdcHub,
    getRelay,
    getFdcVerification,
} from "./getters";

// ABI imports
import FdcRequestFeeConfigurationsAbi from "../../abis/fdc/IFdcRequestFeeConfigurations.json";

const RPC_URL = process.env.COSTON2_RPC_URL!;
const NETWORK_NAME = process.env.NETWORK_NAME || "sepolia"; // fallback

const provider = new ethers.JsonRpcProvider(RPC_URL);

export async function getFdcRequestFee(abiEncodedRequest: string) {
    console.log("endoed request: ", abiEncodedRequest);
    const address = await getContractAddressByName("FdcRequestFeeConfigurations");
    const contract = new ethers.Contract(address, FdcRequestFeeConfigurationsAbi.abi, provider);
    return await contract.getRequestFee(abiEncodedRequest);
}

export async function prepareAttestationRequestBase(
    url: string,
    apiKey: string,
    attestationTypeBase: string,
    sourceIdBase: string,
    requestBody: any
) {
    console.log("Url:", url, "\n");
    const attestationType = toUtf8HexString(attestationTypeBase);
    const sourceId = toUtf8HexString(sourceIdBase);

    const request = { attestationType, sourceId, requestBody };

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "X-API-KEY": apiKey,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
    });

    if (response.status !== 200) {
        throw new Error(`Response status is not OK, status ${response.status} ${response.statusText}\n`);
    }

    return await response.json();
}

export async function calculateRoundId(transaction: any) {
    const blockNumber = transaction.blockNumber;
    const block = await provider.getBlock(blockNumber);
    const blockTimestamp = BigInt(block!.timestamp);

    const flareSystemsManager = await getFlareSystemsManager();
    const firstVotingRoundStartTs = BigInt(await flareSystemsManager.firstVotingRoundStartTs());
    const votingEpochDurationSeconds = BigInt(await flareSystemsManager.votingEpochDurationSeconds());

    console.log("Block timestamp:", blockTimestamp, "\n");
    console.log("First voting round start ts:", firstVotingRoundStartTs, "\n");
    console.log("Voting epoch duration seconds:", votingEpochDurationSeconds, "\n");

    const roundId = Number((blockTimestamp - firstVotingRoundStartTs) / votingEpochDurationSeconds);
    console.log("Calculated round id:", roundId, "\n");
    console.log("Received round id:", Number(await flareSystemsManager.getCurrentVotingEpochId()), "\n");
    return roundId;
}



export async function submitAttestationRequest(abiEncodedRequest: string) {
    const fdcHub = await getFdcHub();

    const requestFee = await getFdcRequestFee(abiEncodedRequest);

    const transaction = await fdcHub.requestAttestation(abiEncodedRequest, {
        value: requestFee,
    });
    console.log("Submitted request:", transaction, "\n");

    const receipt = await transaction.wait();

    console.log("Transaction mined in block:", receipt.blockNumber);

    const roundId = await calculateRoundId(receipt);
    console.log(
        `Check round progress at: https://${NETWORK_NAME}-systems-explorer.flare.rocks/voting-round/${roundId}?tab=fdc\n`
    );
    return roundId;
}


export async function retrieveDataAndProofBase(url: string, abiEncodedRequest: string, roundId: number) {
    console.log("Waiting for the round to finalize...");
    const relay = await getRelay();
    const fdcVerification = await getFdcVerification();
    const protocolId = await fdcVerification.fdcProtocolId();

    while (!(await relay.isFinalized(protocolId, roundId))) {
        await sleep(30000);
    }
    console.log("Round finalized!\n");

    const request = { votingRoundId: roundId, requestBytes: abiEncodedRequest };
    console.log("Prepared request:\n", request, "\n");

    await sleep(10000);
    let proof = await postRequestToDALayer(url, request, true);
    console.log("Waiting for the DA Layer to generate the proof...");
    while (proof.response_hex === undefined) {
        await sleep(10000);
        proof = await postRequestToDALayer(url, request, false);
    }
    console.log("Proof generated!\n");

    console.log("Proof:", proof, "\n");
    return proof;
}

export async function postRequestToDALayer(url: string, request: any, watchStatus: boolean = false) {
    const response = await fetch(url, {
        method: "POST",
        headers: {
            //   "X-API-KEY": "",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
    });
    if (watchStatus && response.status != 200) {
        throw new Error(`Response status is not OK, status ${response.status} ${response.statusText}\n`);
    } else if (watchStatus) {
        console.log("Response status is OK\n");
    }
    return await response.json();
}

export async function retrieveDataAndProofBaseWithRetry(
    url: string,
    abiEncodedRequest: string,
    roundId: number,
    attempts: number = 10
) {
    for (let i = 0; i < attempts; i++) {
        try {
            return await retrieveDataAndProofBase(url, abiEncodedRequest, roundId);
        } catch (e: any) {
            console.log(e, "\n", "Remaining attempts:", attempts - i, "\n");
            await sleep(20000);
        }
    }
    throw new Error(`Failed to retrieve data and proofs after ${attempts} attempts`);
}
