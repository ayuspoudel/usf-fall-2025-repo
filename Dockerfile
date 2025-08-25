# Builder Stage
FROM node:20-alpine AS builder

WORKDIR /app

# copy service manifest
COPY package-service.json ./

# install only production deps
RUN npm install --omit=dev --package-json ./package-service.json

# copy service code
COPY services/ ./services/

# Runtime Stage (Lambda base) 
FROM public.ecr.aws/lambda/nodejs:20

WORKDIR /var/task

# copy deps from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/services ./services

# set Lambda handler
CMD [ "services/db_watcher.handler" ]
