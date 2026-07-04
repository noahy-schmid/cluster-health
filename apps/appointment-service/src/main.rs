use appointment_service::{
    adapters::rabbitmq::consumer::RabbitMqConsumer,
    application::use_cases::handle_hello::HandleHelloUseCase,
    infrastructure::config::Config,
};
use std::sync::Arc;
use tracing::info;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let config = Config::from_env()?;

    tracing_subscriber::fmt()
        .with_env_filter(&config.log_level)
        .json()
        .init();

    info!(service = "appointment-service", "Starting up");

    // Compose use cases (pure, no I/O dependencies)
    let handle_hello = Arc::new(HandleHelloUseCase::new());

    // Wire the RabbitMQ adapter and begin consuming
    let consumer = RabbitMqConsumer::connect(&config).await?;
    consumer.run(handle_hello).await?;

    Ok(())
}
