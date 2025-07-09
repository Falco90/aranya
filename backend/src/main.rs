use dotenv::dotenv;
use sqlx::migrate::Migrator;
use sqlx::{Row, postgres::PgPoolOptions};
use std::env;
use std::error::Error;
use std::path::Path;

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    dotenv().ok();

    let url = env::var("DATABASE_URL")?;
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&url)
        .await?;

    // Runtime migrations (no macro!)
    let migrator = Migrator::new(Path::new("./migrations")).await?;
    migrator.run(&pool).await?;
    println!("Migrations applied successfully.");

    // Insert course
    sqlx::query("INSERT INTO course (title, creator, num_students) VALUES ($1, $2, $3)")
        .bind("Thai Language for Beginners")
        .bind("Boss")
        .bind(0)
        .execute(&pool)
        .await?;
    println!("Course added successfully!");

    Ok(())
}
