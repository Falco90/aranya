use axum::{Router, routing::{post}};
use sqlx::Pool;
use sqlx::Postgres;

use crate::handlers::attestation::{creator::creator_attestation_handler};

pub fn attestation_routes(pool: Pool<Postgres>) -> Router {
    Router::new()
        .route("/creator-attestation", post(creator_attestation_handler))
        // .route("/run-learner-attestation", post(run_learner_attestation))
        .with_state(pool)
}
