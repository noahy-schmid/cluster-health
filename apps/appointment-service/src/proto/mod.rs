/// Prost-generated types from the shared proto definitions.
///
/// These are produced at compile time by `build.rs` and written to `$OUT_DIR`.
/// Use these types for binary protobuf serialization; for JSON over RabbitMQ
/// the same types are also serde-capable (see the `#[serde]` attributes in build.rs).
pub mod deinsalon {
    pub mod v1 {
        include!(concat!(env!("OUT_DIR"), "/deinsalon.v1.rs"));
    }
}
