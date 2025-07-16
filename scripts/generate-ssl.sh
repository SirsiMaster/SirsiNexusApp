#!/bin/bash

# SSL Certificate Generation Script for SirsiNexus
# Generates self-signed certificates for development and production testing

set -euo pipefail

# Configuration
SSL_DIR="nginx/ssl"
CERT_FILE="server.crt"
KEY_FILE="server.key"
COUNTRY="US"
STATE="California"
CITY="San Francisco"
ORG="SirsiNexus"
ORG_UNIT="IT Department"
COMMON_NAME="localhost"
EMAIL="admin@sirsinexus.local"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

# Create SSL directory
create_ssl_dir() {
    log "Creating SSL directory: $SSL_DIR"
    mkdir -p "$SSL_DIR"
}

# Generate SSL certificate
generate_certificate() {
    log "Generating SSL certificate..."
    
    # Create certificate signing request configuration
    cat > "$SSL_DIR/cert.conf" << EOF
[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn
req_extensions = v3_req

[dn]
C=$COUNTRY
ST=$STATE
L=$CITY
O=$ORG
OU=$ORG_UNIT
CN=$COMMON_NAME
emailAddress=$EMAIL

[v3_req]
basicConstraints = CA:FALSE
keyUsage = nonRepudiation, digitalSignature, keyEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
DNS.2 = *.localhost
DNS.3 = sirsinexus.local
DNS.4 = *.sirsinexus.local
IP.1 = 127.0.0.1
IP.2 = ::1
EOF

    # Generate private key
    log "Generating private key..."
    openssl genrsa -out "$SSL_DIR/$KEY_FILE" 2048
    
    # Generate certificate signing request
    log "Generating certificate signing request..."
    openssl req -new -key "$SSL_DIR/$KEY_FILE" -out "$SSL_DIR/server.csr" -config "$SSL_DIR/cert.conf"
    
    # Generate self-signed certificate
    log "Generating self-signed certificate..."
    openssl x509 -req -days 365 -in "$SSL_DIR/server.csr" -signkey "$SSL_DIR/$KEY_FILE" -out "$SSL_DIR/$CERT_FILE" -extensions v3_req -extfile "$SSL_DIR/cert.conf"
    
    # Set appropriate permissions
    chmod 600 "$SSL_DIR/$KEY_FILE"
    chmod 644 "$SSL_DIR/$CERT_FILE"
    
    # Cleanup
    rm "$SSL_DIR/server.csr" "$SSL_DIR/cert.conf"
}

# Verify certificate
verify_certificate() {
    log "Verifying certificate..."
    
    if openssl x509 -in "$SSL_DIR/$CERT_FILE" -text -noout > /dev/null 2>&1; then
        log "Certificate verification successful"
        
        # Display certificate info
        log "Certificate details:"
        openssl x509 -in "$SSL_DIR/$CERT_FILE" -subject -dates -noout
        
        # Display SAN extensions
        log "Subject Alternative Names:"
        openssl x509 -in "$SSL_DIR/$CERT_FILE" -text -noout | grep -A 1 "Subject Alternative Name" || true
    else
        error "Certificate verification failed"
        exit 1
    fi
}

# Main function
main() {
    log "Starting SSL certificate generation for SirsiNexus"
    
    # Check if openssl is available
    if ! command -v openssl &> /dev/null; then
        error "OpenSSL is not installed"
        exit 1
    fi
    
    # Check if certificates already exist
    if [ -f "$SSL_DIR/$CERT_FILE" ] && [ -f "$SSL_DIR/$KEY_FILE" ]; then
        warn "SSL certificates already exist"
        read -p "Do you want to regenerate them? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log "Keeping existing certificates"
            exit 0
        fi
    fi
    
    create_ssl_dir
    generate_certificate
    verify_certificate
    
    log "SSL certificate generation completed successfully!"
    log "Certificate: $SSL_DIR/$CERT_FILE"
    log "Private key: $SSL_DIR/$KEY_FILE"
    log ""
    log "For production use, replace these self-signed certificates with"
    log "certificates from a trusted Certificate Authority (CA)."
}

# Run main function
main "$@"
