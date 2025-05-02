# Build Stage
FROM node:lts as builder

WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Set environment variables and create .env file in one step to reduce layers
ARG NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL
ARG API_URL
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_CLERK_SIGN_IN_URL
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_CLERK_SIGN_UP_URL
ARG CLERK_SECRET_KEY=$CLERK_SECRET_KEY
ARG NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL
ARG RPC_URL
ARG NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL
ARG NEXT_PUBLIC_NODE_ENV
ARG INTERCOM_SECRET_KEY
ARG NEXT_PUBLIC_INTERCOM_APP_ID


RUN echo "NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=$NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL" >> .env && \
    echo "API_URL=$API_URL" >> .env && \
    echo "NEXT_PUBLIC_CLERK_SIGN_IN_URL=$NEXT_PUBLIC_CLERK_SIGN_IN_URL" >> .env && \
    echo "NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL" >> .env && \
    echo "NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL" >> .env && \
    echo "NEXT_PUBLIC_CLERK_SIGN_UP_URL=$NEXT_PUBLIC_CLERK_SIGN_UP_URL" >> .env && \
    echo "CLERK_SECRET_KEY=$CLERK_SECRET_KEY" >> .env && \
    echo "NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=$NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL" >> .env && \
    echo "RPC_URL=$RPC_URL" >> .env && \
    echo "NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=$NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL" >> .env && \
    echo "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" >> .env && \
    echo "NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=$NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL" >> .env \
    echo "NEXT_PUBLIC_NODE_ENV=$NEXT_PUBLIC_NODE_ENV" >> .env \
    echo "INTERCOM_SECRET_KEY=$INTERCOM_SECRET_KEY" >> .env \
    echo "NEXT_PUBLIC_INTERCOM_APP_ID=$NEXT_PUBLIC_INTERCOM_APP_ID" >> .env

# Copy all project files and build the Next.js app
COPY . .
RUN npm run build

# Production Stage
FROM node:20.17-alpine

WORKDIR /app

# Copy only the necessary files for production
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.env ./

# Expose the port the app will run on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
