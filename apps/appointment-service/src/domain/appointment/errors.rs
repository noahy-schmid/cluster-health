use chrono::{DateTime, Utc};
use thiserror::Error;
use uuid::Uuid;

/// Domain errors for the Appointment aggregate.
///
/// These are pure business rule violations — no I/O error types here.
/// Adapters map infrastructure errors to `anyhow::Error` before they reach this layer.
#[derive(Debug, Error)]
pub enum AppointmentError {
    #[error("Appointment start time {starts_at} must be before end time {ends_at}")]
    InvalidTimeRange {
        starts_at: DateTime<Utc>,
        ends_at: DateTime<Utc>,
    },

    #[error("Appointment cannot be booked in the past (starts at {starts_at})")]
    AppointmentInThePast { starts_at: DateTime<Utc> },

    #[error("Appointment {id} is already cancelled")]
    AlreadyCancelled { id: Uuid },
}
