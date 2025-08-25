# Stage 1: build
FROM node:20-slim AS builder

WORKDIR /app

# copy service manifest as package.json
COPY package-services.json ./package.json

# install only production deps
RUN npm install --omit=dev

# copy service code
COPY services/ ./services/

# Stage 2: final image for AWS Lambda
FROM public.ecr.aws/lambda/nodejs:20

WORKDIR /var/task

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/services ./services

CMD [ "services/db_watcher.handler" ]
