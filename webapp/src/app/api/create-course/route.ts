import {
    prepareAttestationRequestBase,
    submitAttestationRequest,
    retrieveDataAndProofBaseWithRetry,
} from "../utils/fdc";
import { ethers, AbiCoder } from 'ethers';
import IWeb2JsonVerification from "../../abis/fdc/IWeb2JsonVerification.json";

import ICourseManager from "../../abis/aranya/ICourseManager.json";
import { decodeAbiParameters } from "viem";

const provider = new ethers.JsonRpcProvider(process.env.COSTON2_RPC_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

const { WEB2JSON_VERIFIER_URL_TESTNET, VERIFIER_API_KEY_TESTNET, COSTON2_DA_LAYER_URL, COURSE_MANAGER_ADDRESS } = process.env;

const apiUrl = "https://736d5ff6030c.ngrok-free.app/get-course-creator";
const postProcessJq = `{creatorId: .creatorId}`;
const httpMethod = "GET";
// Defaults to "Content-Type": "application/json"
const headers = "{}";

const body = "{}";
const abiSignature = `{"components": [{"internalType": "address", "name": "creatorId", "type": "address"}],"name": "task","type": "tuple"}`;

// Configuration constants
const attestationTypeBase = "Web2Json";
const sourceIdBase = "PublicWeb2";
const verifierUrlBase = WEB2JSON_VERIFIER_URL_TESTNET;

type ResponseData = {
    message: string
}

async function prepareAttestationRequest(apiUrl: string, postProcessJq: string, queryParams: string, abiSignature: string) {
    const requestBody = {
        url: apiUrl,
        httpMethod: httpMethod,
        headers: headers,
        queryParams: queryParams,
        body: body,
        postProcessJq: postProcessJq,
        abiSignature: abiSignature,
    };

    const url = `${verifierUrlBase}Web2Json/prepareRequest`;
    const apiKey = VERIFIER_API_KEY_TESTNET;

    return await prepareAttestationRequestBase(url, apiKey!, attestationTypeBase, sourceIdBase, requestBody);
}

async function retrieveDataAndProof(abiEncodedRequest: string, roundId: number) {
    const url = `${COSTON2_DA_LAYER_URL}api/v1/fdc/proof-by-request-round-raw`;
    console.log("Url:", url, "n");
    return await retrieveDataAndProofBaseWithRetry(url, abiEncodedRequest, roundId);
}

export async function POST(request: Request) {
    // 1. Save course to database (send to Rust backend)
    // Parse JSON payload from frontend
    const coursePayload = await request.json();

    console.log("Forwarding course payload to Rust backend:", coursePayload);

    // Send to Rust backend
    const rustResponse = await fetch(`http://localhost:4000/create-course`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(coursePayload),
    });
    console.log(rustResponse);
    const responseObj = await rustResponse.json();
    console.log(responseObj);

    const queryParams = `{"courseId":"${responseObj.course_id}"}`;

    const data = await prepareAttestationRequest(apiUrl, postProcessJq, queryParams, abiSignature);

    const abiEncodedRequest = data.abiEncodedRequest;
    const roundId = await submitAttestationRequest(abiEncodedRequest);

    const proof = await retrieveDataAndProof(abiEncodedRequest, roundId);
    console.log("proof: ", proof);

    // --- DECODE RESPONSE HEX ---
    // Grab the Response struct components from the ABI of IWeb2JsonVerification
    const responseType = IWeb2JsonVerification.abi[0].inputs[0].components[1];

    if (!responseType) throw new Error("Response ABI not found");

    const decoded = decodeAbiParameters(
        [
            {
                type: responseType.type,
                name: responseType.name,
                components: responseType.components,
            },
        ],
        proof.response_hex as `0x${string}`
    );
    console.log("Decoded:", decoded);

    const decodedResponse = decoded[0];


    const formattedProof = {
        merkleProof: proof.proof,
        data: decodedResponse
    }

    return new Response(
        JSON.stringify(
            {
                proof: formattedProof,
                courseId: responseObj.course_id,
                title: coursePayload.title,
            },
            (_, value) => (typeof value === "bigint" ? value.toString() : value)
        ),
        {
            status: 200,
            headers: { "Content-Type": "application/json" },
        }
    );
}