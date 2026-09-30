# Node 22 (LTS) so all four JS apps in the Docker stack use the same base image;
# it also satisfies Next 16's >=20.9 engine requirement used by the shop app.
FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0"]
