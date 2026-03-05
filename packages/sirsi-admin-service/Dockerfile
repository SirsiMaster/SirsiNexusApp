# Sirsi Admin Service — Multi-stage Dockerfile
# Stage 1: Build the Go binary (vendored dependencies)
# Stage 2: Minimal Alpine runtime

# ── Build Stage ────────────────────────────────────────────────────
FROM golang:1.24-alpine AS builder

WORKDIR /build

# Copy everything including vendor/
COPY . .

# Build static binary using vendored deps (no network needed)
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
    -mod=vendor \
    -ldflags="-s -w" \
    -o sirsi-admin .


# ── Runtime Stage ──────────────────────────────────────────────────
FROM alpine:3.19

RUN apk add --no-cache ca-certificates tzdata

# Non-root user
RUN adduser -D -u 1000 sirsi
USER sirsi

WORKDIR /app

COPY --from=builder /build/sirsi-admin .
COPY --from=builder /build/settings.json .

# Cloud Run uses PORT env variable
ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["./sirsi-admin"]
