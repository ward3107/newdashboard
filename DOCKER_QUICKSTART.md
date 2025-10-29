# 🐳 Docker Quick Start Guide

## Prerequisites

Install Docker:
- **Windows:** [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop)
- **Mac:** [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop)
- **Linux:** `curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh`

Verify installation:
```bash
docker --version
docker-compose --version
```

---

## 🚀 Quick Start (3 Steps)

### Step 1: Prepare Environment Variables

```bash
# Copy the example file
cp .env.docker.example .env.production

# Edit with your actual credentials
# (Use your text editor to fill in the values)
```

### Step 2: Build the Docker Image

```bash
# Build the image
docker build -t ishebot-dashboard:latest .
```

This will:
- Install dependencies
- Build the React app
- Create production-ready image with Nginx

### Step 3: Run the Container

```bash
# Run on port 80
docker run -d \
  --name ishebot-dashboard \
  -p 80:80 \
  --env-file .env.production \
  --restart unless-stopped \
  ishebot-dashboard:latest
```

**That's it!** Open http://localhost in your browser.

---

## 🎯 Using Docker Compose (Easier)

Even simpler with Docker Compose:

```bash
# 1. Make sure .env.production exists with your credentials

# 2. Start everything
docker-compose up -d

# 3. View logs
docker-compose logs -f

# 4. Stop everything
docker-compose down
```

---

## 📋 Common Commands

```bash
# View running containers
docker ps

# View logs
docker logs ishebot-dashboard

# Follow logs (Ctrl+C to exit)
docker logs -f ishebot-dashboard

# Stop container
docker stop ishebot-dashboard

# Start container
docker start ishebot-dashboard

# Restart container
docker restart ishebot-dashboard

# Remove container
docker rm ishebot-dashboard

# Remove image
docker rmi ishebot-dashboard:latest

# Access container shell
docker exec -it ishebot-dashboard sh

# Check container health
docker inspect --format='{{.State.Health.Status}}' ishebot-dashboard
```

---

## 🔄 Update and Redeploy

When you make code changes:

```bash
# 1. Rebuild image
docker build -t ishebot-dashboard:latest .

# 2. Stop old container
docker stop ishebot-dashboard
docker rm ishebot-dashboard

# 3. Start new container
docker run -d \
  --name ishebot-dashboard \
  -p 80:80 \
  --env-file .env.production \
  --restart unless-stopped \
  ishebot-dashboard:latest
```

Or with Docker Compose:

```bash
docker-compose up -d --build
```

---

## 🆘 Troubleshooting

### Container exits immediately

```bash
# Check logs
docker logs ishebot-dashboard

# Common issue: Port 80 already in use
# Solution: Use different port
docker run -d -p 8080:80 --name ishebot-dashboard ishebot-dashboard:latest
# Access at http://localhost:8080
```

### Can't access the app

```bash
# Verify container is running
docker ps

# Check port mapping
docker port ishebot-dashboard

# Try accessing from inside container
docker exec -it ishebot-dashboard wget -O- http://localhost
```

### Environment variables not working

```bash
# Check if variables are set in container
docker exec ishebot-dashboard env | grep VITE

# Note: VITE_ variables must be available at BUILD time
# Rebuild image after changing them
```

---

## 🌐 Deploy to Production Server

### Option 1: Direct Deployment

```bash
# 1. SSH into your server
ssh user@your-server-ip

# 2. Install Docker (if not installed)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 3. Clone repository
git clone https://github.com/ward3107/newdashboard.git
cd newdashboard

# 4. Create production env file
nano .env.production
# (Fill in your credentials)

# 5. Build and run
docker build -t ishebot-dashboard:latest .
docker run -d \
  --name ishebot-dashboard \
  -p 80:80 \
  -p 443:443 \
  --env-file .env.production \
  --restart unless-stopped \
  ishebot-dashboard:latest
```

### Option 2: Docker Hub

```bash
# 1. Build locally
docker build -t ishebot-dashboard:latest .

# 2. Tag for Docker Hub
docker tag ishebot-dashboard:latest yourusername/ishebot-dashboard:latest

# 3. Push to Docker Hub
docker login
docker push yourusername/ishebot-dashboard:latest

# 4. On production server
docker pull yourusername/ishebot-dashboard:latest
docker run -d \
  --name ishebot-dashboard \
  -p 80:80 \
  --env-file .env.production \
  yourusername/ishebot-dashboard:latest
```

---

## 💡 Tips

1. **Always use .env.production** - Don't commit this file to git
2. **Use --restart unless-stopped** - Container auto-starts after reboot
3. **Check logs regularly** - `docker logs ishebot-dashboard`
4. **Update regularly** - Rebuild when you update code
5. **Backup env file** - Store .env.production securely

---

## 🎓 What's Happening Behind the Scenes?

```
Your Code
   ↓
Docker Build Process:
   1. Uses Node.js container to build React app
   2. Compiles TypeScript
   3. Bundles with Vite
   4. Creates optimized production build
   ↓
Final Image:
   - Nginx web server (tiny Alpine Linux)
   - Your built app files
   - Custom configuration
   ↓
Docker Run:
   - Starts Nginx
   - Serves your app on port 80
   - Handles routing for React Router
   ↓
Result: Production-ready web server! 🎉
```

---

## 📊 Size Comparison

```
Your Development Setup:
- node_modules: ~500MB
- Source code: ~50MB
- Total: ~550MB

Docker Image:
- Final image: ~50MB (just Nginx + built files)
- Much smaller and optimized! ✅
```

---

## ✅ Quick Checklist

Before deploying:

- [ ] Docker installed and running
- [ ] `.env.production` created with real credentials
- [ ] Port 80 available (or choose different port)
- [ ] Code committed to git
- [ ] Tested build locally: `npm run build`
- [ ] Firewall allows port 80 (on production server)

---

## 🆚 Docker vs Vercel

**Use Docker when:**
- ✅ Self-hosting on your own server
- ✅ Need full control
- ✅ Multiple services (frontend + backend)
- ✅ Enterprise requirements

**Use Vercel when:**
- ✅ Want zero DevOps
- ✅ Just frontend deployment
- ✅ Free hosting is okay
- ✅ Automatic deployments from Git

**Recommendation:** Start with Vercel, use Docker if you need more control!

---

**Ready to go? Run these 3 commands:**

```bash
docker build -t ishebot-dashboard .
docker run -d -p 80:80 --name ishebot-dashboard ishebot-dashboard
# Open http://localhost
```
