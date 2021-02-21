# manduid-backend
This is a backend of [ManhwaDurae member management system](https://id.caumd.club), developed with GraphQL Nexus, Prisma library and written in TypeScript language.

## How to build
```bash
yarn install
yarn nexus-build
yarn prisma-generate
yarn build
```

## Testing
To run all tests, see below.
```bash
yarn test
```

If you want to test only some specified tests, see below.
```bash
yarn test-for test/auth.test.ts
```

## env files
- `/env/.env.build` : for build
- `/env/.env.test` : for test
- `/env/.env.dev` : for development
- <del>`/env/.env.prod` : for production</del> This env file is now unused. For production, See docker section below.

## Use with section
To use with docker, you have to do these when running with docker.
 - Bind `/app/data` directory to somehwere good. `/app/data/prod_keys.json` will be used for oidc keystore file, automatically generated if not found.
 - Link with **MySQL/MariaDB** database properly
 - Set environment variables

You have to set some environment variables. See an example below. **DO NOT** set HTTP_PORT, GRAPHQL_PORT, OIDC_JWKS_PATH environment variables.
```
DATABASE_URL="mysql://example:example@localhost:3306/example"
HTTP_API_ENDPOINT="http://id.caumd.club/api"
OIDC_ISSUER="https://id.caumd.club"
SMTP_HOST="smtp.example.com"
SMTP_PORT=465
SMTP_SECURE="true"
SMTP_USER="noreply@caumd.club"
SMTP_PASS="password"
OAUTH2_JWT_SECRET="example_jwt_secret"
```

Docker container will automatically expose 4000 port for graphql and 4001 port for http. bind these ports properly for use.