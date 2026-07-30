# Use Node 18 on Debian bookworm to satisfy Rollup native binary requirements
FROM node:18-bookworm

WORKDIR /usr/src/app

# Install dependencies for server and client separately
COPY package.json package-lock.json ./
COPY server/package.json server/package-lock.json ./server/
COPY client/package.json client/package-lock.json ./client/

RUN npm install --prefix server
RUN npm install --prefix client

# Copy source files after installing dependencies for better cache behavior
COPY . .

# Build the React app and copy it into server/public via the existing script
RUN npm run build

ENV PORT=5000
EXPOSE 5000

CMD ["npm", "start", "--prefix", "server"]
