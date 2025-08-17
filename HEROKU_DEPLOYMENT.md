# Heroku Deployment Guide

This guide will help you deploy your Node.js/TypeScript application to Heroku.

## Prerequisites

1. **Heroku CLI** installed
2. **Git** repository set up
3. **Heroku account** created

## Quick Deployment

### 1. Install Heroku CLI

```bash
# macOS
brew tap heroku/brew && brew install heroku

# Windows
# Download from https://devcenter.heroku.com/articles/heroku-cli

# Linux
curl https://cli-assets.heroku.com/install.sh | sh
```

### 2. Login to Heroku

```bash
heroku login
```

### 3. Create Heroku App

```bash
# Create a new app
heroku create your-app-name

# Or use existing app
heroku git:remote -a your-app-name
```

### 4. Deploy to Heroku

```bash
# Add all files
git add .

# Commit changes
git commit -m "Ready for Heroku deployment"

# Push to Heroku
git push heroku main
```

### 5. Open Your App

```bash
heroku open
```

## Environment Variables

Set up your environment variables in Heroku:

```bash
# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set LOG_LEVEL=info

# Optional: Add Redis (if needed)
heroku addons:create heroku-redis:hobby-dev

# Optional: Add PostgreSQL (if needed)
heroku addons:create heroku-postgresql:hobby-dev
```

## Manual Deployment Steps

### Step 1: Prepare Your Application

1. **Ensure all dependencies are in `dependencies`** (not `devDependencies`)
2. **Check your `package.json` scripts**:
    - `start`: Should run the production build
    - `postinstall`: Should build the TypeScript code
    - `build`: Should compile TypeScript to JavaScript

### Step 2: Create Heroku App

```bash
# Create app
heroku create your-app-name

# Set buildpack (if needed)
heroku buildpacks:set heroku/nodejs
```

### Step 3: Configure Environment

```bash
# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set LOG_LEVEL=info
```

### Step 4: Deploy

```bash
# Deploy to Heroku
git push heroku main

# Check logs
heroku logs --tail

# Open app
heroku open
```

## Troubleshooting

### Common Issues

1. **Build Fails**

    ```bash
    # Check build logs
    heroku logs --tail

    # Check if TypeScript compiles locally
    yarn build
    ```

2. **App Crashes on Start**

    ```bash
    # Check runtime logs
    heroku logs --tail

    # Test locally
    yarn build && yarn start
    ```

3. **Port Issues**
    - Heroku sets `PORT` environment variable automatically
    - Your app should use `process.env.PORT || 3000`

4. **Memory Issues**

    ```bash
    # Check memory usage
    heroku logs --tail

    # Scale up if needed
    heroku ps:scale web=1
    ```

### Useful Commands

```bash
# View logs
heroku logs --tail

# Check app status
heroku ps

# Restart app
heroku restart

# Open app
heroku open

# Run commands on Heroku
heroku run yarn test

# Check config
heroku config
```

## Production Considerations

### 1. Database

- Use Heroku PostgreSQL addon for production database
- Set `DATABASE_URL` environment variable

### 2. Redis

- Use Heroku Redis addon if needed
- Set `REDIS_URL` environment variable

### 3. Logging

- Use `LOG_LEVEL=error` in production
- Monitor logs with `heroku logs --tail`

### 4. Security

- Set `NODE_ENV=production`
- Use strong secrets for JWT, API keys, etc.
- Enable HTTPS (automatic on Heroku)

### 5. Performance

- Monitor memory usage
- Scale dynos as needed
- Use CDN for static assets

## Monitoring

### 1. Heroku Dashboard

- Monitor app performance
- Check error rates
- View response times

### 2. Logs

```bash
# Real-time logs
heroku logs --tail

# Recent logs
heroku logs -n 200
```

### 3. Metrics

```bash
# Check dyno usage
heroku ps

# Monitor addons
heroku addons
```

## Scaling

### Horizontal Scaling

```bash
# Scale to multiple dynos
heroku ps:scale web=2

# Check current scaling
heroku ps
```

### Vertical Scaling

```bash
# Upgrade dyno type
heroku ps:type standard-1x
```

## Rollback

If something goes wrong:

```bash
# List releases
heroku releases

# Rollback to previous version
heroku rollback v42

# Or rollback to specific version
heroku rollback v41
```

## Custom Domains

```bash
# Add custom domain
heroku domains:add www.yourdomain.com

# Check SSL status
heroku certs
```

## Continuous Deployment

### GitHub Integration

1. Connect your GitHub repository to Heroku
2. Enable automatic deploys
3. Set up review apps for pull requests

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Heroku

on:
    push:
        branches: [main]

jobs:
    deploy:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v2
            - uses: akhileshns/heroku-deploy@v3.12.12
              with:
                  heroku_api_key: ${{ secrets.HEROKU_API_KEY }}
                  heroku_app_name: ${{ secrets.HEROKU_APP_NAME }}
                  heroku_email: ${{ secrets.HEROKU_EMAIL }}
```

## Support

- [Heroku Dev Center](https://devcenter.heroku.com/)
- [Heroku CLI Documentation](https://devcenter.heroku.com/articles/heroku-cli)
- [Node.js on Heroku](https://devcenter.heroku.com/articles/nodejs-support)
