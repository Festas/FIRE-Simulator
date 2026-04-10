# Deployment Guide — fire.festas-builds.com

This document explains how to set up automatic deployments of the FIRE Simulator to your Hetzner server via GitHub Actions.

---

## Architecture

```
GitHub Actions (on push to main)
  └─► SSH into Hetzner server
        └─► docker compose build & up
              ├── fire-simulator  (Next.js on :3000, internal)
              └── caddy           (reverse proxy, :80/:443, auto-HTTPS)
```

Caddy automatically provisions and renews TLS certificates from Let's Encrypt for `fire.festas-builds.com`.

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

### 2.4 Configure firewall

```bash
# Allow HTTP, HTTPS, and SSH
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 443/udp
ufw enable
```

---

## 3. DNS Configuration

In your domain registrar's DNS settings, create an **A record**:

| Type | Name   | Value               | TTL  |
| ---- | ------ | ------------------- | ---- |
| A    | fire   | `<your-server-ip>`  | 300  |

This points `fire.festas-builds.com` to your Hetzner server. Caddy will automatically handle HTTPS.

---

## 4. How Deployment Works

1. You push code to the `main` branch (or manually trigger the workflow).
2. GitHub Actions checks out the code.
3. The source files are copied to `/opt/fire-simulator` on the server via SCP.
4. An SSH command runs `docker compose build && docker compose up -d` on the server.
5. Docker builds the Next.js app in a multi-stage build (deps → build → minimal production image).
6. Caddy reverse-proxies requests from `fire.festas-builds.com` to the Next.js container, with automatic HTTPS.

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

# View logs
docker compose logs -f

# View logs for a specific service
docker compose logs -f fire-simulator
docker compose logs -f caddy

# Restart services
docker compose restart

# Full rebuild
docker compose down && docker compose build --no-cache && docker compose up -d
```

---

## 7. Files Overview

| File                               | Purpose                                                  |
| ---------------------------------- | -------------------------------------------------------- |
| `.github/workflows/deploy.yml`     | GitHub Actions workflow — deploys on push to `main`      |
| `docker-compose.yml`               | Defines fire-simulator and Caddy services                |
| `Caddyfile`                        | Caddy config — reverse proxy + auto-HTTPS                |
| `fire-simulator/Dockerfile`        | Multi-stage Docker build for the Next.js app             |
| `fire-simulator/next.config.ts`    | Next.js config with `output: "standalone"` for Docker    |
