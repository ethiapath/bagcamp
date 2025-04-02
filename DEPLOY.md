# Deploying Bagcamp to Vercel

This guide explains how to deploy the Bagcamp application to Vercel.

## Prerequisites

- A [Vercel](https://vercel.com) account
- [Node.js](https://nodejs.org) (version 18.0.0 or higher)
- [npm](https://www.npmjs.com/) (version 8.0.0 or higher)
- Git (optional, for GitHub deployment)

## Deployment Options

There are several ways to deploy Bagcamp to Vercel:

### Option 1: Using the Deployment Script (Recommended)

We've included a deployment script that simplifies the process:

```bash
# For staging deployment
npm run deploy

# For production deployment
npm run deploy:prod
```

When you run this command, the script will:
1. Check if Vercel CLI is installed (and install it if needed)
2. Run linting to check for code issues
3. Build the application
4. Deploy it to Vercel

The first time you run this, you'll be prompted to log in to your Vercel account and configure your project.

### Option 2: Manual Deployment via Vercel CLI

You can also deploy manually using the Vercel CLI:

```bash
# Install Vercel CLI if you haven't already
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to development/preview environment
vercel

# Deploy to production
vercel --prod
```

### Option 3: GitHub Integration

For continuous deployment, you can connect your GitHub repository to Vercel:

1. Push your code to a GitHub repository
2. Log in to your Vercel account
3. Click "Import Project" 
4. Select "Import Git Repository"
5. Enter your repository URL or select it from the list
6. Configure your project settings
7. Click "Deploy"

This will automatically deploy your application when changes are pushed to the main branch.

## Environment Variables

If your application requires environment variables (e.g., API keys, database connection strings), you can add them in the Vercel dashboard:

1. Go to your project in the Vercel dashboard
2. Navigate to "Settings" > "Environment Variables"
3. Add your environment variables as key-value pairs

## Custom Domains

To set up a custom domain:

1. Go to your project in the Vercel dashboard
2. Navigate to "Settings" > "Domains"
3. Add your domain and follow the instructions

## Troubleshooting

If you encounter deployment issues:

- Check the Vercel deployment logs
- Ensure your application builds locally with `npm run build`
- Verify that all required environment variables are set
- Ensure your Vercel account has sufficient resources/limits

## Vercel GitHub Action

For teams using GitHub, we've included a GitHub Actions workflow in `.github/workflows/deploy.yml` that automatically deploys your application when changes are pushed to the main branch.

To use this, you need to add the following secrets to your GitHub repository:

- `VERCEL_TOKEN`: Your Vercel API token
- `VERCEL_ORG_ID`: Your Vercel organization ID
- `VERCEL_PROJECT_ID`: Your Vercel project ID

You can find these values in your Vercel dashboard under "Settings" > "General" > "Project ID" and by creating a token in your account settings. 