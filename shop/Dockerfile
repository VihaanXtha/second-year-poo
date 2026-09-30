# Storefront (Next.js 16) container for the local Docker stack.
# `next dev -p 3003` comes from the package.json script, so no command
# overrides are needed in docker-compose.yml.
FROM node:22-alpine

WORKDIR /app

# Dependencies first: this layer stays cached while app code changes.
# package-lock.json is committed, so `npm ci` is reproducible.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 3003

CMD ["npm", "run", "dev"]
