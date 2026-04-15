use chrono::Utc;
use thiserror::Error;
use tracing::info;

/// Inbound command received from a `HelloRequest` message on RabbitMQ.
#[derive(Debug, Clone)]
pub struct HandleHelloCommand {
    pub message: String,
    pub sender_id: String,
}

/// Outbound result produced by the use case.
#[derive(Debug, Clone)]
pub struct HandleHelloResult {
    pub message: String,
    /// ISO 8601 timestamp of when the message was processed.
    pub received_at: String,
}

/// Errors that can occur while handling a hello message.
#[derive(Debug, Error)]
pub enum HandleHelloError {
    #[error("Message cannot be empty")]
    EmptyMessage,
}

/// Use case: handle an incoming HelloRequest and return a HelloResponse payload.
///
/// This is the hello-world smoke-test for the RabbitMQ integration. It contains
/// no I/O and is therefore trivially unit-testable.
pub struct HandleHelloUseCase;

impl HandleHelloUseCase {
    pub fn new() -> Self {
        Self
    }

    pub fn execute(
        &self,
        command: HandleHelloCommand,
    ) -> Result<HandleHelloResult, HandleHelloError> {
        if command.message.trim().is_empty() {
            return Err(HandleHelloError::EmptyMessage);
        }

        info!(
            sender_id = %command.sender_id,
            message = %command.message,
            "Received hello"
        );

        Ok(HandleHelloResult {
            message: format!(
                "appointment-service says hello back! You sent: \"{}\"",
                command.message
            ),
            received_at: Utc::now().to_rfc3339(),
        })
    }
}

impl Default for HandleHelloUseCase {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn happy_path_returns_response() {
        let uc = HandleHelloUseCase::new();
        let result = uc.execute(HandleHelloCommand {
            message: "ping".into(),
            sender_id: "test-sender".into(),
        });
        assert!(result.is_ok());
        let r = result.unwrap();
        assert!(r.message.contains("ping"));
        assert!(!r.received_at.is_empty());
    }

    #[test]
    fn empty_message_returns_error() {
        let uc = HandleHelloUseCase::new();
        let result = uc.execute(HandleHelloCommand {
            message: "   ".into(),
            sender_id: "test-sender".into(),
        });
        assert!(matches!(result, Err(HandleHelloError::EmptyMessage)));
    }
}
