# Use Node.js LTS Alpine image for minimal size and high security
FROM node:20-alpine

# Set non-interactive production mode
ENV NODE_ENV=production

# Install sqlite build dependencies if necessary (Alpine needs build-base/python3 for node-gyp)
# However, prebuilt sqlite3 binaries usually work. Let's install them just in case.
RUN apk add --no-cache python3 make g++

WORKDIR /usr/src/app

# Copy package configurations
COPY package*.json ./

# Install production dependencies only (skips devDependencies)
RUN npm ci --only=production

# Copy server code and assets
COPY . .

# Create directory for uploads if it doesn't exist
RUN mkdir -p uploads

# Expose server port
EXPOSE 5000

# Start server
CMD [ "npm", "start" ]
