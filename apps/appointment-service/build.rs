/// Build script: generates Rust types from the shared proto definitions at compile time.
///
/// Proto source lives in `packages/proto-types/proto/` (shared with TypeScript).
/// Output is written to `$OUT_DIR/` and included via `include!` in `src/proto/mod.rs`.
fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Use the vendored protoc binary — no system protoc required.
    let protoc_path = protoc_bin_vendored::protoc_bin_path()
        .expect("vendored protoc binary not found; check protoc-bin-vendored version");
    std::env::set_var("PROTOC", protoc_path);

    let proto_root = "../../packages/proto-types/proto";

    let proto_files = [
        format!("{proto_root}/deinsalon/v1/hello.proto"),
        format!("{proto_root}/deinsalon/v1/appointment_events.proto"),
    ];

    prost_build::Config::new()
        // Add serde Serialize/Deserialize to every generated type so we can
        // use JSON serialization for RabbitMQ message payloads.
        .type_attribute(".", "#[derive(serde::Serialize, serde::Deserialize)]")
        .type_attribute(".", "#[serde(rename_all = \"camelCase\")]")
        .compile_protos(&proto_files, &[proto_root])?;

    // Re-run this script when any proto file changes.
    println!("cargo:rerun-if-changed={proto_root}");

    Ok(())
}
