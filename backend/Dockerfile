# Multi-stage build for Rust backend
FROM rust:1.75 as builder

WORKDIR /app

# Copy Cargo files
COPY Cargo.toml Cargo.lock ./

# Cache dependencies
RUN mkdir -p src && \
    echo "fn main() {}" > src/main.rs && \
    cargo build --release && \
    rm -rf src

# Copy source code
COPY src ./src

# Build the application
RUN touch src/main.rs && \
    cargo build --release

# Final stage
FROM debian:bookworm-slim

RUN apt-get update && \
    apt-get install -y ca-certificates && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy binary from builder
COPY --from=builder /app/target/release/synthia /app/synthia

# Create workspace directory
RUN mkdir -p /app/workspace/{models,memory,skills}

# Expose port
EXPOSE 42617

# Set environment defaults
ENV PORT=42617
ENV HOST=0.0.0.0
ENV WORKSPACE_ROOT=/app/workspace
ENV DEFAULT_PROVIDER=liquid

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:42617/health || exit 1

# Run the application
CMD ["/app/synthia"]
