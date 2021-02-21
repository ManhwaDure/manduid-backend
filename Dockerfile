FROM node:14
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install
COPY . .
RUN yarn prisma-generate && yarn nexus-build && yarn build
ENV GRAPHQL_PORT=4000
ENV HTTP_PORT=4001
ENV OIDC_JWKS_PATH=data/prod_keys.json
EXPOSE 4000
EXPOSE 4001
CMD [ "yarn", "start-for-docker" ]