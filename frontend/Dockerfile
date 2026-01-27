FROM node:20-alpine

WORKDIR /app

# Copy package files first for caching
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Vite default port
EXPOSE 5173

# Development command
CMD ["npm", "run", "dev", "--", "--host"]
