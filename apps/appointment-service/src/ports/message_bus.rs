use async_trait::async_trait;

/// Port: publish a serialized message to an exchange.
///
/// The RabbitMQ adapter implements this trait. Other adapters (e.g. an
/// in-memory bus for tests) can implement it independently, keeping use cases
/// free of infrastructure concerns.
#[async_trait]
pub trait MessagePublisher: Send + Sync {
    type Error: std::error::Error + Send + Sync + 'static;

    /// Publish a raw byte payload to the given exchange with the given routing key.
    async fn publish(
        &self,
        exchange: &str,
        routing_key: &str,
        payload: Vec<u8>,
    ) -> Result<(), Self::Error>;
}

/// Port: consume messages from a named queue.
///
/// The handler closure receives the raw byte payload and is responsible for
/// deserializing and dispatching it to the appropriate use case.
#[async_trait]
pub trait MessageConsumer: Send + Sync {
    type Error: std::error::Error + Send + Sync + 'static;

    async fn consume(
        &self,
        queue: &str,
        handler: Box<
            dyn Fn(Vec<u8>) -> std::pin::Pin<
                Box<dyn std::future::Future<Output = anyhow::Result<()>> + Send>,
            > + Send
            + Sync,
        >,
    ) -> Result<(), Self::Error>;
}
