# 🚀 Quick Template Setup Guide

This guide will help you customize the AI Chat Template for your business in just a few minutes.

## 📋 Prerequisites

- Node.js 18+ installed
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))
- Your business information ready

## ⚡ Quick Setup (5 minutes)

### Method 1: Automated Setup Script (Recommended)

```bash
# Make setup script executable
chmod +x setup.sh

# Run the setup script
./setup.sh
```

The script will guide you through:
1. Business information
2. Contact details
3. API key configuration
4. Automatic file updates

### Method 2: Manual Setup

#### 1. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit .env and add your OpenAI API key
OPENAI_API_KEY=your_actual_api_key_here
```

#### 2. Business Configuration
Edit `src/data/business.json`:

```json
{
  "id": "your-business-id",
  "name": "Your Business Name",
  "description": "Brief description of your business",
  "industry": "Your Industry",
  "website": "https://your-website.com",
  "branding": {
    "primaryColor": "#your-brand-color"
  },
  "settings": {
    "welcomeMessage": "Hello! I'm your AI assistant...",
    "contactInfo": {
      "phone": "your-phone",
      "email": "your-email",
      "address": "your-address"
    }
  }
}
```

#### 3. Logo and Branding
```bash
# Replace placeholder logo
cp your-logo.png public/images/company/logo.png

# Update favicon (optional)
cp your-favicon.ico public/favicon.ico
```

## 🎨 Customization Options

### Brand Colors
Update in `src/data/business.json`:
```json
{
  "branding": {
    "primaryColor": "#3b82f6",    // Main brand color
    "secondaryColor": "#1e40af",  // Secondary color
    "accentColor": "#f59e0b",     // Accent highlights
    "font": "Inter"               // Google Font name
  }
}
```

### Knowledge Base
Add your business-specific Q&As:
```json
{
  "knowledgeBase": [
    {
      "question": "What services do you offer?",
      "answer": "We provide...",
      "tags": ["services", "products"],
      "priority": 10
    }
  ]
}
```

### Contact Forms
Customize form fields:
```json
{
  "content": [{
    "type": "form",
    "title": "Contact Us",
    "data": {
      "fields": [
        {"name": "name", "type": "text", "label": "Full Name", "required": true},
        {"name": "email", "type": "email", "label": "Email", "required": true}
      ]
    }
  }]
}
```

## 🚀 Development & Deployment

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

### Production Build
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Deploy to Vercel (Recommended)
1. Push to GitHub
2. Import to Vercel
3. Add `OPENAI_API_KEY` in environment variables
4. Deploy automatically

### Deploy to Netlify
1. Push to GitHub
2. Connect to Netlify
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add environment variables in site settings

## 📱 Embed Widget on Your Website

Add this script before closing `</body>` tag:
```html
<script src="https://your-deployed-domain.com/widget-loader.js"></script>
```

The widget will appear as a chat button in the bottom-right corner.

## 🎯 Industry-Specific Customization

### Restaurant/Food Service
```json
{
  "industry": "Restaurant",
  "content": [
    {"type": "booking", "title": "Table Reservation"},
    {"type": "live-content", "title": "Menu", "url": "https://yoursite.com/menu"}
  ],
  "knowledgeBase": [
    {"question": "What are your hours?", "answer": "We're open..."},
    {"question": "Do you take reservations?", "answer": "Yes, you can..."}
  ]
}
```

### Professional Services
```json
{
  "industry": "Professional Services",
  "content": [
    {"type": "booking", "title": "Consultation Booking"},
    {"type": "form", "title": "Service Inquiry"}
  ],
  "knowledgeBase": [
    {"question": "What services do you offer?", "answer": "We provide..."},
    {"question": "How much do you charge?", "answer": "Our pricing..."}
  ]
}
```

### E-commerce
```json
{
  "industry": "E-commerce",
  "content": [
    {"type": "live-content", "title": "Products", "url": "https://yoursite.com/products"}
  ],
  "knowledgeBase": [
    {"question": "What products do you sell?", "answer": "We offer..."},
    {"question": "What's your return policy?", "answer": "You can return..."}
  ]
}
```

## ⚠️ Common Issues & Solutions

### API Key Issues
- Ensure OpenAI API key is valid and has credits
- Check .env file is properly formatted
- Restart development server after adding keys

### Widget Not Loading
- Check CORS settings on your website
- Ensure widget-loader.js is accessible
- Verify the script tag is before closing </body>

### Build Errors
- Run `npm run type-check` to validate TypeScript
- Check all required fields in business.json
- Ensure all referenced images exist

## 🔧 Advanced Configuration

### External API Integration
```env
# Use external API for business config
VITE_API_URL=https://api.yourdomain.com/config
```

### Multi-language Support
Update knowledge base with multiple language entries:
```json
{
  "knowledgeBase": [
    {
      "question": "What services do you offer?",
      "answer": "We provide...",
      "answer_es": "Proporcionamos...",
      "answer_fr": "Nous fournissons..."
    }
  ]
}
```

### Custom Styling
Override CSS variables in your website:
```css
:root {
  --chat-primary-color: #your-color;
  --chat-secondary-color: #your-secondary-color;
}
```

## 📞 Need Help?

- 📖 Check the main [README.md](./README.md)
- 🐛 Report issues on GitHub
- 💬 Use GitHub Discussions for questions

---

**Ready to go live?** Your AI chat template is configured! 🎉

Test it locally with `npm run dev`, then deploy to your hosting platform.