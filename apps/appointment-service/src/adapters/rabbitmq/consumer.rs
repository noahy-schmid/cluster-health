use std::sync::Arc;

use anyhow::Context;
use futures_lite::StreamExt;
use lapin::{
    options::{
        BasicAckOptions, BasicConsumeOptions, BasicNackOptions, BasicQosOptions,
        ExchangeDeclareOptions, QueueBindOptions, QueueDeclareOptions,
    },
    types::FieldTable,
    Connection, ConnectionProperties, ExchangeKind,
};
use tracing::{error, info, warn};

use crate::{
    adapters::rabbitmq::{
        publisher::RabbitMqPublisher,
        routing::{EXCHANGE, HELLO_QUEUE, HELLO_ROUTING_KEY},
    },
    application::use_cases::handle_hello::{HandleHelloCommand, HandleHelloUseCase},
    infrastructure::config::Config,
    proto::deinsalon::v1::{HelloRequest, HelloResponse},
};

/// Adapter: connects to RabbitMQ, declares topology, and dispatches inbound
/// messages to the appropriate use cases.
pub struct RabbitMqConsumer {
    connection: Connection,
}

impl RabbitMqConsumer {
    /// Establish a connection to RabbitMQ using the service configuration.
    pub async fn connect(config: &Config) -> anyhow::Result<Self> {
        let connection = Connection::connect(&config.rabbitmq_url, ConnectionProperties::default())
            .await
            .context("Failed to connect to RabbitMQ")?;

        info!(url = %config.rabbitmq_url, "Connected to RabbitMQ");

        Ok(Self { connection })
    }

    /// Declare all exchanges and queues, then begin consuming.
    ///
    /// This method drives the main event loop and only returns on error.
    pub async fn run(&self, handle_hello: Arc<HandleHelloUseCase>) -> anyhow::Result<()> {
        let channel = self.connection.create_channel().await?;

        // Limit in-flight messages per consumer to avoid memory pressure.
        channel
            .basic_qos(10, BasicQosOptions::default())
            .await?;

        // Declare a durable topic exchange.
        channel
            .exchange_declare(
                EXCHANGE,
                ExchangeKind::Topic,
                ExchangeDeclareOptions {
                    durable: true,
                    ..Default::default()
                },
                FieldTable::default(),
            )
            .await?;

        // Declare and bind the hello queue.
        channel
            .queue_declare(
                HELLO_QUEUE,
                QueueDeclareOptions {
                    durable: true,
                    ..Default::default()
                },
                FieldTable::default(),
            )
            .await?;

        channel
            .queue_bind(
                HELLO_QUEUE,
                EXCHANGE,
                HELLO_ROUTING_KEY,
                QueueBindOptions::default(),
                FieldTable::default(),
            )
            .await?;

        info!(queue = HELLO_QUEUE, "Listening for messages");

        let publisher = Arc::new(RabbitMqPublisher::new(
            self.connection.create_channel().await?,
        ));

        let mut consumer = channel
            .basic_consume(
                HELLO_QUEUE,
                "appointment-service",
                BasicConsumeOptions::default(),
                FieldTable::default(),
            )
            .await?;

        while let Some(delivery) = consumer.next().await {
            let delivery = delivery?;

            match serde_json::from_slice::<HelloRequest>(&delivery.data) {
                Ok(request) => {
                    let command = HandleHelloCommand {
                        message: request.message,
                        sender_id: request.sender_id,
                    };

                    match handle_hello.execute(command) {
                        Ok(result) => {
                            let response = HelloResponse {
                                message: result.message,
                                received_at: result.received_at,
                            };

                            if let Ok(payload) = serde_json::to_vec(&response) {
                                if let Err(e) = publisher
                                    .publish(EXCHANGE, "appointment.hello.response", payload)
                                    .await
                                {
                                    warn!(error = %e, "Failed to publish hello response");
                                }
                            }

                            delivery.ack(BasicAckOptions::default()).await?;
                        }
                        Err(e) => {
                            error!(error = %e, "HandleHelloUseCase failed");
                            delivery
                                .nack(BasicNackOptions {
                                    requeue: false,
                                    ..Default::default()
                                })
                                .await?;
                        }
                    }
                }
                Err(e) => {
                    error!(error = %e, "Failed to deserialize HelloRequest");
                    delivery
                        .nack(BasicNackOptions {
                            requeue: false,
                            ..Default::default()
                        })
                        .await?;
                }
            }
        }

        Ok(())
    }
}
