#!/usr/bin/env node

/**
 * Configuration generator for AI Chat Template
 * Creates customized business.json based on user input
 */

import fs from 'fs';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

const colors = {
  blue: '\x1b[34m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function collectBusinessInfo() {
  log('\n🚀 AI Chat Template Configuration Generator', 'blue');
  log('='.repeat(45), 'blue');

  const config = {};

  // Basic business information
  log('\n📋 Basic Information', 'yellow');
  config.name = await question('Business name: ');
  config.industry = await question('Industry (e.g., Restaurant, Healthcare, Retail): ');
  config.description = await question('Brief description: ');

  // Contact information
  log('\n📞 Contact Information', 'yellow');
  config.contact = {
    phone: await question('Phone number: '),
    email: await question('Email address: '),
    address: await question('Address (optional): ') || undefined,
    website: await question('Website URL (optional): ') || undefined
  };

  // Business hours
  log('\n🕒 Business Hours', 'yellow');
  const hasHours = await question('Do you want to set business hours? (y/n): ');
  if (hasHours.toLowerCase() === 'y') {
    config.hours = {
      monday: await question('Monday (e.g., "9:00 AM - 5:00 PM" or "Closed"): '),
      tuesday: await question('Tuesday: '),
      wednesday: await question('Wednesday: '),
      thursday: await question('Thursday: '),
      friday: await question('Friday: '),
      saturday: await question('Saturday: '),
      sunday: await question('Sunday: ')
    };
  }

  // Branding
  log('\n🎨 Branding', 'yellow');
  const primaryColor = await question('Primary brand color (hex code, e.g., #2563eb): ');
  config.branding = {
    primaryColor: primaryColor || '#2563eb',
    secondaryColor: await question('Secondary color (optional): ') || '#64748b',
    logo: '/images/company/logo.png'
  };

  // Services/Products
  log('\n💼 Services/Products', 'yellow');
  const services = [];
  let addMore = true;
  while (addMore) {
    const service = await question('Add a service/product (or press Enter to skip): ');
    if (service) {
      services.push({
        name: service,
        description: await question(`Description for "${service}": `)
      });
      const more = await question('Add another? (y/n): ');
      addMore = more.toLowerCase() === 'y';
    } else {
      addMore = false;
    }
  }
  if (services.length > 0) {
    config.services = services;
  }

  return config;
}

function generateBusinessConfig(userConfig) {
  const template = {
    name: userConfig.name,
    industry: userConfig.industry,
    description: userConfig.description,
    contact: userConfig.contact,
    branding: userConfig.branding,
    chat: {
      welcomeMessage: `Hello! Welcome to ${userConfig.name}. How can I help you today?`,
      personality: "friendly and professional",
      features: {
        voiceEnabled: false,
        fileUploadEnabled: true,
        typingIndicator: true
      }
    },
    knowledge: {
      categories: ["general", "services", "contact", "hours"],
      entries: [
        {
          id: "welcome",
          category: "general",
          question: `What is ${userConfig.name}?`,
          answer: userConfig.description,
          keywords: [userConfig.name.toLowerCase(), userConfig.industry.toLowerCase()]
        },
        {
          id: "contact",
          category: "contact",
          question: "How can I contact you?",
          answer: `You can reach us at ${userConfig.contact.phone} or ${userConfig.contact.email}${userConfig.contact.address ? ` We're located at ${userConfig.contact.address}` : ''}`,
          keywords: ["contact", "phone", "email", "address", "location"]
        }
      ]
    },
    content: {
      panels: []
    },
    scraping: {
      enabled: false,
      schedule: "daily",
      selectors: []
    }
  };

  // Add business hours if provided
  if (userConfig.hours) {
    template.hours = userConfig.hours;
    template.knowledge.entries.push({
      id: "hours",
      category: "hours",
      question: "What are your business hours?",
      answer: `Our business hours are: ${Object.entries(userConfig.hours)
        .map(([day, hours]) => `${day.charAt(0).toUpperCase() + day.slice(1)}: ${hours}`)
        .join(', ')}`,
      keywords: ["hours", "open", "closed", "schedule", "time"]
    });
  }

  // Add services if provided
  if (userConfig.services && userConfig.services.length > 0) {
    userConfig.services.forEach((service, index) => {
      template.knowledge.entries.push({
        id: `service_${index}`,
        category: "services",
        question: `Tell me about ${service.name}`,
        answer: service.description,
        keywords: [service.name.toLowerCase(), "service", "product"]
      });
    });
  }

  return template;
}

async function main() {
  try {
    const userConfig = await collectBusinessInfo();
    const businessConfig = generateBusinessConfig(userConfig);

    // Write to file
    const configPath = 'src/data/business.json';
    fs.writeFileSync(configPath, JSON.stringify(businessConfig, null, 2));

    log('\n✅ Configuration generated successfully!', 'green');
    log(`📁 Saved to: ${configPath}`, 'blue');

    log('\n🎯 Next steps:', 'yellow');
    log('1. Add your logo to public/images/company/logo.png');
    log('2. Configure your .env file with API keys');
    log('3. Run: npm run dev');
    log('\n💡 Run ./validate-setup.js to check your configuration');

  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
  } finally {
    rl.close();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { generateBusinessConfig };