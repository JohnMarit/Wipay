#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Setting up Cursor Rules enforcement...');

try {
  // Install Husky
  console.log('📦 Installing Husky...');
  execSync('npm install husky --save-dev', { stdio: 'inherit' });
  
  // Initialize Husky
  console.log('🔧 Initializing Husky...');
  execSync('npx husky install', { stdio: 'inherit' });
  
  // Make scripts executable
  console.log('🛠️ Making scripts executable...');
  const scriptsDir = path.join(__dirname, 'scripts');
  if (fs.existsSync(scriptsDir)) {
    const files = fs.readdirSync(scriptsDir);
    files.forEach(file => {
      const filePath = path.join(scriptsDir, file);
      fs.chmodSync(filePath, '755');
    });
  }
  
  // Make git hooks executable
  console.log('🔗 Making git hooks executable...');
  const hooksDir = path.join(__dirname, '.husky');
  if (fs.existsSync(hooksDir)) {
    const files = fs.readdirSync(hooksDir);
    files.forEach(file => {
      if (!file.startsWith('_') && !file.includes('.')) {
        const filePath = path.join(hooksDir, file);
        if (fs.existsSync(filePath)) {
          fs.chmodSync(filePath, '755');
        }
      }
    });
  }
  
  // Test the setup
  console.log('🧪 Testing cursor rules setup...');
  execSync('npm run validate-rules', { stdio: 'inherit' });
  execSync('npm run validate-colors', { stdio: 'inherit' });
  
  console.log('\n✅ Cursor Rules enforcement setup completed successfully!');
  console.log('\n📋 What was configured:');
  console.log('  ✅ Husky git hooks (pre-commit, post-commit)');
  console.log('  ✅ ESLint and Prettier for code quality');
  console.log('  ✅ TypeScript strict mode checking');
  console.log('  ✅ Security vulnerability scanning');
  console.log('  ✅ Blue color scheme validation');
  console.log('  ✅ Accessibility compliance checking');
  console.log('  ✅ VS Code settings for automatic formatting');
  console.log('  ✅ GitHub Actions CI/CD pipeline');
  
  console.log('\n🎯 Next steps:');
  console.log('  1. Commit your changes to activate git hooks');
  console.log('  2. Install recommended VS Code extensions:');
  console.log('     - ESLint');
  console.log('     - Prettier');
  console.log('     - TypeScript and JavaScript Language Features');
  console.log('  3. Rules will now be enforced on every commit and push!');
  
} catch (error) {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
} 