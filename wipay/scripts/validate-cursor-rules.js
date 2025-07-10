#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('📋 Validating Cursor Rules compliance...');

let violations = [];
let checks = {
  typescript: 0,
  security: 0,
  accessibility: 0,
  performance: 0,
  codeQuality: 0
};

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      const trimmedLine = line.trim();
      
      // TypeScript checks
      if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        // Check for any usage (should be avoided)
        if (trimmedLine.includes(': any') || trimmedLine.includes('as any')) {
          violations.push({
            file: filePath,
            line: lineNumber,
            rule: 'TypeScript Strict Mode',
            issue: 'Avoid using "any" type for type safety',
            severity: 'warning'
          });
        }
        
        // Check for proper interface definitions
        if (trimmedLine.startsWith('interface ') || trimmedLine.startsWith('type ')) {
          checks.typescript++;
        }
        
        // Check for console.log in production code
        if (trimmedLine.includes('console.log') && !filePath.includes('test')) {
          violations.push({
            file: filePath,
            line: lineNumber,
            rule: 'Code Quality',
            issue: 'Remove console.log statements from production code',
            severity: 'warning'
          });
        }
      }
      
      // Security checks
      if (trimmedLine.includes('localStorage.setItem') || trimmedLine.includes('sessionStorage.setItem')) {
        if (trimmedLine.includes('token') || trimmedLine.includes('password') || trimmedLine.includes('secret')) {
          violations.push({
            file: filePath,
            line: lineNumber,
            rule: 'Security - Data Storage',
            issue: 'Never store sensitive data in localStorage/sessionStorage',
            severity: 'error'
          });
        }
      }
      
      // Check for hardcoded secrets
      if (trimmedLine.includes('api_key') || trimmedLine.includes('secret_key') || trimmedLine.includes('password')) {
        if (trimmedLine.includes('=') && !trimmedLine.includes('process.env')) {
          violations.push({
            file: filePath,
            line: lineNumber,
            rule: 'Security - Secrets Management',
            issue: 'Use environment variables for secrets and API keys',
            severity: 'error'
          });
        }
      }
      
      // Accessibility checks
      if (trimmedLine.includes('<button') && !trimmedLine.includes('aria-label') && !trimmedLine.includes('aria-labelledby')) {
        violations.push({
          file: filePath,
          line: lineNumber,
          rule: 'Accessibility',
          issue: 'Button elements should have accessible labels',
          severity: 'warning'
        });
      }
      
      // Performance checks
      if (trimmedLine.includes('useEffect') && !trimmedLine.includes('[]') && !trimmedLine.includes('dependencies')) {
        checks.performance++;
      }
      
      // Component naming check
      if (filePath.endsWith('.tsx') && trimmedLine.includes('export default function')) {
        const functionName = trimmedLine.match(/function\s+(\w+)/);
        if (functionName && functionName[1]) {
          const name = functionName[1];
          if (name[0] !== name[0].toUpperCase()) {
            violations.push({
              file: filePath,
              line: lineNumber,
              rule: 'Component Standards',
              issue: 'Component names should use PascalCase',
              severity: 'warning'
            });
          }
          checks.codeQuality++;
        }
      }
    });
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
  }
}

function scanDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      scanDirectory(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.jsx') || file.endsWith('.js')) {
      scanFile(filePath);
    }
  });
}

// Scan the src directory
const srcDir = path.join(process.cwd(), 'src');
if (fs.existsSync(srcDir)) {
  scanDirectory(srcDir);
}

// Report results
console.log('\n📊 Cursor Rules Compliance Report:');
console.log(`   TypeScript interfaces/types: ${checks.typescript}`);
console.log(`   Components found: ${checks.codeQuality}`);
console.log(`   Performance checks: ${checks.performance}`);

const errors = violations.filter(v => v.severity === 'error');
const warnings = violations.filter(v => v.severity === 'warning');

if (errors.length > 0) {
  console.log('\n❌ Critical violations found:');
  errors.forEach(violation => {
    console.log(`  ${violation.file}:${violation.line}`);
    console.log(`    ${violation.rule}: ${violation.issue}`);
    console.log('');
  });
}

if (warnings.length > 0) {
  console.log('\n⚠️  Warnings found:');
  warnings.forEach(violation => {
    console.log(`  ${violation.file}:${violation.line}`);
    console.log(`    ${violation.rule}: ${violation.issue}`);
    console.log('');
  });
}

if (violations.length === 0) {
  console.log('✅ All cursor rules compliance checks passed!');
} else {
  console.log(`\n📋 Summary: ${errors.length} errors, ${warnings.length} warnings`);
  if (errors.length > 0) {
    console.log('💡 Please fix all critical violations before committing.');
    process.exit(1);
  }
}

console.log('\n🎯 Cursor rules validation completed!'); 