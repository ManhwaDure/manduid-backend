# manduid-backend
만화두레 회원관리 시스템의 백엔드입니다. GraphQL Nexus, Prisma 라이브러리를 이용해 TypeScript 언어로 개발됐습니다.

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
- `/env/.env.test` : for test
- `/env/.env.dev` : for development
- `/env/.env.prod` : for production