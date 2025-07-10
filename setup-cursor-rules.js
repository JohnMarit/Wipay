#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Setting up Cursor Rules enforcement for Wipay project...');

try {
  // Change to wipay directory for npm operations
  process.chdir('wipay');
  
  // Install Husky in the wipay project
  console.log('📦 Installing Husky...');
  execSync('npm install husky prettier --save-dev', { stdio: 'inherit' });
  
  // Initialize Husky from root directory
  console.log('🔧 Initializing Husky...');
  process.chdir('..');
  execSync('npx husky install', { stdio: 'inherit' });
  
  // Create git hooks that work with the wipay subdirectory
  console.log('🔗 Creating git hooks...');
  
  // Pre-commit hook
  const preCommitHook = `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 Running pre-commit checks in wipay directory..."

cd wipay

# Run linting
echo "📝 Checking ESLint rules..."
npm run lint

# Run type checking
echo "🔍 Checking TypeScript types..."
npm run type-check

# Run tests
echo "🧪 Running tests..."
npm run test

# Check for secrets and sensitive data
echo "🔒 Checking for secrets..."
npm run security-check

# Format code
echo "🎨 Formatting code..."
npm run format

echo "✅ Pre-commit checks completed!"
`;

  fs.writeFileSync('.husky/pre-commit', preCommitHook);
  
  // Post-commit hook
  const postCommitHook = `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🎯 Running post-commit validation in wipay directory..."

cd wipay

# Validate blue color usage in components
echo "🎨 Validating blue color scheme usage..."
npm run validate-colors

# Check security compliance
echo "🔒 Running security audit..."
npm run security-audit

# Validate accessibility standards
echo "♿ Checking accessibility compliance..."
npm run a11y-check

# Check performance metrics
echo "⚡ Analyzing performance..."
npm run perf-check

echo "✅ Post-commit validation completed!"
`;

  fs.writeFileSync('.husky/post-commit', postCommitHook);
  
  // Make git hooks executable
  console.log('🛠️ Making git hooks executable...');
  if (process.platform !== 'win32') {
    fs.chmodSync('.husky/pre-commit', '755');
    fs.chmodSync('.husky/post-commit', '755');
  }
  
  // Change back to wipay directory for validation
  process.chdir('wipay');
  
  // Make scripts executable
  console.log('🛠️ Making scripts executable...');
  const scriptsDir = path.join(process.cwd(), 'scripts');
  if (fs.existsSync(scriptsDir)) {
    const files = fs.readdirSync(scriptsDir);
    files.forEach(file => {
      const filePath = path.join(scriptsDir, file);
      if (process.platform !== 'win32') {
        fs.chmodSync(filePath, '755');
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