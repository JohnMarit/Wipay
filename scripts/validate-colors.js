#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🎨 Validating blue color scheme usage...');

// Define allowed blue colors from cursor rules
const allowedBlueColors = [
  'blue-50',
  'blue-100',
  'blue-200',
  'blue-300',
  'blue-400',
  'blue-500',
  'blue-600',
  'blue-700',
  'blue-800',
  'blue-900',
  'bg-blue-',
  'text-blue-',
  'border-blue-',
  'hover:bg-blue-',
  'hover:text-blue-',
  'focus:ring-blue-'
];

// Colors that should be avoided or replaced with blue
const discouragedColors = [
  'red-',
  'green-',
  'yellow-',
  'purple-',
  'pink-',
  'indigo-',
  'gray-' // Allow gray for neutrals
];

let violations = [];
let blueUsageCount = 0;

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      // Check for blue color usage (positive)
      allowedBlueColors.forEach(color => {
        if (line.includes(color)) {
          blueUsageCount++;
        }
      });
      
      // Check for non-blue primary colors (potential violations)
      discouragedColors.forEach(color => {
        if (line.includes(color) && !color.includes('gray-')) {
          // Skip gray as it's allowed for neutrals
          if (line.includes('bg-' + color) || line.includes('text-' + color)) {
            violations.push({
              file: filePath,
              line: index + 1,
              content: line.trim(),
              issue: `Non-blue primary color detected: ${color}`
            });
          }
        }
      });
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
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css')) {
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
console.log(`✅ Blue color usage found: ${blueUsageCount} instances`);

if (violations.length > 0) {
  console.log('\n⚠️  Color scheme violations found:');
  violations.forEach(violation => {
    console.log(`  ${violation.file}:${violation.line}`);
    console.log(`    ${violation.issue}`);
    console.log(`    ${violation.content}`);
    console.log('');
  });
  
  console.log('💡 Please update these colors to use the blue color scheme as defined in cursor rules.');
  process.exit(1);
} else {
  console.log('✅ All color usage follows the blue color scheme guidelines!');
} 