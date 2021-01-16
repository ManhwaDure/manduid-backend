# manduid-backend
만화두레 회원관리 시스템의 백엔드입니다. GraphQL Nexus, Prisma 라이브러리를 이용해 TypeScript 언어로 개발됐습니다.

## How to build
```bash
yarn install
yarn nexus-build
yarn prisma-generate
yarn build
```

## env files
- `/env/.env.test` : for test
- `/env/.env.dev` : for development
- `/env/.env.prod` : for production