# JWT RS256 Keys

This directory contains the RSA key pair used for JWT token signing and validation.

## Files
- `jwtRS256.key` - Private key (used by auth service to sign tokens)
- `jwtRS256.key.pub` - Public key (exposed via JWKS endpoint, used by API gateway to validate tokens)

## Security Notes
- **NEVER** commit the private key (`jwtRS256.key`) to version control
- The `.gitignore` file is configured to exclude this directory
- In production, use a proper secrets management solution (AWS Secrets Manager, HashiCorp Vault, etc.)

## Regenerating Keys

If you need to regenerate the keys:

```bash
cd keys
ssh-keygen -t rsa -b 2048 -m PEM -f jwtRS256.key -N ""
openssl rsa -in jwtRS256.key -pubout -outform PEM -out jwtRS256.key.pub
```

After regenerating, restart both services:
```bash
docker-compose -f docker-compose.app.yml restart app
cd ../api-gateway && docker-compose restart krakend
```
