# ── Stage 1: build ────────────────────────────────────────────────────────────
FROM rust:1.86-slim AS builder

# System deps required by prost-build / openssl
RUN apt-get update && apt-get install -y --no-install-recommends \
    pkg-config \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /build

# Copy the shared proto definitions first (referenced by build.rs).
COPY packages/proto-types/proto ./packages/proto-types/proto

# Copy the Rust service.
COPY apps/appointment-service ./apps/appointment-service

WORKDIR /build/apps/appointment-service

# Build in release mode.
RUN cargo build --release --bin appointment-service

# ── Stage 2: runtime ──────────────────────────────────────────────────────────
FROM debian:bookworm-slim AS runtime

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Run as non-root.
RUN useradd --no-create-home --shell /bin/false appuser
USER appuser

COPY --from=builder \
    /build/apps/appointment-service/target/release/appointment-service \
    /usr/local/bin/appointment-service

ENV LOG_LEVEL=info
ENV RABBITMQ_URL=amqp://admin:admin@rabbitmq:5672

ENTRYPOINT ["/usr/local/bin/appointment-service"]
