# Docker Deployment Guide

## Overview

Docker deployment provides a consistent, portable environment for running the application across different platforms and cloud providers.

## Docker Configuration

### Dockerfile

```dockerfile
# Multi-stage build for optimized production image
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Docker Compose

```yaml
# docker-compose.yml
version: "3.8"

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/jobtracker
      - AUTH_SECRET=${AUTH_SECRET}
      - AUTH_DISCORD_ID=${AUTH_DISCORD_ID}
      - AUTH_DISCORD_SECRET=${AUTH_DISCORD_SECRET}
      - NEXTAUTH_URL=http://localhost:3000
    depends_on:
      db:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=jobtracker
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

### Environment File

```bash
# .env.docker
NODE_ENV=production
AUTH_SECRET=your-32-character-production-secret
AUTH_DISCORD_ID=your-discord-client-id
AUTH_DISCORD_SECRET=your-discord-client-secret
DATABASE_URL=postgresql://postgres:password@db:5432/jobtracker
NEXTAUTH_URL=http://localhost:3000
SENTRY_DSN=https://your-dsn@sentry.io/project-id
```

## Local Docker Development

### Build and Run

```bash
# Build the Docker image
docker build -t job-application-tracker .

# Run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

### Development with Hot Reload

```yaml
# docker-compose.dev.yml
version: "3.8"

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next
    environment:
      - NODE_ENV=development
    command: npm run dev
```

```dockerfile
# Dockerfile.dev
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
```

## Production Deployment

### Cloud Platforms

#### AWS ECS

```json
{
  "family": "job-application-tracker",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "app",
      "image": "your-account.dkr.ecr.region.amazonaws.com/job-tracker:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:database-url"
        }
      ],
      "healthCheck": {
        "command": [
          "CMD-SHELL",
          "curl -f http://localhost:3000/api/health || exit 1"
        ],
        "interval": 30,
        "timeout": 5,
        "retries": 3
      }
    }
  ]
}
```

#### Google Cloud Run

```yaml
# cloudrun.yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: job-application-tracker
spec:
  template:
    metadata:
      annotations:
        autoscaling.knative.dev/maxScale: "10"
        run.googleapis.com/cpu-throttling: "false"
    spec:
      containerConcurrency: 100
      containers:
        - image: gcr.io/project-id/job-tracker:latest
          ports:
            - containerPort: 3000
          env:
            - name: NODE_ENV
              value: "production"
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: database-url
                  key: url
          resources:
            limits:
              cpu: "1"
              memory: "512Mi"
          livenessProbe:
            httpGet:
              path: /api/health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
```

#### DigitalOcean App Platform

```yaml
# .do/app.yaml
name: job-application-tracker
services:
  - name: web
    source_dir: /
    github:
      repo: your-username/job-application-tracker
      branch: main
    run_command: npm start
    environment_slug: node-js
    instance_count: 1
    instance_size_slug: basic-xxs
    envs:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        value: ${DATABASE_URL}
      - key: AUTH_SECRET
        value: ${AUTH_SECRET}
    health_check:
      http_path: /api/health
databases:
  - name: db
    engine: PG
    version: "13"
```

## Container Registry

### Docker Hub

```bash
# Build and tag image
docker build -t your-username/job-application-tracker:latest .

# Push to Docker Hub
docker push your-username/job-application-tracker:latest

# Pull and run
docker pull your-username/job-application-tracker:latest
docker run -p 3000:3000 your-username/job-application-tracker:latest
```

### AWS ECR

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789012.dkr.ecr.us-east-1.amazonaws.com

# Build and tag
docker build -t job-tracker .
docker tag job-tracker:latest 123456789012.dkr.ecr.us-east-1.amazonaws.com/job-tracker:latest

# Push to ECR
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/job-tracker:latest
```

### Google Container Registry

```bash
# Configure Docker for GCR
gcloud auth configure-docker

# Build and tag
docker build -t gcr.io/project-id/job-tracker:latest .

# Push to GCR
docker push gcr.io/project-id/job-tracker:latest
```

## Kubernetes Deployment

### Deployment Manifest

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: job-application-tracker
spec:
  replicas: 3
  selector:
    matchLabels:
      app: job-application-tracker
  template:
    metadata:
      labels:
        app: job-application-tracker
    spec:
      containers:
        - name: app
          image: your-registry/job-tracker:latest
          ports:
            - containerPort: 3000
          env:
            - name: NODE_ENV
              value: "production"
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: app-secrets
                  key: database-url
            - name: AUTH_SECRET
              valueFrom:
                secretKeyRef:
                  name: app-secrets
                  key: auth-secret
          resources:
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "500m"
          livenessProbe:
            httpGet:
              path: /api/health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /api/health
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
```

### Service and Ingress

```yaml
# k8s/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: job-application-tracker-service
spec:
  selector:
    app: job-application-tracker
  ports:
    - port: 80
      targetPort: 3000
  type: ClusterIP

---
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: job-application-tracker-ingress
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
    - hosts:
        - your-domain.com
      secretName: app-tls
  rules:
    - host: your-domain.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: job-application-tracker-service
                port:
                  number: 80
```

## Database Migration

### Migration in Docker

```bash
# Run migrations in container
docker-compose exec app npx prisma migrate deploy

# Or as init container in Kubernetes
apiVersion: batch/v1
kind: Job
metadata:
  name: db-migration
spec:
  template:
    spec:
      containers:
      - name: migrate
        image: your-registry/job-tracker:latest
        command: ["npx", "prisma", "migrate", "deploy"]
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: database-url
      restartPolicy: Never
```

## Monitoring and Logging

### Container Monitoring

```yaml
# Prometheus monitoring
apiVersion: v1
kind: Service
metadata:
  name: app-metrics
  labels:
    app: job-application-tracker
spec:
  ports:
    - port: 3000
      name: metrics
  selector:
    app: job-application-tracker

---
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: app-monitor
spec:
  selector:
    matchLabels:
      app: job-application-tracker
  endpoints:
    - port: metrics
      path: /api/health
```

### Log Aggregation

```yaml
# Fluentd configuration for log collection
apiVersion: v1
kind: ConfigMap
metadata:
  name: fluentd-config
data:
  fluent.conf: |
    <source>
      @type tail
      path /var/log/containers/*job-application-tracker*.log
      pos_file /var/log/fluentd-containers.log.pos
      tag kubernetes.*
      format json
    </source>

    <match kubernetes.**>
      @type elasticsearch
      host elasticsearch.logging.svc.cluster.local
      port 9200
      index_name kubernetes
    </match>
```

## Security Considerations

### Container Security

```dockerfile
# Security best practices in Dockerfile
FROM node:20-alpine AS base

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set security headers
RUN apk add --no-cache dumb-init

# Use non-root user
USER nextjs

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
```

### Secrets Management

```bash
# Use Docker secrets
echo "your-secret-value" | docker secret create auth_secret -

# Reference in compose file
services:
  app:
    secrets:
      - auth_secret
    environment:
      - AUTH_SECRET_FILE=/run/secrets/auth_secret

secrets:
  auth_secret:
    external: true
```

## Troubleshooting

### Common Docker Issues

#### **Build Failures**

```bash
# Check build context
docker build --no-cache -t job-tracker .

# Debug build stages
docker build --target deps -t job-tracker:deps .
docker run -it job-tracker:deps sh
```

#### **Container Won't Start**

```bash
# Check container logs
docker logs container-id

# Run container interactively
docker run -it job-tracker sh

# Check health status
docker inspect container-id | grep Health
```

#### **Database Connection Issues**

```bash
# Test database connectivity from container
docker-compose exec app npx prisma db push

# Check network connectivity
docker network ls
docker network inspect network-name
```

### Performance Optimization

#### **Image Size Optimization**

```dockerfile
# Multi-stage build to reduce image size
FROM node:18-alpine AS deps
# ... install dependencies

FROM node:18-alpine AS builder
# ... build application

FROM node:18-alpine AS runner
# ... copy only necessary files
```

#### **Resource Limits**

```yaml
# Set appropriate resource limits
services:
  app:
    deploy:
      resources:
        limits:
          cpus: "0.5"
          memory: 512M
        reservations:
          cpus: "0.25"
          memory: 256M
```
