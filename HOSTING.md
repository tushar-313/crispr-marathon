# Hosting Guide

This guide deploys the dashboard on a Linux server using Node.js and Nginx.

## 1) Server prerequisites

Install required packages:

```bash
sudo apt update
sudo apt install -y nginx git curl
```

Install Node 20 LTS:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
```

## 2) Deploy app code

```bash
sudo mkdir -p /var/www
cd /var/www
sudo git clone <your-repo-url> crispr-marathon
sudo chown -R $USER:$USER /var/www/crispr-marathon
cd /var/www/crispr-marathon
npm install --omit=dev
```

## 3) Start app with PM2 (recommended)

```bash
sudo npm install -g pm2
cd /var/www/crispr-marathon
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

Check health:

```bash
curl -s http://127.0.0.1:8000/healthz
```

Expected response:

```json
{"ok":true,"service":"crispr-marathon"}
```

## 4) Nginx reverse proxy

Copy config and set your domain:

```bash
sudo cp /var/www/crispr-marathon/deploy/nginx-crispr-marathon.conf /etc/nginx/sites-available/crispr-marathon
sudo nano /etc/nginx/sites-available/crispr-marathon
```

Change `server_name your-domain.com;` to your real domain.

Enable and reload:

```bash
sudo ln -s /etc/nginx/sites-available/crispr-marathon /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 5) HTTPS with Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 6) Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## 7) Update workflow

```bash
cd /var/www/crispr-marathon
git pull
npm install --omit=dev
pm2 restart crispr-marathon
```

## Alternative: run with systemd instead of PM2

If you prefer systemd:

```bash
sudo cp /var/www/crispr-marathon/deploy/crispr-marathon.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable crispr-marathon
sudo systemctl start crispr-marathon
sudo systemctl status crispr-marathon
```
