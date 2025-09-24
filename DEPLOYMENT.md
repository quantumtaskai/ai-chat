# AI Business Receptionist - Deployment Guide

This guide explains how to deploy the AI Business Receptionist application for individual businesses using the simplified single-business architecture.

## 🎯 Deployment Strategy

Each business gets their own dedicated deployment with:
- Custom business configuration
- Isolated data and settings
- Personalized branding
- Independent scaling

## 🔧 Pre-Deployment Setup

### 1. Clone the Repository

```bash
git clone <repository-url> business-receptionist-[BUSINESS-NAME]
cd business-receptionist-[BUSINESS-NAME]
```

### 2. Customize Business Configuration

Edit `src/data/business.json`:

```json
{
  "id": "client-business-id",
  "name": "Client Business Name",
  "description": "Brief description for AI responses",
  "industry": "Client's Industry",
  "website": "https://clientwebsite.com",
  "branding": {
    "primaryColor": "#client-brand-color",
    "secondaryColor": "#client-secondary-color",
    "logo": "/assets/client-logo.svg",
    "font": "Client-Font-Family"
  },
  "settings": {
    "welcomeMessage": "Hello! I'm [BUSINESS NAME]'s AI assistant. How can I help you today?",
    "aiPersonality": "professional and friendly",
    "enableVoice": true,
    "enableLeadCapture": true
  }
}
```

### 3. Set Environment Variables

Create `.env.local`:

```bash
VITE_APP_TITLE=Client Business Name - AI Assistant
VITE_APP_VERSION=1.0.0
```

### 4. Build and Test

```bash
npm install
npm run build
npm run preview
```

## 🚀 Deployment Options

### Option 1: Docker Deployment (Recommended)

```bash
# Build and run with Docker
npm run docker:build
npm run docker:run
```

### Option 2: Static Hosting

```bash
# Build for production
npm run build:prod

# Deploy dist/ folder to any static host
# (Netlify, Vercel, GitHub Pages, etc.)
```

### Option 3: VPS with Nginx

```bash
# Build application
npm run build:prod

# Copy to web server
sudo cp -r dist/* /var/www/html/

# Configure Nginx for SPA routing
```

## 📋 Client Onboarding Checklist

### Pre-Deployment
- [ ] Clone repository with client name
- [ ] Customize business.json
- [ ] Add client branding
- [ ] Test build locally

### Deployment
- [ ] Deploy to production
- [ ] Configure domain
- [ ] Set up SSL
- [ ] Test all features

### Post-Deployment
- [ ] Client review
- [ ] Configure monitoring
- [ ] Set up backups
- [ ] Document configuration

## 🔧 Quick Setup Commands

```bash
# 1. Clone and setup
git clone <repo> client-receptionist
cd client-receptionist
npm install

# 2. Customize configuration
# Edit src/data/business.json with client details

# 3. Build and deploy
npm run build:prod
npm run docker:build
npm run docker:run

# 4. Verify deployment
curl http://localhost/health
```

## 🆘 Troubleshooting

- **Build fails**: Clear node_modules and reinstall
- **Docker issues**: Check container logs
- **Content not loading**: Verify business.json format
- **Styling issues**: Check branding colors are valid CSS

For detailed deployment instructions and advanced configuration, contact the development team.