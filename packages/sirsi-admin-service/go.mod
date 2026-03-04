module github.com/sirsimaster/sirsi-admin-service

go 1.25.5

require (
	connectrpc.com/connect v1.19.1
	github.com/sirsimaster/sirsi-nexus/gen/go v0.0.0-00010101000000-000000000000
	golang.org/x/net v0.49.0
)

require (
	golang.org/x/text v0.33.0 // indirect
	google.golang.org/protobuf v1.36.11 // indirect
)

replace github.com/sirsimaster/sirsi-nexus/gen/go => ../../proto/gen/go
