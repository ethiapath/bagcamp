#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Check if Supabase CLI is installed
try {
  execSync('supabase --version', { stdio: 'ignore' });
} catch (error) {
  console.error('Error: Supabase CLI is not installed. Please install it first:');
  console.error('npm install -g supabase');
  process.exit(1);
}

// Check if user is logged in
try {
  execSync('supabase projects list', { stdio: 'ignore' });
} catch (error) {
  console.error('Error: Please login to Supabase CLI first:');
  console.error('supabase login');
  process.exit(1);
}

// Get project ID from environment variables
const projectId = process.env.NEXT_PUBLIC_SUPABASE_URL?.split('.')[0].split('//')[1];
if (!projectId) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL not found in environment variables');
  process.exit(1);
}

// Get database password from environment variables
const dbPassword = process.env.POSTGRES_PASSWORD;
if (!dbPassword) {
  console.error('Error: POSTGRES_PASSWORD not found in environment variables');
  process.exit(1);
}

console.log('🚀 Setting up database...');

// Run the migrations
try {
  // Construct the database URL
  const dbUrl = `postgres://postgres.${projectId}:${dbPassword}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;
  
  // Execute the migrations
  execSync(`supabase db push --db-url ${dbUrl}`, {
    stdio: 'inherit',
    env: {
      ...process.env,
      PGPASSWORD: dbPassword
    }
  });
  
  console.log('✅ Database setup completed successfully!');

  // List tables to verify
  console.log('\n📊 Verifying database tables:');
  const tables = execSync(`psql "${dbUrl}" -c "\\dt public.*"`, {
    encoding: 'utf8',
    env: {
      ...process.env,
      PGPASSWORD: dbPassword
    }
  });
  
  console.log(tables);
  
  // Count records in main tables
  console.log('\n📈 Record counts:');
  const recordCounts = [
    'artists',
    'releases',
    'tracks',
    'merchandise',
    'merchandise_variations'
  ];
  
  for (const table of recordCounts) {
    try {
      const count = execSync(`psql "${dbUrl}" -c "SELECT COUNT(*) FROM ${table}"`, {
        encoding: 'utf8',
        env: {
          ...process.env,
          PGPASSWORD: dbPassword
        }
      });
      console.log(`${table}: ${count}`);
    } catch (err) {
      console.log(`${table}: Table doesn't exist or is empty`);
    }
  }
  
} catch (error) {
  console.error('❌ Error setting up database:', error.message);
  process.exit(1);
} 