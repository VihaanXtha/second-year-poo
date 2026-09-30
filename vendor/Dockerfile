# Vendor portal (React 19 + Vite) container for the local Docker stack.
# Vite's dev server already binds 0.0.0.0:3002 via vite.config.ts, so no
# command overrides are needed in docker-compose.yml.
FROM node:22-alpine

WORKDIR /app

# Dependencies first: this layer stays cached while app code changes.
# package-lock.json is committed, so `npm ci` is reproducible.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 3002

CMD ["npm", "run", "dev"]
