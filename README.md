# AI Business Receptionist

A modern, Vue.js-based AI receptionist application that provides intelligent chat assistance and dynamic content delivery for businesses. Each deployment is dedicated to a single business, providing a focused and personalized experience.

## ✨ Features

- **🤖 AI-Powered Chat**: Intelligent conversational AI with business-specific knowledge base
- **📋 Dynamic Content Panel**: Displays relevant content (PDFs, videos, forms, booking widgets) based on chat context
- **🔧 Website Scraping**: Automatically scrapes and indexes business website content for up-to-date information
- **📱 Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **🎨 Customizable Branding**: Business-specific colors, logos, and styling
- **🗣️ Voice Support**: Text-to-speech capabilities for accessibility
- **📊 Lead Capture**: Built-in forms for capturing customer information
- **⚡ Real-time Content Suggestions**: AI suggests relevant content during conversations

## 🏗️ Architecture

This application uses a **single-business deployment model** where:
- Each deployment serves exactly one business
- Configuration is simplified and focused
- No multi-tenant complexity
- Easy to clone and customize per client

### Tech Stack

- **Frontend**: Vue 3 + TypeScript + Composition API
- **State Management**: Pinia
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Deployment**: Docker + Nginx

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Docker (optional, for containerized deployment)

### Local Development

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd aichat-17092025
   npm install
   ```

2. **Configure Business**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your settings
   ```

3. **Customize Business Configuration**
   Edit `src/data/business.json` with your business details:
   ```json
   {
     "id": "your-business",
     "name": "Your Business Name",
     "description": "Your business description",
     "industry": "Your Industry",
     "website": "https://yourbusiness.com",
     "branding": {
       "primaryColor": "#3b82f6",
       "secondaryColor": "#1e40af"
     },
     "settings": {
       "welcomeMessage": "Hello! How can I help you today?"
     }
   }
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Open Application**
   Navigate to `http://localhost:3000`

## 📁 Project Structure

```
src/
├── components/          # Vue components
│   ├── chat/           # Chat interface components
│   ├── content/        # Content display components
│   └── layout/         # Layout components
├── stores/             # Pinia stores (state management)
│   ├── app.ts         # Application state
│   ├── chat.ts        # Chat functionality
│   ├── content.ts     # Content management
│   └── knowledge.ts   # Knowledge base & scraping
├── services/           # Business logic services
│   ├── businessScraper.ts    # Website scraping
│   └── contentScheduler.ts  # Automated content updates
├── types/              # TypeScript type definitions
├── data/               # Static configuration
│   └── business.json  # Single business configuration
└── assets/            # Static assets
```

## ⚙️ Configuration

### Business Configuration (`src/data/business.json`)

The main configuration file contains all business-specific settings:

```json
{
  "id": "unique-business-id",
  "name": "Business Name",
  "description": "Business description for AI responses",
  "industry": "Industry category",
  "website": "https://business-website.com",
  "branding": {
    "primaryColor": "#3b82f6",
    "secondaryColor": "#1e40af",
    "logo": "/path/to/logo.svg",
    "font": "Inter"
  },
  "scrapingConfig": {
    "enabled": true,
    "website": "https://business-website.com",
    "selectors": {
      "about": "main, .main-content",
      "services": ".services, .offerings",
      "pricing": ".pricing, .plans",
      "contact": ".contact, footer"
    },
    "contentPriority": ["about", "services", "pricing", "contact"],
    "updateSchedule": "weekly"
  },
  "content": [
    // Static content items (PDFs, videos, forms, etc.)
  ],
  "knowledgeBase": [
    // Predefined Q&A pairs
  ],
  "settings": {
    "welcomeMessage": "Welcome message text",
    "aiPersonality": "professional and helpful",
    "enableVoice": true,
    "enableLeadCapture": true
  }
}
```

### Environment Variables (`.env.local`)

```bash
# API URL for external business configuration (optional)
VITE_API_URL=

# OpenAI API configuration (for future AI integration)
VITE_OPENAI_API_URL=https://api.openai.com/v1
VITE_OPENAI_API_KEY=

# Application settings
VITE_APP_TITLE=AI Business Receptionist
VITE_APP_VERSION=1.0.0
```

## 🔄 Website Scraping

The application can automatically scrape and index content from your business website:

### Configuration

```json
{
  "scrapingConfig": {
    "enabled": true,
    "website": "https://yourbusiness.com",
    "selectors": {
      "about": "main, .hero, .about",
      "services": ".services, .products",
      "pricing": ".pricing, .plans",
      "contact": ".contact, footer"
    },
    "contentPriority": ["about", "services", "pricing", "contact"],
    "updateSchedule": "weekly",
    "excludeSelectors": ["nav", "header", "script", "style"]
  }
}
```

### Update Schedules

- `"manual"` - No automatic updates
- `"daily"` - Update every 24 hours
- `"weekly"` - Update every 7 days
- `"monthly"` - Update every 30 days

## 🎨 Customization

### Branding

Update the business configuration to match your brand:

```json
{
  "branding": {
    "primaryColor": "#your-brand-color",
    "secondaryColor": "#your-secondary-color",
    "logo": "/assets/your-logo.svg",
    "font": "Your-Font-Family"
  }
}
```

### Content Types

The application supports various content types:

- **PDF Documents**: Display PDFs inline
- **Videos**: Embed YouTube or direct video links
- **Images**: Show image galleries
- **Forms**: Lead capture and contact forms
- **Booking Widgets**: Appointment scheduling
- **Website Links**: Direct links to external pages

## 🚢 Deployment

### Docker Deployment (Recommended)

1. **Build Docker Image**
   ```bash
   npm run docker:build
   ```

2. **Run Container**
   ```bash
   npm run docker:run
   ```

3. **Using Docker Compose**
   ```bash
   npm run docker:compose
   ```

### Production Build

1. **Build for Production**
   ```bash
   npm run build:prod
   ```

2. **Serve Static Files**
   Deploy the `dist/` folder to any static hosting service (Nginx, Apache, Netlify, Vercel, etc.)

### VPS Deployment

The project includes complete Docker configuration for VPS deployment with:
- Nginx reverse proxy
- SSL/TLS support
- Health checks
- Logging

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run build:prod   # Build with production optimizations
npm run preview      # Preview production build
npm run type-check   # Run TypeScript type checking
```

### Adding Content Types

1. Create a new component in `src/components/content/`
2. Add the component to the content type map in `ContentPanel.vue`
3. Update the TypeScript types in `src/types/index.ts`

### Extending the Knowledge Base

Add new Q&A pairs to the `knowledgeBase` array in `business.json`:

```json
{
  "id": "kb-new",
  "question": "Your question",
  "answer": "AI response",
  "tags": ["relevant", "keywords"],
  "contentIds": ["related-content-id"],
  "priority": 10
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For support and questions:
- Check the documentation
- Review the configuration examples
- Test with the demo business configuration
- Contact the development team

---

**Note**: This application is designed for single-business deployments. Each client should have their own instance with customized configuration.