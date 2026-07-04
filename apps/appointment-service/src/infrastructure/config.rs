use anyhow::Context;

/// All configuration for the appointment service, sourced from environment variables.
///
/// Environment variables are never accessed directly outside this module —
/// this mirrors the `config.service.ts` / `config.interface.ts` pattern used
/// in the TypeScript domains.
#[derive(Debug, Clone)]
pub struct Config {
    /// AMQP URL for RabbitMQ, e.g. `amqp://admin:admin@localhost:5672`
    pub rabbitmq_url: String,
    /// Tracing filter directive, e.g. `info` or `appointment_service=debug`
    pub log_level: String,
}

impl Config {
    /// Load configuration from the process environment.
    ///
    /// A `.env` file is loaded first (if present) so local development works
    /// without exporting variables manually. In production the `.env` file
    /// is absent and real env vars take precedence.
    pub fn from_env() -> anyhow::Result<Self> {
        dotenvy::dotenv().ok(); // silently ignore missing .env

        Ok(Self {
            rabbitmq_url: std::env::var("RABBITMQ_URL")
                .unwrap_or_else(|_| "amqp://admin:admin@localhost:5672".to_string()),
            log_level: std::env::var("LOG_LEVEL").unwrap_or_else(|_| "info".to_string()),
        })
    }

    /// Build a config for integration tests, pointing at the given RabbitMQ URL.
    #[cfg(test)]
    pub fn for_test(rabbitmq_url: String) -> Self {
        Self {
            rabbitmq_url,
            log_level: "debug".to_string(),
        }
    }
}
