# Contracts gRPC Service

gRPC service for contract management, deployed to Cloud Run.

## Features
- Contract CRUD operations
- Template generation with custom theming
- Stripe payment integration
- Bidirectional streaming for real-time events (future)

## Development

```bash
# Install dependencies
npm install

# Generate proto clients
npm run proto:gen

# Run locally
npm run dev
```

## Deployment

```bash
# Build and push to Container Registry
gcloud builds submit --tag gcr.io/sirsi-nexus-live/contracts-grpc

# Deploy to Cloud Run
gcloud run deploy contracts-grpc \
  --image gcr.io/sirsi-nexus-live/contracts-grpc \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars STRIPE_SECRET_KEY=sk_xxx
```

## Proto Generation

This service uses [Buf](https://buf.build/) for proto management:

```bash
# Install buf CLI
npm install -g @bufbuild/buf

# Generate TypeScript clients
npm run proto:gen
```

Generated files will be in `gen/` directory.
