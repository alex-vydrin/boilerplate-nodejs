#!/bin/bash

# Heroku Deployment Script
# This script automates the deployment process to Heroku

set -e  # Exit on any error

echo "🚀 Starting Heroku deployment..."

# Check if Heroku CLI is installed
if ! command -v heroku &> /dev/null; then
    echo "❌ Heroku CLI is not installed. Please install it first:"
    echo "   https://devcenter.heroku.com/articles/heroku-cli"
    exit 1
fi

# Check if user is logged in to Heroku
if ! heroku auth:whoami &> /dev/null; then
    echo "❌ Not logged in to Heroku. Please run: heroku login"
    exit 1
fi

# Get app name from arguments or prompt user
APP_NAME=${1:-""}
if [ -z "$APP_NAME" ]; then
    echo "📝 Enter your Heroku app name (or press Enter to create a new one):"
    read APP_NAME
fi

# Create app if it doesn't exist
if [ -n "$APP_NAME" ]; then
    echo "🔧 Setting up Heroku app: $APP_NAME"
    
    # Check if app exists
    if heroku apps:info --app "$APP_NAME" &> /dev/null; then
        echo "✅ App $APP_NAME already exists"
        heroku git:remote -a "$APP_NAME"
    else
        echo "🆕 Creating new app: $APP_NAME"
        heroku create "$APP_NAME"
    fi
else
    echo "🆕 Creating new app with random name..."
    heroku create
fi

# Build the application
echo "🔨 Building application..."
yarn build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Build failed. dist directory not found."
    exit 1
fi

# Add all files to git
echo "📦 Adding files to git..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "Deploy to Heroku - $(date)"

# Deploy to Heroku
echo "🚀 Deploying to Heroku..."
git push heroku main

# Set environment variables
echo "⚙️  Setting environment variables..."
heroku config:set NODE_ENV=production
heroku config:set LOG_LEVEL=info

# Ensure the app is running
echo "🔧 Ensuring app is running..."
heroku ps:scale web=1

# Wait a moment for the app to start
echo "⏳ Waiting for app to start..."
sleep 5

# Check app status
echo "📊 Checking app status..."
heroku ps

# Open the app
echo "🌐 Opening app in browser..."
heroku open

echo "✅ Deployment completed successfully!"
echo "📝 Useful commands:"
echo "   heroku logs --tail    # View logs"
echo "   heroku restart        # Restart app"
echo "   heroku config         # View config"
echo "   heroku run yarn test  # Run tests on Heroku"
