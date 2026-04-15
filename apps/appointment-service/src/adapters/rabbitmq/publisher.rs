use lapin::{
    options::BasicPublishOptions, BasicProperties, Channel,
};
use tracing::debug;

/// Adapter: publishes JSON-serialized messages to a RabbitMQ exchange.
pub struct RabbitMqPublisher {
    channel: Channel,
}

impl RabbitMqPublisher {
    pub fn new(channel: Channel) -> Self {
        Self { channel }
    }

    pub async fn publish(
        &self,
        exchange: &str,
        routing_key: &str,
        payload: Vec<u8>,
    ) -> anyhow::Result<()> {
        self.channel
            .basic_publish(
                exchange,
                routing_key,
                BasicPublishOptions::default(),
                &payload,
                BasicProperties::default()
                    .with_content_type("application/json".into())
                    .with_delivery_mode(2), // persistent
            )
            .await?
            .await?;

        debug!(exchange, routing_key, "Published message");
        Ok(())
    }
}
