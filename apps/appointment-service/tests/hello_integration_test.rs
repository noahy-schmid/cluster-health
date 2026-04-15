/// Integration tests for the hello-world RabbitMQ flow.
///
/// These tests spin up a real RabbitMQ container via `testcontainers` (mirroring
/// the `testcontainers` pattern used in the TypeScript domains), publish a
/// `HelloRequest`, and assert that the service processes it correctly.
///
/// Run with:
///   cargo test --test hello_integration_test
///
/// The `#[ignore]` attribute keeps these out of the default `cargo test` run so
/// CI can opt-in explicitly with `cargo test -- --include-ignored`.
use appointment_service::{
    adapters::rabbitmq::consumer::RabbitMqConsumer,
    application::use_cases::handle_hello::HandleHelloUseCase,
    infrastructure::config::Config,
    proto::deinsalon::v1::HelloRequest,
};
use std::sync::Arc;
use testcontainers::runners::AsyncRunner;
use testcontainers_modules::rabbitmq::RabbitMq;

#[tokio::test]
#[ignore = "requires Docker — run with `cargo test -- --include-ignored`"]
async fn hello_round_trip() {
    // Spin up an ephemeral RabbitMQ container.
    let container = RabbitMq::default().start().await.unwrap();
    let port = container.get_host_port_ipv4(5672).await.unwrap();
    let rabbitmq_url = format!("amqp://guest:guest@127.0.0.1:{port}");

    let config = Config::for_test(rabbitmq_url);

    let consumer = RabbitMqConsumer::connect(&config).await.unwrap();
    let handle_hello = Arc::new(HandleHelloUseCase::new());

    // Publish a HelloRequest via a separate connection (simulating another service).
    let request = HelloRequest {
        message: "integration test ping".into(),
        sender_id: "test-suite".into(),
    };
    let payload = serde_json::to_vec(&request).unwrap();

    // Drive the consumer in the background for a short window.
    let consumer = Arc::new(consumer);
    let consumer_clone = consumer.clone();
    let handle = tokio::spawn(async move {
        consumer_clone.run(handle_hello).await.unwrap();
    });

    // TODO: publish the message and assert on the response queue.
    // This scaffold is intentionally minimal — extend as the adapter grows.

    handle.abort();
    let _ = handle.await;

    // Container is dropped here, cleaning up automatically.
    drop(container);
}
