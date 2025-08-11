import {
    prepareAttestationRequestBase,
    submitAttestationRequest,
    retrieveDataAndProofBaseWithRetry,
} from "../utils/fdc";
import { ethers } from 'ethers';
import IWeb2JsonVerification from "../../abis/IWeb2JsonVerification.json";

import ICourseManager from "../../abis/ICourseManager.json";

const provider = new ethers.JsonRpcProvider(process.env.COSTON2_RPC_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

const { WEB2JSON_VERIFIER_URL_TESTNET, VERIFIER_API_KEY_TESTNET, COSTON2_DA_LAYER_URL, COURSE_MANAGER_ADDRESS } = process.env;

const apiUrl = "https://3a26ef5d26fc.ngrok-free.app/get-course-creator";
const postProcessJq = `{creatorId: .creatorId}`;
const httpMethod = "GET";
// Defaults to "Content-Type": "application/json"
const headers = "{}";
const queryParams = `{"courseId":"1"}`;
const body = "{}";
const abiSignature = `{"components": [{"internalType": "string", "name": "creatorId", "type": "string"}],"name": "task","type": "tuple"}`;

// Configuration constants
const attestationTypeBase = "Web2Json";
const sourceIdBase = "PublicWeb2";
const verifierUrlBase = WEB2JSON_VERIFIER_URL_TESTNET;

type ResponseData = {
    message: string
}

async function prepareAttestationRequest(apiUrl: string, postProcessJq: string, abiSignature: string) {
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
    console.log(request.body);
    // 1. Prepare attestation to attest creatorId and courseId

    // 2. Submit attestation

    // 3. Retrieve data and proof

    // 4. Call createCourse function with proof;

    const data = await prepareAttestationRequest(apiUrl, postProcessJq, abiSignature);

    const abiEncodedRequest = data.abiEncodedRequest;
    const roundId = await submitAttestationRequest(abiEncodedRequest);

    const proof = await retrieveDataAndProof(abiEncodedRequest, roundId);
    console.log("proof: ", proof);

    const courseManager = new ethers.Contract(
        COURSE_MANAGER_ADDRESS!,
        ICourseManager.abi,
        signer);
    
    // const transaction = courseManager.createCourse();

    return new Response(JSON.stringify({ proof }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
}