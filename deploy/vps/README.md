# DextaaStore VPS Deployment

This guide deploys the React frontend as static files through Nginx and runs the Express backend as a systemd service.

Assumptions:

- VPS OS: Ubuntu 22.04 or 24.04
- Domain points to the VPS IP with an `A` record
- Backend uses managed Postgres from `DATABASE_URL`
- Product images use Cloudinary
- App directory on server: `/var/www/dextaa-store`
- Backend runs on `127.0.0.1:4000`

Replace these placeholders before running commands:

- `YOUR_DOMAIN`
- `YOUR_REPO_URL`
- `YOUR_DATABASE_URL`
- `YOUR_JWT_SECRET`
- Cloudinary values

## 1. Install Server Packages

```bash
sudo apt update
sudo apt install -y git curl nginx
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
```

## 2. Clone Project

```bash
sudo mkdir -p /var/www
sudo chown -R $USER:$USER /var/www
git clone YOUR_REPO_URL /var/www/dextaa-store
cd /var/www/dextaa-store
npm install
```

## 3. Create Backend Environment

Create `/var/www/dextaa-store/backend/.env`:

```env
NODE_ENV=production
API_PORT=4000
DATABASE_URL="YOUR_DATABASE_URL"
DIRECT_URL="YOUR_DIRECT_URL_OPTIONAL"
JWT_SECRET="YOUR_LONG_RANDOM_SECRET"
CLOUDINARY_CLOUD_NAME="YOUR_CLOUDINARY_CLOUD_NAME"
CLOUDINARY_API_KEY="YOUR_CLOUDINARY_API_KEY"
CLOUDINARY_API_SECRET="YOUR_CLOUDINARY_API_SECRET"
CLOUDINARY_FOLDER="dextaa-store/products"
```

Do not commit this file to git.

## 4. Prepare Database

```bash
cd /var/www/dextaa-store
npm run db:generate
npm run db:push
```

Optional first seed:

```bash
ADMIN_EMAIL="admin@example.com" ADMIN_PASSWORD="change-this-password" ADMIN_NAME="Dextaa Admin" npm run db:seed:admin
npm run db:seed:catalog
```

## 5. Build Frontend

```bash
cd /var/www/dextaa-store
npm run build
```

The static site will be in:

```text
/var/www/dextaa-store/frontend/dist
```

## 6. Install Backend Service

Copy the systemd service:

```bash
sudo cp deploy/vps/systemd/dextaa-api.service /etc/systemd/system/dextaa-api.service
sudo systemctl daemon-reload
sudo systemctl enable dextaa-api
sudo systemctl start dextaa-api
sudo systemctl status dextaa-api
```

Check logs:

```bash
journalctl -u dextaa-api -f
```

## 7. Install Nginx Site

Copy the Nginx config and replace `YOUR_DOMAIN`:

```bash
sudo cp deploy/vps/nginx/dextaa-store.conf /etc/nginx/sites-available/dextaa-store
sudo sed -i 's/YOUR_DOMAIN/yourdomain.com/g' /etc/nginx/sites-available/dextaa-store
sudo ln -s /etc/nginx/sites-available/dextaa-store /etc/nginx/sites-enabled/dextaa-store
sudo nginx -t
sudo systemctl reload nginx
```

Visit:

```text
http://yourdomain.com
```

## 8. Add HTTPS

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

## 9. Update Deployment Later

```bash
cd /var/www/dextaa-store
git pull
npm install
npm run db:generate
npm run db:push
npm run build
sudo systemctl restart dextaa-api
sudo systemctl reload nginx
```

## Troubleshooting

Backend health:

```bash
curl http://127.0.0.1:4000/api/health
```

Public API through Nginx:

```bash
curl https://yourdomain.com/api/health
```

If admin login fails:

```bash
journalctl -u dextaa-api -n 100
```

If images fail:

- Confirm Cloudinary env values are in `backend/.env`
- Restart backend: `sudo systemctl restart dextaa-api`

