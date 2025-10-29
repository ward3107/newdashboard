# 🐳 Docker Deployment Guide

## Overview

Containerize your ISHEBOT Dashboard with Docker for consistent deployments across any environment.

---

## 🎯 Why Docker?

### Benefits

- ✅ **Consistency:** Same environment everywhere (dev, staging, production)
- ✅ **Portability:** Run anywhere Docker is installed
- ✅ **Isolation:** App runs in its own container
- ✅ **Easy deployment:** Single command to start everything
- ✅ **Scalability:** Easy to scale horizontally
- ✅ **Version control:** Docker images are versioned

### When to Use Docker

**Good for:**
- Self-hosted deployments (VPS, cloud servers)
- Enterprise environments
- Multiple services (frontend + backend)
- Kubernetes deployments
- CI/CD pipelines

**Not needed for:**
- Simple Vercel/Netlify deployments (they handle hosting)
- Single static site
- Pure serverless architecture

---

## 📦 Architecture Options

### Option 1: Frontend Only (Simple)

```
Docker Container
  └── React Dashboard (Vite + Nginx)
       ↓
  External Google Apps Script (already deployed)
```

**Best for:** Current setup (Google Sheets backend)

---

### Option 2: Full Stack (Advanced)

```
Docker Compose:
  ├── Frontend Container (React + Nginx)
  ├── Backend Container (Node.js + Express)
  └── Database Container (PostgreSQL/MongoDB)
```

**Best for:** Full migration from Google Sheets

---

## 🚀 Implementation: Frontend Only (Recommended)

### Step 1: Create Dockerfile

Create `Dockerfile` in your project root:

```dockerfile
# Multi-stage build for smaller image size

# Stage 1: Build the React app
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

---

### Step 2: Create Nginx Configuration

Create `nginx.conf` in your project root:

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Enable gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript
               application/x-javascript application/xml+rss
               application/javascript application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API proxy (if needed)
    location /api {
        proxy_pass http://backend:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # React Router - redirect all to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Disable access to hidden files
    location ~ /\. {
        deny all;
    }
}
```

---

### Step 3: Create .dockerignore

Create `.dockerignore` in your project root:

```
# Dependencies
node_modules
npm-debug.log
package-lock.json

# Build output
dist
build
.turbo

# Environment files (never include in image)
.env
.env.local
.env.*.local

# Git
.git
.gitignore

# IDE
.vscode
.idea
*.swp
*.swo

# Testing
coverage
.nyc_output

# OS files
.DS_Store
Thumbs.db

# Documentation
*.md
docs

# Logs
logs
*.log

# Temporary files
*.tmp
*.temp
.cache
```

---

### Step 4: Build Docker Image

```bash
# Build the image
docker build -t ishebot-dashboard:latest .

# Or with specific version tag
docker build -t ishebot-dashboard:1.0.0 .
```

---

### Step 5: Run Docker Container

#### Development Mode

```bash
docker run -d \
  --name ishebot-dashboard \
  -p 3000:80 \
  -e VITE_API_URL="YOUR_GOOGLE_SCRIPT_URL" \
  -e VITE_SPREADSHEET_ID="YOUR_SPREADSHEET_ID" \
  ishebot-dashboard:latest
```

#### Production Mode with Environment File

```bash
# Create .env.production (not committed to git)
# Then run:

docker run -d \
  --name ishebot-dashboard \
  -p 80:80 \
  --env-file .env.production \
  --restart unless-stopped \
  ishebot-dashboard:latest
```

---

### Step 6: Verify Deployment

```bash
# Check container is running
docker ps

# View logs
docker logs ishebot-dashboard

# Follow logs
docker logs -f ishebot-dashboard

# Access the app
# Open browser: http://localhost:3000
```

---

## 🐳 Docker Compose Setup (Full Stack)

If you have multiple services (frontend + backend):

### Create docker-compose.yml

```yaml
version: '3.8'

services:
  # Frontend Service
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: ishebot-frontend
    ports:
      - "80:80"
      - "443:443"
    environment:
      - VITE_API_URL=${VITE_API_URL}
      - VITE_SPREADSHEET_ID=${VITE_SPREADSHEET_ID}
      - VITE_ADMIN_PASSWORD=${VITE_ADMIN_PASSWORD}
    depends_on:
      - backend
    restart: unless-stopped
    networks:
      - ishebot-network

  # Backend Service (if you add Node.js backend later)
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: ishebot-backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - DATABASE_URL=${DATABASE_URL}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    restart: unless-stopped
    networks:
      - ishebot-network
    volumes:
      - backend-data:/app/data

  # Database (optional - if migrating from Google Sheets)
  postgres:
    image: postgres:16-alpine
    container_name: ishebot-db
    environment:
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=ishebot
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data
    restart: unless-stopped
    networks:
      - ishebot-network

  # Redis (for caching)
  redis:
    image: redis:7-alpine
    container_name: ishebot-redis
    ports:
      - "6379:6379"
    restart: unless-stopped
    networks:
      - ishebot-network
    volumes:
      - redis-data:/data

networks:
  ishebot-network:
    driver: bridge

volumes:
  postgres-data:
  redis-data:
  backend-data:
```

---

### Using Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild and restart
docker-compose up -d --build

# Scale frontend (multiple instances)
docker-compose up -d --scale frontend=3
```

---

## 🔧 Environment Variables in Docker

### Option 1: Build-time Variables (Not Recommended)

```dockerfile
# In Dockerfile
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
```

**Problem:** Baked into image, not flexible

---

### Option 2: Runtime Variables (Recommended)

Create `docker-entrypoint.sh`:

```bash
#!/bin/sh

# Replace env vars in built files
# This allows runtime environment configuration
for file in /usr/share/nginx/html/assets/*.js; do
  if [ -f "$file" ]; then
    # Replace placeholder with actual env var
    sed -i "s|VITE_API_URL_PLACEHOLDER|${VITE_API_URL}|g" "$file"
    sed -i "s|VITE_SPREADSHEET_ID_PLACEHOLDER|${VITE_SPREADSHEET_ID}|g" "$file"
  fi
done

# Start nginx
nginx -g 'daemon off;'
```

Update Dockerfile:

```dockerfile
# ... previous stages

# Copy entrypoint script
COPY docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]
```

---

### Option 3: Config File Mount (Best for Production)

```bash
# Create config.js with your variables
# Mount it at runtime

docker run -d \
  --name ishebot-dashboard \
  -p 80:80 \
  -v $(pwd)/config.js:/usr/share/nginx/html/config.js:ro \
  ishebot-dashboard:latest
```

---

## 📤 Deploying to Production

### Option 1: Deploy to VPS (DigitalOcean, Linode, etc.)

```bash
# 1. SSH into your server
ssh user@your-server-ip

# 2. Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 3. Clone your repository
git clone https://github.com/ward3107/newdashboard.git
cd newdashboard

# 4. Create .env.production
nano .env.production
# Add your production environment variables

# 5. Build and run
docker build -t ishebot-dashboard:latest .
docker run -d \
  --name ishebot-dashboard \
  -p 80:80 \
  -p 443:443 \
  --env-file .env.production \
  --restart unless-stopped \
  ishebot-dashboard:latest

# 6. Set up SSL with Let's Encrypt (optional)
docker run -d \
  --name nginx-proxy \
  -p 80:80 -p 443:443 \
  -v /var/run/docker.sock:/tmp/docker.sock:ro \
  -v certs:/etc/nginx/certs \
  nginxproxy/nginx-proxy

docker run -d \
  --name letsencrypt \
  --volumes-from nginx-proxy \
  -v /var/run/docker.sock:/var/run/docker.sock:ro \
  nginxproxy/acme-companion
```

---

### Option 2: Deploy to AWS ECS

Create `ecs-task-definition.json`:

```json
{
  "family": "ishebot-dashboard",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "ishebot-frontend",
      "image": "your-registry/ishebot-dashboard:latest",
      "portMappings": [
        {
          "containerPort": 80,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "VITE_API_URL",
          "value": "YOUR_API_URL"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/ishebot-dashboard",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

---

### Option 3: Deploy to Docker Hub + Pull Anywhere

```bash
# 1. Login to Docker Hub
docker login

# 2. Tag your image
docker tag ishebot-dashboard:latest yourusername/ishebot-dashboard:latest

# 3. Push to Docker Hub
docker push yourusername/ishebot-dashboard:latest

# 4. On any server, pull and run
docker pull yourusername/ishebot-dashboard:latest
docker run -d -p 80:80 yourusername/ishebot-dashboard:latest
```

---

## 🔐 Security Best Practices

### 1. Don't Bake Secrets into Images

```dockerfile
# ❌ BAD
ENV VITE_API_KEY="sk-1234567890"

# ✅ GOOD
# Pass at runtime via -e or --env-file
```

---

### 2. Use Multi-stage Builds

```dockerfile
# Keeps final image small and secure
FROM node:20-alpine AS builder
# ... build stage

FROM nginx:alpine
# Only copy built files, not source code
COPY --from=builder /app/dist /usr/share/nginx/html
```

---

### 3. Run as Non-root User

```dockerfile
# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Switch to non-root user
USER nodejs
```

---

### 4. Scan for Vulnerabilities

```bash
# Install Trivy
brew install trivy  # macOS
# or
sudo apt install trivy  # Ubuntu

# Scan image
trivy image ishebot-dashboard:latest
```

---

## 📊 Monitoring and Logging

### View Container Logs

```bash
# Real-time logs
docker logs -f ishebot-dashboard

# Last 100 lines
docker logs --tail 100 ishebot-dashboard

# With timestamps
docker logs -t ishebot-dashboard
```

---

### Health Checks

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1
```

Check health status:

```bash
docker inspect --format='{{.State.Health.Status}}' ishebot-dashboard
```

---

### Resource Monitoring

```bash
# Container stats
docker stats ishebot-dashboard

# Detailed inspection
docker inspect ishebot-dashboard
```

---

## 🔄 CI/CD with Docker

### GitHub Actions Workflow

Create `.github/workflows/docker-deploy.yml`:

```yaml
name: Build and Deploy Docker Image

on:
  push:
    branches: [ main ]

jobs:
  build-and-push:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout code
      uses: actions/checkout@v3

    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2

    - name: Login to Docker Hub
      uses: docker/login-action@v2
      with:
        username: ${{ secrets.DOCKER_USERNAME }}
        password: ${{ secrets.DOCKER_PASSWORD }}

    - name: Build and push
      uses: docker/build-push-action@v4
      with:
        context: .
        push: true
        tags: |
          yourusername/ishebot-dashboard:latest
          yourusername/ishebot-dashboard:${{ github.sha }}
        cache-from: type=gha
        cache-to: type=gha,mode=max

    - name: Deploy to server
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.SERVER_HOST }}
        username: ${{ secrets.SERVER_USER }}
        key: ${{ secrets.SSH_PRIVATE_KEY }}
        script: |
          docker pull yourusername/ishebot-dashboard:latest
          docker stop ishebot-dashboard || true
          docker rm ishebot-dashboard || true
          docker run -d \
            --name ishebot-dashboard \
            -p 80:80 \
            --env-file /opt/ishebot/.env.production \
            --restart unless-stopped \
            yourusername/ishebot-dashboard:latest
```

---

## 🆘 Troubleshooting

### Issue: Container Exits Immediately

```bash
# Check logs
docker logs ishebot-dashboard

# Common causes:
# 1. Build failed
# 2. Port already in use
# 3. Missing environment variables
```

**Solution:**

```bash
# Rebuild with no cache
docker build --no-cache -t ishebot-dashboard:latest .

# Check port availability
netstat -an | grep 80

# Run interactively to debug
docker run -it ishebot-dashboard:latest sh
```

---

### Issue: Can't Access App on Port 80

**Solution:**

```bash
# Check if container is running
docker ps

# Check port mapping
docker port ishebot-dashboard

# Check firewall
sudo ufw status
sudo ufw allow 80/tcp
```

---

### Issue: Environment Variables Not Working

**Solution:**

```bash
# Verify variables are set
docker exec ishebot-dashboard env

# If using Vite, variables must start with VITE_
# and must be available at build time
```

---

## 📋 Quick Reference

### Essential Commands

```bash
# Build
docker build -t ishebot-dashboard:latest .

# Run
docker run -d -p 80:80 --name ishebot-dashboard ishebot-dashboard:latest

# Stop
docker stop ishebot-dashboard

# Remove
docker rm ishebot-dashboard

# Logs
docker logs -f ishebot-dashboard

# Execute command in container
docker exec -it ishebot-dashboard sh

# Inspect
docker inspect ishebot-dashboard

# Update and restart
docker pull yourusername/ishebot-dashboard:latest
docker stop ishebot-dashboard && docker rm ishebot-dashboard
docker run -d -p 80:80 --name ishebot-dashboard yourusername/ishebot-dashboard:latest
```

---

## 💰 Cost Comparison

| Deployment | Cost | Best For |
|------------|------|----------|
| **Vercel** | FREE - $20/mo | Simple deployments, automatic |
| **VPS + Docker** | $5-10/mo | Full control, multiple services |
| **AWS ECS** | ~$15-30/mo | Enterprise, scalable |
| **Docker Hub** | FREE (public) | Image storage |
| **Self-hosted** | $0 (your server) | Existing infrastructure |

---

## 🎯 When to Use Docker vs Vercel

### Use Vercel When:
- ✅ Single frontend app
- ✅ Want zero DevOps
- ✅ Free tier is enough
- ✅ Don't need custom backend

### Use Docker When:
- ✅ Multiple services (frontend + backend)
- ✅ Need full control
- ✅ Self-hosting requirement
- ✅ Enterprise deployment
- ✅ Kubernetes in future

---

## 📚 Next Steps

1. **Start Simple:** Use Vercel for frontend
2. **Add Docker:** When you need backend services
3. **Use Compose:** When you have multiple services
4. **Kubernetes:** When you scale to many containers

---

## 🎓 Summary

**For Your Current Setup (Pilot):**
```bash
# 1. Create Dockerfile (see above)
# 2. Build image
docker build -t ishebot-dashboard .

# 3. Run container
docker run -d -p 80:80 \
  -e VITE_API_URL="your_url" \
  ishebot-dashboard

# 4. Access at http://localhost
```

**Benefits:**
- ✅ Portable deployment
- ✅ Consistent environment
- ✅ Easy to scale
- ✅ Works anywhere

**Recommendation:** Start with Vercel, add Docker when you need more control!
