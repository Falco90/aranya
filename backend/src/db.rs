use dotenv::dotenv;
use sqlx::{Pool, Postgres, postgres::PgPoolOptions};
use std::env;

pub async fn connect() -> Result<Pool<Postgres>, sqlx::Error> {
    dotenv().ok();
    let url = env::var("DATABASE_URL").expect("DATABASE_URL not set");
    PgPoolOptions::new().connect(&url).await
}
