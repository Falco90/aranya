use crate::helpers::base::{self, to_utf8_hex_string, write_to_file};

use alloy::{
    providers::{Provider, ProviderBuilder},
    sol,
};
use dotenv::dotenv;
use eyre::{ErrReport, Result};
use serde_json::json;

use std::env;

sol!(
    #[sol(rpc)]
    FlareContractRegistry,
    "../contracts/out/ContractRegistry.sol/ContractRegistry.json"
);

use axum::{Json, http::StatusCode, response::IntoResponse};

pub async fn creator_attestation_handler() -> impl IntoResponse {
    match run_creator_attestation().await {
        Ok(_) => (StatusCode::OK, Json("Attestation complete".to_string())),
        Err(err) => {
            eprintln!("❌ Error: {:?}", err);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(format!("Error: {}", err)),
            )
        }
    }
}

pub async fn run_creator_attestation() -> Result<()> {
    dotenv().ok();

    pub const API_URL: &str = "https://953873159867.ngrok-free.app/get-num-completed";
    pub const HTTP_METHOD: &str = "GET";

    // Escaped JSON strings (same as Solidity)
    pub const HEADERS: &str = r#"{"content-type":"application/json"}"#;
    pub const QUERY_PARAMS: &str = r#"{"course_id":"2"}"#;
    pub const BODY: &str = "{}";
    pub const POST_PROCESS_JQ: &str = r#"{num_completed: .num_completed}"#;
    pub const ABI_SIGNATURE: &str = r#"{"components": [{"internalType": "uint256", "name": "num_completed", "type": "uint256"}],"name": "task","type": "tuple"}"#;
    pub const SOURCE_NAME: &str = "PublicWeb2";
    pub const ATTESTATION_TYPE_NAME: &str = "Web2Json";
    pub const CONTRACT_NAME: &str = "CreatorNFT";
    pub const DIR_PATH: &str = "data/creator/";

    let attestation_type = to_utf8_hex_string(ATTESTATION_TYPE_NAME)?;
    let source_id = to_utf8_hex_string(SOURCE_NAME)?;

    let request_body = prepare_request_body(
        API_URL,
        HTTP_METHOD,
        HEADERS,
        QUERY_PARAMS,
        BODY,
        POST_PROCESS_JQ,
        ABI_SIGNATURE,
    );

    let (headers_map, body_string) =
        base::prepare_attestation_request(&attestation_type, &source_id, &request_body)?;

    let base_url = env::var("WEB2JSON_VERIFIER_URL_TESTNET");

    let url = format!(
        "{}Web2Json/prepareRequest",
        base_url.expect("Missing base url")
    );
    println!("url: {}", url);

    let data = base::post_attestation_request(&url, headers_map, body_string).await?;
    println!("Got {} bytes", data.len());

    let response = base::parse_attestation_request(&data)?;

    let abi_encoded_hex = hex::encode(&response.abi_encoded_request);

    write_to_file(
        DIR_PATH,
        &format!("{}_abiEncodedRequest", CONTRACT_NAME),
        &abi_encoded_hex,
        true, // overwrite
    )?;
    Ok(())
}

pub fn prepare_request_body(
    url: &str,
    http_method: &str,
    headers: &str,
    query_params: &str,
    body: &str,
    post_process_jq: &str,
    abi_signature: &str,
) -> String {
    // Escape the inner JSON strings properly
    let headers_escaped = serde_json::to_string(headers).unwrap();
    let query_params_escaped = serde_json::to_string(query_params).unwrap();
    let abi_signature_escaped = serde_json::to_string(abi_signature).unwrap();

    println!("escaped headers: {}", headers_escaped);

    let request_body = json!({
        "url": url,
        "httpMethod": http_method,
        "headers": headers_escaped,
        "queryParams": query_params_escaped,
        "body": body,
        "postProcessJq": post_process_jq,
        "abiSignature": abi_signature_escaped,
    });

    request_body.to_string()
}
