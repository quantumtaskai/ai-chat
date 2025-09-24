#!/usr/bin/env node

/**
 * Validation script for AI Chat Template setup
 * Checks that all required configuration is properly set
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFileExists(filePath, name) {
  if (fs.existsSync(filePath)) {
    log(`✓ ${name} exists`, 'green');
    return true;
  } else {
    log(`✗ ${name} missing`, 'red');
    return false;
  }
}

function validateEnvironment() {
  log('\n=== Environment Configuration ===', 'blue');

  const envPath = '.env';
  if (!checkFileExists(envPath, '.env file')) {
    log('  Run: cp .env.example .env', 'yellow');
    return false;
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredVars = ['VITE_OPENAI_API_KEY', 'VITE_BUSINESS_NAME'];
  let allSet = true;

  requiredVars.forEach(varName => {
    const regex = new RegExp(`^${varName}=.+`, 'm');
    if (regex.test(envContent) && !envContent.includes(`${varName}=your_`)) {
      log(`✓ ${varName} is configured`, 'green');
    } else {
      log(`✗ ${varName} not configured`, 'red');
      allSet = false;
    }
  });

  return allSet;
}

function validateBusinessConfig() {
  log('\n=== Business Configuration ===', 'blue');

  const businessPath = 'src/data/business.json';
  if (!checkFileExists(businessPath, 'business.json')) {
    return false;
  }

  try {
    const business = JSON.parse(fs.readFileSync(businessPath, 'utf8'));
    let allValid = true;

    // Check required fields
    const requiredFields = [
      'name',
      'industry',
      'description',
      'contact.phone',
      'contact.email',
      'branding.primaryColor'
    ];

    requiredFields.forEach(field => {
      const value = field.split('.').reduce((obj, key) => obj && obj[key], business);
      if (value && !value.toString().includes('Your ') && !value.toString().includes('[YOUR_')) {
        log(`✓ ${field} configured`, 'green');
      } else {
        log(`✗ ${field} needs configuration`, 'red');
        allValid = false;
      }
    });

    return allValid;
  } catch (error) {
    log(`✗ Invalid JSON in business.json: ${error.message}`, 'red');
    return false;
  }
}

function validateAssets() {
  log('\n=== Assets ===', 'blue');

  const logoPath = 'public/images/company/logo.png';
  const hasLogo = checkFileExists(logoPath, 'Company logo');

  if (!hasLogo) {
    log('  Add your logo to public/images/company/logo.png', 'yellow');
  }

  return hasLogo;
}

function validateDependencies() {
  log('\n=== Dependencies ===', 'blue');

  const packagePath = 'package.json';
  const nodeModulesPath = 'node_modules';

  let allGood = true;

  if (!checkFileExists(packagePath, 'package.json')) {
    allGood = false;
  }

  if (!checkFileExists(nodeModulesPath, 'node_modules directory')) {
    log('  Run: npm install', 'yellow');
    allGood = false;
  }

  return allGood;
}

function main() {
  log('AI Chat Template Setup Validation', 'blue');
  log('='.repeat(40), 'blue');

  const checks = [
    validateDependencies(),
    validateEnvironment(),
    validateBusinessConfig(),
    validateAssets()
  ];

  const allPassed = checks.every(check => check);

  log('\n=== Summary ===', 'blue');
  if (allPassed) {
    log('✓ All checks passed! Your template is ready to run.', 'green');
    log('\nNext steps:', 'blue');
    log('  npm run dev    # Start development server', 'yellow');
    log('  npm run build  # Build for production', 'yellow');
  } else {
    log('✗ Some checks failed. Please fix the issues above.', 'red');
    log('\nFor help, see:', 'yellow');
    log('  README.md - Complete setup guide');
    log('  TEMPLATE-SETUP.md - Detailed customization');
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { validateEnvironment, validateBusinessConfig, validateAssets, validateDependencies };