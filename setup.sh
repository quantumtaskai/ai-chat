#!/bin/bash

# AI Chat Template Setup Script
# This script helps you quickly configure the template for your business

set -e  # Exit on error

echo "🤖 AI Chat Template Setup"
echo "========================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if required files exist
if [[ ! -f ".env.example" ]]; then
    echo -e "${RED}Error: .env.example not found. Make sure you're in the project root directory.${NC}"
    exit 1
fi

if [[ ! -f "src/data/business.json" ]]; then
    echo -e "${RED}Error: src/data/business.json not found. Make sure you're in the project root directory.${NC}"
    exit 1
fi

echo -e "${BLUE}Let's set up your AI chat template!${NC}"
echo ""

# Business Information
echo -e "${YELLOW}Step 1: Business Information${NC}"
echo "-----------------------------"

read -p "Enter your business name: " business_name
read -p "Enter your business website (e.g., https://yourbusiness.com): " business_website
read -p "Enter your industry (e.g., Restaurant, Retail, Professional Services): " business_industry
read -p "Enter a brief description of your business: " business_description

echo ""

# Contact Information
echo -e "${YELLOW}Step 2: Contact Information${NC}"
echo "----------------------------"

read -p "Enter your business phone number: " business_phone
read -p "Enter your business email: " business_email
read -p "Enter your business address: " business_address

echo ""

# API Configuration
echo -e "${YELLOW}Step 3: API Configuration${NC}"
echo "------------------------"

if [[ ! -f ".env" ]]; then
    echo "Copying .env.example to .env..."
    cp .env.example .env
fi

read -p "Enter your OpenAI API key (required): " openai_key
if [[ -n "$openai_key" ]]; then
    # Update .env file
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/VITE_OPENAI_API_KEY=.*/VITE_OPENAI_API_KEY=$openai_key/" .env
    else
        # Linux
        sed -i "s/VITE_OPENAI_API_KEY=.*/VITE_OPENAI_API_KEY=$openai_key/" .env
    fi
    echo -e "${GREEN}✓ OpenAI API key configured${NC}"
else
    echo -e "${YELLOW}⚠ Warning: OpenAI API key not provided. You'll need to add it manually to .env${NC}"
fi

read -p "Enter your HeyGen API key (optional - press Enter to skip): " heygen_key
if [[ -n "$heygen_key" ]]; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/HEYGEN_API_KEY=.*/HEYGEN_API_KEY=$heygen_key/" .env
    else
        # Linux
        sed -i "s/HEYGEN_API_KEY=.*/HEYGEN_API_KEY=$heygen_key/" .env
    fi
    echo -e "${GREEN}✓ HeyGen API key configured${NC}"
fi

echo ""

# Update business.json
echo -e "${YELLOW}Step 4: Updating Business Configuration${NC}"
echo "----------------------------------------"

# Create a temporary business.json with user input
cat > temp_business.json << EOF
{
  "id": "${business_name,,}",
  "name": "$business_name",
  "description": "$business_description",
  "industry": "$business_industry",
  "website": "$business_website",
  "branding": {
    "primaryColor": "#3b82f6",
    "secondaryColor": "#1e40af",
    "accentColor": "#f59e0b",
    "logo": "/images/company/logo.png",
    "font": "Inter"
  },
  "scrapingConfig": {
    "enabled": true,
    "website": "$business_website",
    "selectors": {
      "about": "main, .main-content, .hero, .about",
      "services": ".services, .products, .categories, .offerings",
      "contact": ".contact, .reach-us, footer",
      "brands": ".brands, .partners, .portfolio"
    },
    "contentPriority": ["about", "services", "brands", "contact"],
    "updateSchedule": "weekly",
    "excludeSelectors": ["nav", "header", ".navigation", "script", "style", ".cookie-banner"]
  },
  "content": [
    {
      "id": "homepage-overview",
      "type": "live-content",
      "title": "Company Homepage",
      "description": "Live overview of our homepage with key information and services",
      "url": "$business_website",
      "tags": ["homepage", "overview", "company", "live"],
      "category": "company"
    },
    {
      "id": "company-overview",
      "type": "live-content",
      "title": "About Our Company",
      "description": "Live extracted content from our company information page",
      "url": "$business_website/about",
      "tags": ["overview", "company", "about", "live"],
      "category": "company"
    },
    {
      "id": "contact-form",
      "type": "form",
      "title": "Contact Us",
      "description": "Get in touch with our team for inquiries and support",
      "data": {
        "fields": [
          {"name": "name", "type": "text", "label": "Full Name", "required": true},
          {"name": "email", "type": "email", "label": "Email Address", "required": true},
          {"name": "phone", "type": "tel", "label": "Phone Number", "required": false},
          {"name": "subject", "type": "select", "label": "Subject", "options": ["General Inquiry", "Support Request", "Partnership", "Other"], "required": true},
          {"name": "message", "type": "textarea", "label": "Message", "required": true}
        ]
      },
      "tags": ["contact", "form", "inquiry"],
      "category": "contact"
    }
  ],
  "knowledgeBase": [
    {
      "id": "kb-1",
      "question": "What services do you offer?",
      "answer": "$business_description",
      "tags": ["services", "offerings", "products"],
      "contentIds": ["company-overview"],
      "priority": 10
    },
    {
      "id": "kb-2",
      "question": "How can I contact you?",
      "answer": "You can reach us at $business_phone, email us at $business_email, or fill out our contact form. We typically respond within 24 hours.",
      "tags": ["contact", "reach", "phone", "email"],
      "contentIds": ["contact-form"],
      "priority": 9
    },
    {
      "id": "kb-3",
      "question": "Where are you located?",
      "answer": "We're located at $business_address. Visit our website at $business_website for more information.",
      "tags": ["location", "address", "website"],
      "contentIds": ["company-overview"],
      "priority": 8
    }
  ],
  "settings": {
    "welcomeMessage": "Hello! I'm the AI assistant for $business_name. I can help you learn about our services, answer questions, and connect you with our team. How can I help you today?",
    "aiPersonality": "friendly and professional, knowledgeable about $business_name",
    "enableVoice": true,
    "enableLeadCapture": true,
    "operatingHours": {
      "enabled": true,
      "timezone": "America/New_York",
      "hours": {
        "monday": {"open": "09:00", "close": "17:00"},
        "tuesday": {"open": "09:00", "close": "17:00"},
        "wednesday": {"open": "09:00", "close": "17:00"},
        "thursday": {"open": "09:00", "close": "17:00"},
        "friday": {"open": "09:00", "close": "17:00"},
        "saturday": {"open": "closed", "close": "closed"},
        "sunday": {"open": "closed", "close": "closed"}
      }
    },
    "contactInfo": {
      "phone": "$business_phone",
      "email": "$business_email",
      "address": "$business_address"
    }
  }
}
EOF

# Backup original and replace
if [[ -f "src/data/business.json" ]]; then
    cp src/data/business.json src/data/business.json.backup
    echo -e "${GREEN}✓ Original business.json backed up${NC}"
fi

mv temp_business.json src/data/business.json
echo -e "${GREEN}✓ Business configuration updated${NC}"

echo ""

# Final steps
echo -e "${YELLOW}Step 5: Final Steps${NC}"
echo "------------------"

echo -e "${GREEN}✓ Setup completed successfully!${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Add your logo to public/images/company/logo.png"
echo "2. Customize your brand colors in src/data/business.json"
echo "3. Run 'npm install' to install dependencies"
echo "4. Run 'npm run dev' to start development server"
echo "5. Run 'npm run build' when ready to deploy"
echo ""
echo -e "${BLUE}To embed the chat widget on your website:${NC}"
echo "Add this script tag before closing </body> tag:"
echo '<script src="https://your-domain.com/widget-loader.js"></script>'
echo ""
echo -e "${GREEN}Happy chatting! 🤖${NC}"