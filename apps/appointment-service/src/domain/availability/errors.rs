use thiserror::Error;

/// Domain errors for the StylistAvailability aggregate.
#[derive(Debug, Error)]
pub enum AvailabilityError {
    #[error("Invalid time slot: {message}")]
    InvalidSlot { message: String },

    #[error("Overlapping time slot: {message}")]
    OverlappingSlot { message: String },
}
