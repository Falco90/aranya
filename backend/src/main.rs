mod db;
mod handlers;
pub mod helpers;
mod models;
mod routes;

use axum::Router;
use std::{error::Error, net::SocketAddr};
use tokio::net::TcpListener;
use tower_http::cors::{Any, CorsLayer};

use routes::{attestation::attestation_routes, course::course_routes, progress::progress_routes};

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    let pool = db::connect().await.expect("DB connect failed");

    let cors = CorsLayer::new()
        .allow_origin(Any) // ⚠️ use `Any` for development only
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .merge(course_routes(pool.clone()))
        .merge(progress_routes(pool.clone()))
        .merge(attestation_routes(pool.clone()))
        .layer(cors);

    let addr = SocketAddr::from(([127, 0, 0, 1], 4000));
    println!("Listening on {}", addr);

    let listener = TcpListener::bind("127.0.0.1:4000").await.unwrap();
    axum::serve(listener, app).await.unwrap();

    Ok(())
}
