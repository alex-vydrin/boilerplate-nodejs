# Railway Deployment Guide

This guide will help you deploy your TypeScript Express application to Railway.

## Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **Git Repository**: Your code should be in a Git repository (GitHub, GitLab, etc.)
3. **Railway CLI** (Optional): Install for local development

    ```bash
    npm install -g @railway/cli
    ```

## Deployment Steps

### 1. Connect Your Repository

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Railway will automatically detect the Dockerfile and use it for deployment

### 2. Environment Variables

Railway automatically provides necessary environment variables:

- `PORT` - Automatically assigned by Railway
- `NODE_ENV` - Set to "production" in production environments

No additional environment variables are required for basic deployment.

### 3. Database Setup (if using PostgreSQL)

1. In Railway Dashboard, go to "New" → "Database" → "PostgreSQL"
2. Railway will automatically provide a `DATABASE_URL` environment variable
3. Copy this URL and add it to your environment variables if needed

### 4. Deploy

1. Railway will automatically deploy when you push to your main branch
2. You can also trigger manual deployments from the Railway Dashboard
3. Monitor the deployment logs for any issues

## Configuration Files

### railway.toml

This file configures Railway-specific settings:

- Uses `Dockerfile` for building
- Sets health check endpoint to `/health`
- Configures restart policies
- Sets memory optimization options

### Dockerfile

The Dockerfile uses a multi-stage build approach:

- **Base stage**: Installs all dependencies
- **Development stage**: For local development
- **Build stage**: Compiles TypeScript
- **Production stage**: Creates optimized production image

### .dockerignore

Optimizes build performance by excluding unnecessary files:

- `node_modules` and build artifacts
- Development files and logs
- IDE-specific files

## Troubleshooting

### Common Issues

1. **Build Failures**
    - Check Railway build logs
    - Ensure all dependencies are properly listed in `package.json`
    - Verify TypeScript compilation works locally

2. **Health Check Failures**
    - Verify `/health` endpoint is working
    - Check if the application is starting properly
    - Review startup logs

3. **Runtime Errors**
    - Check application logs in Railway Dashboard
    - Verify environment variables are set correctly
    - Ensure database connection is working

### Debugging Commands

```bash
# View logs
railway logs

# Check status
railway status

# Open shell to running container
railway shell

# View environment variables
railway variables
```

## Local Development with Railway

1. **Install Railway CLI**:

    ```bash
    npm install -g @railway/cli
    ```

2. **Login to Railway**:

    ```bash
    railway login
    ```

3. **Link to your project**:

    ```bash
    railway link
    ```

4. **Pull environment variables**:

    ```bash
    railway variables pull
    ```

5. **Run locally with Railway environment**:

    ```bash
    railway run yarn dev:local
    ```

## Performance Optimization

1. **Enable Caching**: Railway automatically caches dependencies
2. **Use Production Build**: The Dockerfile creates optimized production builds
3. **Monitor Resources**: Use Railway's monitoring tools to track performance
4. **Memory Optimization**: The `NODE_OPTIONS` setting prevents memory issues

## Security Best Practices

1. **Environment Variables**: Never commit sensitive data to your repository
2. **Non-root User**: The Dockerfile runs as a non-root user
3. **Dependency Scanning**: Regularly update dependencies
4. **HTTPS**: Railway automatically provides HTTPS

## Monitoring and Logs

1. **Application Logs**: Available in Railway Dashboard
2. **Build Logs**: View build process and any errors
3. **Metrics**: Monitor CPU, memory, and network usage
4. **Alerts**: Set up alerts for downtime or errors

## Rollback

If a deployment fails:

1. Go to Railway Dashboard
2. Navigate to "Deployments" tab
3. Find the last working deployment
4. Click "Redeploy" to rollback

## Build Optimizations

The current setup includes several optimizations:

1. **Multi-stage Build**: Reduces final image size
2. **Dependency Caching**: Package files copied first for better layer caching
3. **Production Optimization**: Only production dependencies in final image
4. **Security**: Non-root user for running the application

## Support

- **Railway Documentation**: [docs.railway.app](https://docs.railway.app)
- **Railway Discord**: [discord.gg/railway](https://discord.gg/railway)
- **GitHub Issues**: For application-specific issues
