# WayTooNerd MERN Stack Production Setup on VPS

This guide explains how to deploy WayTooNerd on your VPS alongside your existing websites without port conflicts or server downtime.

---

## 1. Pick a Unique Port for WayTooNerd Backend

Check which ports are currently in use on your VPS:
```bash
sudo netstat -tulpn | grep LISTEN
# or
sudo ss -tulpn | grep LISTEN
```
Pick any unused port (for example: **`5005`**, **`5010`**, etc.).

---

## 2. Deploy Backend with PM2

1. Clone or pull the repository to `/var/www/waytoonerd-mern` on your VPS:
   ```bash
   cd /var/www/waytoonerd-mern/server
   npm install --production
   ```

2. Create the production `.env` file on your VPS (never committed to git):
   ```bash
   cp .env.example .env
   nano .env
   ```
   Fill in your actual production values:
   ```ini
   PORT=5005
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.1wcybae.mongodb.net/waytoonerd_new?retryWrites=true&w=majority
   JWT_SECRET=your_strong_secret_key_here
   CLIENT_URL=https://waytoonerd.com

   # Backblaze B2 Media Storage
   B2_ENDPOINT=https://s3.us-east-005.backblazeb2.com
   B2_REGION=us-east-005
   B2_KEY_ID=your_b2_key_id
   B2_KEY_NAME=your_b2_key_name
   B2_APP_KEY=your_b2_app_key
   B2_BUCKET_NAME=calthx
   B2_PUBLIC_URL=https://calthx.s3.us-east-005.backblazeb2.com
   B2_FOLDER=waytoonerd
   ```

3. Start backend with PM2 under a unique name:
   ```bash
   pm2 start server.js --name "waytoonerd-api"
   pm2 save
   ```

---

## 3. Deploy Frontend

1. Build the production React assets:
   ```bash
   cd /var/www/waytoonerd-mern/client
   npm install
   npm run build
   ```
   This generates the `/var/www/waytoonerd-mern/client/dist` directory.

---

## 4. Nginx Configuration for `waytoonerd.com`

Create a new site configuration without touching your other sites:
```bash
sudo nano /etc/nginx/sites-available/waytoonerd.com
```

Paste the following configuration (replace `5005` with your selected backend port):
```nginx
server {
    listen 80;
    server_name waytoonerd.com www.waytoonerd.com;

    # Frontend Static Build
    root /var/www/waytoonerd-mern/client/dist;
    index index.html;

    # Gzip Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # SPA Routing (React Router)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API Proxy (port 5005)
    location /api/ {
        proxy_pass http://127.0.0.1:5005/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static uploads fallback (cached or B2)
    location /uploads/ {
        proxy_pass http://127.0.0.1:5005/uploads/;
    }
}
```

Enable the site and test Nginx before reloading (guarantees zero downtime for other sites):
```bash
sudo ln -s /etc/nginx/sites-available/waytoonerd.com /etc/nginx/sites-enabled/
sudo nginx -t  # Tests configuration syntax safely
sudo systemctl reload nginx
```

Obtain free SSL with Certbot:
```bash
sudo certbot --nginx -d waytoonerd.com -d www.waytoonerd.com
```

