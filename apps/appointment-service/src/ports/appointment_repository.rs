use async_trait::async_trait;
use thiserror::Error;
use uuid::Uuid;

use crate::domain::appointment::aggregate::Appointment;

/// Infrastructure errors surfaced through the repository port.
///
/// Adapters must convert their own low-level errors (SQL, network, etc.) into
/// these variants before returning, so the application layer stays decoupled
/// from storage technology.
#[derive(Debug, Error)]
pub enum AppointmentRepositoryError {
    #[error("Appointment not found: {id}")]
    NotFound { id: Uuid },

    #[error("Infrastructure error: {message}")]
    Infrastructure { message: String },
}

/// Port: persist and retrieve Appointment aggregates.
///
/// Concrete implementations live in `adapters/`. Tests can swap in an
/// in-memory implementation without touching the application layer.
#[async_trait]
pub trait AppointmentRepository: Send + Sync {
    async fn save(&self, appointment: &Appointment) -> Result<(), AppointmentRepositoryError>;

    async fn find_by_id(
        &self,
        id: Uuid,
    ) -> Result<Option<Appointment>, AppointmentRepositoryError>;
}
