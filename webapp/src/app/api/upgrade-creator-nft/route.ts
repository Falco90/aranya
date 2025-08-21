import {
    prepareAttestationRequestBase,
    submitAttestationRequest,
    retrieveDataAndProofBaseWithRetry,
} from "../utils/fdc";
import IWeb2JsonVerification from "../../abis/fdc/IWeb2JsonVerification.json";
import { decodeAbiParameters } from "viem";

const { WEB2JSON_VERIFIER_URL_TESTNET, VERIFIER_API_KEY_TESTNET, COSTON2_DA_LAYER_URL } = process.env;

const apiUrl = "https://bc2c4fbc00fd.ngrok-free.app/get-num-completed";
const postProcessJq = `{courseId: .courseId, numCompleted: .numCompleted}`;
const httpMethod = "GET";
const headers = "{}";
const body = "{}";
const abiSignature = `{"components": [{"internalType": "uint256", "name": "courseId", "type": "uint256"},{"internalType": "uint256", "name": "numCompleted", "type": "uint256"}],"name": "task","type": "tuple"}`;

const attestationTypeBase = "Web2Json";
const sourceIdBase = "PublicWeb2";
const verifierUrlBase = WEB2JSON_VERIFIER_URL_TESTNET;

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
    return await retrieveDataAndProofBaseWithRetry(url, abiEncodedRequest, roundId);
}

export async function POST(request: Request) {
    const { courseId } = await request.json();

    const queryParams = `{"courseId":"${courseId}"}`;

    const data = await prepareAttestationRequest(apiUrl, postProcessJq, queryParams, abiSignature);

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