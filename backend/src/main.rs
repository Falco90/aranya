use std::error::Error;
use std::env;
use sqlx::Row;
use dotenv::dotenv;

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    dotenv().ok();

    let url = env::var("DATABASE_URL").to_owned()?;
    let pool = sqlx::postgres::PgPool::connect(&url).await?;

    sqlx::migrate!("./migrations").run(&pool).await?;
    
    Ok(())
}
