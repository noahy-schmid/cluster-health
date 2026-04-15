use chrono::{DateTime, Utc};
use uuid::Uuid;

use super::errors::AppointmentError;

/// Strongly-typed wrapper around the appointment UUID.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct AppointmentId(Uuid);

impl AppointmentId {
    pub fn new() -> Self {
        Self(Uuid::new_v4())
    }

    pub fn from_uuid(id: Uuid) -> Self {
        Self(id)
    }

    pub fn value(&self) -> Uuid {
        self.0
    }
}

impl Default for AppointmentId {
    fn default() -> Self {
        Self::new()
    }
}

/// Lifecycle status of an appointment.
#[derive(Debug, Clone, PartialEq)]
pub enum AppointmentStatus {
    Confirmed,
    Cancelled { reason: String },
}

/// The Appointment aggregate root.
///
/// All state mutations are driven through methods that enforce business rules,
/// returning typed errors on violations rather than panicking.
/// The aggregate never talks directly to a database or message bus — those
/// concerns belong in ports and adapters.
#[derive(Debug, Clone)]
pub struct Appointment {
    pub id: AppointmentId,
    pub salon_id: String,
    pub stylist_id: String,
    pub service_id: String,
    pub starts_at: DateTime<Utc>,
    pub ends_at: DateTime<Utc>,
    pub customer_id: String,
    pub status: AppointmentStatus,
}

impl Appointment {
    /// Book a new appointment. Validates that the time range is sensible and
    /// that the start time is not already in the past.
    pub fn book(
        salon_id: String,
        stylist_id: String,
        service_id: String,
        starts_at: DateTime<Utc>,
        ends_at: DateTime<Utc>,
        customer_id: String,
    ) -> Result<Self, AppointmentError> {
        if starts_at >= ends_at {
            return Err(AppointmentError::InvalidTimeRange { starts_at, ends_at });
        }

        if starts_at < Utc::now() {
            return Err(AppointmentError::AppointmentInThePast { starts_at });
        }

        Ok(Self {
            id: AppointmentId::new(),
            salon_id,
            stylist_id,
            service_id,
            starts_at,
            ends_at,
            customer_id,
            status: AppointmentStatus::Confirmed,
        })
    }

    /// Cancel an already-confirmed appointment.
    pub fn cancel(&mut self, reason: String) -> Result<(), AppointmentError> {
        match &self.status {
            AppointmentStatus::Cancelled { .. } => Err(AppointmentError::AlreadyCancelled {
                id: self.id.value(),
            }),
            AppointmentStatus::Confirmed => {
                self.status = AppointmentStatus::Cancelled { reason };
                Ok(())
            }
        }
    }

    pub fn is_confirmed(&self) -> bool {
        matches!(self.status, AppointmentStatus::Confirmed)
    }
}
