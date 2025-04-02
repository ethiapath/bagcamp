#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Function to execute shell commands
function runCommand(command) {
  try {
    console.log(`Executing: ${command}`);
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`Failed to execute ${command}`, error);
    return false;
  }
}

// Check if Vercel CLI is installed globally
function checkVercelCLI() {
  try {
    execSync('vercel --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

// Main deployment function
async function deploy() {
  console.log('🚀 Starting Bagcamp deployment to Vercel...');
  
  // Ensure the scripts directory exists
  if (!fs.existsSync(path.dirname(__filename))) {
    fs.mkdirSync(path.dirname(__filename), { recursive: true });
  }

  // Check if Vercel CLI is installed
  const isVercelInstalled = checkVercelCLI();
  
  if (!isVercelInstalled) {
    console.log('📦 Vercel CLI not found globally. Installing locally...');
    if (!runCommand('npm install --save-dev vercel')) {
      console.error('❌ Failed to install Vercel CLI. Aborting deployment.');
      process.exit(1);
    }
  }

  // Run linting and type-checking
  console.log('🔍 Running linting and type checking...');
  if (!runCommand('npm run lint')) {
    console.warn('⚠️ Linting issues detected. Continuing with deployment...');
  }

  // Build the application
  console.log('🔨 Building the application...');
  if (!runCommand('npm run build')) {
    console.error('❌ Build failed. Aborting deployment.');
    process.exit(1);
  }

  // Deploy to Vercel
  console.log('🚀 Deploying to Vercel...');
  
  // Use npx to ensure we use the local Vercel CLI if global is not available
  const vercelCmd = isVercelInstalled ? 'vercel' : 'npx vercel';
  
  // Deploy with production flag if specified
  const prodFlag = process.argv.includes('--prod') ? '--prod' : '';
  
  if (!runCommand(`${vercelCmd} ${prodFlag}`)) {
    console.error('❌ Deployment failed.');
    process.exit(1);
  }

  console.log('✅ Deployment completed successfully!');
}

// Execute the deployment
deploy().catch(error => {
  console.error('Deployment error:', error);
  process.exit(1);
}); 