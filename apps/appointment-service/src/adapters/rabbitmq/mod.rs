pub mod consumer;
pub mod publisher;

/// Exchange and queue names used by the appointment service.
pub mod routing {
    pub const EXCHANGE: &str = "deinsalon.appointment";
    pub const HELLO_QUEUE: &str = "deinsalon.appointment.hello";
    pub const HELLO_ROUTING_KEY: &str = "appointment.hello";
}
