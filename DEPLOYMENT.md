# Deployment Guide — fire.festas-builds.com

This document explains how to set up automatic deployments of the FIRE Simulator to your Hetzner server via GitHub Actions. The setup assumes you already have **nginx** running as a reverse proxy on the server.

---

## Architecture

```
GitHub Actions (on push to main)
  └─► SSH into Hetzner server
        └─► docker compose build & up
              └── fire-simulator  (Next.js on 127.0.0.1:3200)
        └─► nginx (managed centrally in Festas/Link-in-Bio)
              └── reverse proxy :80/:443 → 127.0.0.1:3200
```

nginx handles TLS termination using Let's Encrypt certificates (managed by certbot).

---

## 1. GitHub Repository Secrets

Go to **Settings → Secrets and variables → Actions → New repository secret** and create these four secrets:

| Secret Name        | Description                                          | Example Value              |
| ------------------ | ---------------------------------------------------- | -------------------------- |
| `SERVER_HOST`      | IP address or hostname of your Hetzner server        | `203.0.113.42`             |
| `SERVER_USER`      | SSH username on the server                           | `root` or `deploy`         |
| `SERVER_SSH_KEY`   | **Private** SSH key for authentication (full PEM)    | `-----BEGIN OPENSSH...`    |
| `SERVER_SSH_PORT`  | SSH port on the server                               | `22`                       |

---

## 2. Server Preparation (one-time setup)

SSH into your Hetzner server and run:

### 2.1 Install Docker

```bash
# Update system
apt update && apt upgrade -y

# Install Docker (official method)
curl -fsSL https://get.docker.com | sh

# Verify
docker --version
docker compose version
```

### 2.2 Create deployment directory

```bash
mkdir -p /opt/fire-simulator
```

### 2.3 Set up SSH key authentication

If you don't already have an SSH key pair for deployment:

```bash
# On your LOCAL machine, generate a dedicated deploy key
ssh-keygen -t ed25519 -C "github-deploy" -f ~/.ssh/fire_deploy

# Copy the PUBLIC key to the server
ssh-copy-id -i ~/.ssh/fire_deploy.pub <SERVER_USER>@<SERVER_HOST>

# Test the connection
ssh -i ~/.ssh/fire_deploy <SERVER_USER>@<SERVER_HOST> "echo OK"
```

Then paste the contents of `~/.ssh/fire_deploy` (the **private** key) into the `SERVER_SSH_KEY` GitHub secret.

### 2.4 Install certbot for HTTPS

```bash
apt install -y certbot python3-certbot-nginx

# Obtain a certificate (nginx must already be running and DNS must point to this server)
certbot --nginx -d fire.festas-builds.com

# Verify auto-renewal
certbot renew --dry-run
```

### 2.5 Configure firewall

```bash
# Allow HTTP, HTTPS, and SSH
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

---

## 3. DNS Configuration

In your domain registrar's DNS settings, create an **A record**:

| Type | Name   | Value               | TTL  |
| ---- | ------ | ------------------- | ---- |
| A    | fire   | `<your-server-ip>`  | 300  |

This points `fire.festas-builds.com` to your Hetzner server.

---

## 4. How Deployment Works

1. You push code to the `main` branch (or manually trigger the workflow).
2. GitHub Actions checks out the code.
3. The source files are copied to `/opt/fire-simulator` on the server via SCP.
4. An SSH command runs `docker compose build && docker compose up -d` on the server.
5. Docker builds the Next.js app in a multi-stage build (deps → build → minimal production image).
6. The container listens on `127.0.0.1:3200` on the host.
7. nginx reverse-proxies requests from `fire.festas-builds.com` to the Next.js container on `127.0.0.1:3200`, with HTTPS via certbot. The nginx config is managed centrally in [Festas/Link-in-Bio](https://github.com/Festas/Link-in-Bio) (`nginx/sites-available/fire.festas-builds.com.conf`).

---

## 5. Manual Deployment

You can also trigger a deployment manually:

1. Go to **Actions → Deploy to Production** in your GitHub repository.
2. Click **Run workflow** → **Run workflow**.

---

## 6. Monitoring & Troubleshooting

SSH into the server and use:

```bash
cd /opt/fire-simulator

# View running containers
docker compose ps

# View app logs
docker compose logs -f fire-simulator

# Restart the app
docker compose restart

# Full rebuild
docker compose down && docker compose build --no-cache && docker compose up -d

# Check nginx config (nginx is managed centrally in Festas/Link-in-Bio)
nginx -t

# View nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

---

## 7. Files Overview

| File                               | Purpose                                                  |
| ---------------------------------- | -------------------------------------------------------- |
| `.github/workflows/deploy.yml`     | GitHub Actions workflow — deploys on push to `main`      |
| `docker-compose.yml`               | Defines the fire-simulator Docker service                |
| `fire-simulator.nginx.conf`        | nginx config reference only — canonical config is in [Festas/Link-in-Bio](https://github.com/Festas/Link-in-Bio) (`nginx/sites-available/fire.festas-builds.com.conf`) |
| `fire-simulator/Dockerfile`        | Multi-stage Docker build for the Next.js app             |
| `fire-simulator/next.config.ts`    | Next.js config with `output: "standalone"` for Docker    |
