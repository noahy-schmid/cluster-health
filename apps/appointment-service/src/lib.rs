/// Appointment service library root.
///
/// Exposes all internal modules so integration tests (under `tests/`) can
/// import them directly without needing `use appointment_service::*` hacks.
pub mod adapters;
pub mod application;
pub mod domain;
pub mod infrastructure;
pub mod ports;
pub mod proto;
