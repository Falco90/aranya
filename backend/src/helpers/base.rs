use alloy::{
    providers::{Provider, ProviderBuilder},
    sol,
};
use color_eyre::eyre::{Result, eyre};
use dotenv::dotenv;
use reqwest::{
    Client,
    header::{CONTENT_TYPE, HeaderMap, HeaderName, HeaderValue},
};
use serde::Deserialize;
use serde_json::{Value, json};
use std::env;

sol!(
    #[sol(rpc)]
    FlareContractRegistry,
    "../contracts/out/ContractRegistry.sol/ContractRegistry.json"
);
#[derive(Debug, Deserialize)]
pub struct AttestationResponse {
    #[serde(rename = "abiEncodedRequest")]
    pub abi_encoded_request: Vec<u8>,
    pub status: String,
}

pub fn prepare_attestation_request(
    attestation_type: &str,
    source_id: &str,
    request_body: &str,
) -> Result<(HeaderMap, String), eyre::Report> {
    dotenv().ok();

    let api_key = env::var("VERIFIER_API_KEY_TESTNET")
        .expect("VERIFIER_API_KEY_TESTNET not set in environment");

    let headers = prepare_headers(&api_key)?;

    let body = prepare_body(attestation_type, source_id, request_body);

    println!("headers: {:?}", headers);
    println!("body: {}\n", body);

    Ok((headers, body))
}

pub fn prepare_headers(api_key: &str) -> Result<HeaderMap, eyre::Report> {
    let mut headers = HeaderMap::new();

    // Create header names with exact casing using from_bytes
    let x_api_key_name = HeaderName::from_bytes(b"X-API-KEY")?;
    let content_type_name = HeaderName::from_bytes(b"Content-Type")?;

    headers.insert(x_api_key_name, HeaderValue::from_str(api_key)?);
    headers.insert(
        content_type_name,
        HeaderValue::from_static("application/json"),
    );

    Ok(headers)
}

pub fn prepare_body(attestation_type: &str, source_id: &str, body: &str) -> String {
    format!(
        r#"{{"attestationType":"{}","sourceId":"{}","requestBody":{}}}"#,
        attestation_type, source_id, body
    )
}

pub fn to_utf8_hex_string(input: &str) -> Result<String> {
    let encoded_string = hex::encode(input.as_bytes()); // hex string without "0x"
    let string_length = encoded_string.len();

    if string_length > 64 {
        return Err(eyre!("String too long"));
    }

    // Number of zeros to pad to reach 64 hex chars (32 bytes)
    let padding_length = 64 - string_length;

    // Pad with '0's on the right (Solidity expects right padding)
    let mut padded = encoded_string;
    for _ in 0..padding_length {
        padded.push('0');
    }

    // Prepend "0x"
    let result = format!("0x{}", padded);

    Ok(result)
}

pub fn parse_attestation_request(data: &[u8]) -> Result<AttestationResponse> {
    let data_string = std::str::from_utf8(data)?;
    println!("data: {}\n", data_string);

    let response: AttestationResponse = serde_json::from_str(data_string)?;

    println!("response status: {}\n", response.status);
    println!("response abiEncodedRequest (hex):");
    println!("{:?}", hex::encode(&response.abi_encoded_request));
    println!();

    Ok(response)
}

pub async fn post_attestation_request(
    url: &str,
    headers: HeaderMap,
    body: String,
) -> Result<Vec<u8>> {
    let client = Client::new();

    let response = client.post(url).headers(headers).body(body).send().await?;

    let status = response.status();

    println!("full response: {:?}", response);

    let text = response.text().await?;
    println!("RESPONSE BODY: {}", text);

    if !status.is_success() {
        return Err(eyre!("HTTP error {}: {}", status, text));
    }

    Ok(text.into_bytes())
}

use std::fs::{File, create_dir_all};
use std::io::Write;
use std::path::Path;

pub fn write_to_file(
    dir_path: &str,
    file_name: &str,
    content: &str,
    overwrite: bool,
) -> eyre::Result<()> {
    let path = Path::new(dir_path);

    // Create the directory if it doesn't exist
    create_dir_all(path)?;

    let file_path = path.join(format!("{}.txt", file_name));

    // Check if file exists and overwrite is disabled
    if file_path.exists() && !overwrite {
        return Err(eyre::eyre!("File already exists and overwrite is disabled"));
    }

    let mut file = File::create(&file_path)?;
    file.write_all(content.as_bytes())?;

    println!("✅ Wrote to file: {}", file_path.display());
    Ok(())
}
