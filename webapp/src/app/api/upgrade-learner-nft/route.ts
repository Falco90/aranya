import {
    prepareAttestationRequestBase,
    submitAttestationRequest,
    retrieveDataAndProofBaseWithRetry,
} from "../utils/fdc";
import { ethers, AbiCoder } from 'ethers';
import IWeb2JsonVerification from "../../abis/fdc/IWeb2JsonVerification.json";

import { decodeAbiParameters } from "viem";

const provider = new ethers.JsonRpcProvider(process.env.COSTON2_RPC_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

const { WEB2JSON_VERIFIER_URL_TESTNET, VERIFIER_API_KEY_TESTNET, COSTON2_DA_LAYER_URL } = process.env;

const apiUrl = "https://11f9d843c7fd.ngrok-free.app/get-course-progress-percentage";
const postProcessJq = `{progressPercent: .progressPercent}`;
const httpMethod = "GET";
// Defaults to "Content-Type": "application/json"
const headers = "{}";

const body = "{}";
const abiSignature = `{"components": [{"internalType": "uint8", "name": "progressPercent", "type": "uint8"}],"name": "task","type": "tuple"}`;

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
    const { courseId, learnerId } = await request.json();

    const queryParams = `{"learnerId":"${learnerId}","courseId":"${courseId}"}`;
    console.log("queryParams: ", queryParams);

    const data = await prepareAttestationRequest(apiUrl, postProcessJq, queryParams, abiSignature);
    console.log("data: ", data);

    const abiEncodedRequest = data.abiEncodedRequest;
    const roundId = await submitAttestationRequest(abiEncodedRequest);

    const proof = await retrieveDataAndProof(abiEncodedRequest, roundId);

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
            },
            (_, value) => (typeof value === "bigint" ? value.toString() : value)
        ),
        {
            status: 200,
            headers: { "Content-Type": "application/json" },
        }
    );
}