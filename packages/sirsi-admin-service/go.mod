module github.com/sirsimaster/sirsi-admin-service

go 1.24.0

require (
	connectrpc.com/connect v1.19.1
	github.com/google/go-github/v60 v60.0.0
	github.com/jackc/pgx/v5 v5.8.0
	github.com/sirsimaster/sirsi-nexus/gen/go v0.0.0-00010101000000-000000000000
	github.com/stripe/stripe-go/v82 v82.5.1
	golang.org/x/net v0.49.0
	golang.org/x/oauth2 v0.35.0
)

require (
	github.com/google/go-querystring v1.1.0 // indirect
	github.com/jackc/pgpassfile v1.0.0 // indirect
	github.com/jackc/pgservicefile v0.0.0-20240606120523-5a60cdf6a761 // indirect
	github.com/jackc/puddle/v2 v2.2.2 // indirect
	golang.org/x/sync v0.19.0 // indirect
	golang.org/x/text v0.33.0 // indirect
	google.golang.org/protobuf v1.36.11 // indirect
)

replace github.com/sirsimaster/sirsi-nexus/gen/go => ../../proto/gen/go
