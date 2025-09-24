# 🤖 AI Chat Template

> **Professional AI Chat Template with Modern 2025 UI/UX**
> Ready-to-deploy AI chat system with embeddable widget for any business website.

![AI Chat Template](https://img.shields.io/badge/Template-Ready-brightgreen) ![Vue 3](https://img.shields.io/badge/Vue-3.x-4FC08D) ![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-06B6D4)

## ✨ Features

### 🎨 **Modern 2025 Design**
- Clean, flat UI design following 2025 standards
- Minimal shadows and gradients
- Responsive design for all devices
- Professional color scheme

### 💬 **Real AI Intelligence**
- **OpenAI GPT-4 Integration** - Professional AI responses, not basic pattern matching
- **Business Context Awareness** - AI knows your company, industry, and services
- **Conversation Memory** - Maintains context across entire conversations
- **Smart Content Suggestions** - Suggests forms, booking, documents intelligently
- **Industry Optimization** - Specialized for restaurants, healthcare, retail, etc.
- **Graceful Fallbacks** - Works even when OpenAI API is unavailable

### 🔧 **Easy Customization**
- **5-minute setup** for basic configuration
- Complete branding control (colors, logo, fonts)
- Industry-specific templates
- No coding required for basic use

### 📱 **Embeddable Widget**
- Single script tag integration
- Works on any website
- Mobile-optimized
- Cross-origin support

### 📋 **Business Features**
- Contact forms
- Appointment booking
- Content management
- Knowledge base system
- Live website scraping

### 🚀 **Deployment Ready**
- Docker support
- Vercel/Netlify ready
- VPS deployment scripts
- Environment configuration

## 🚀 Quick Start

### 1. **Clone Template**
```bash
# Use GitHub template (recommended)
# Click "Use this template" button above

# Or clone directly
git clone https://github.com/YOUR-USERNAME/ai-chat-template.git my-business-chat
cd my-business-chat
```

### 2. **Install Dependencies**
```bash
npm install
```

### 3. **Environment Setup**
```bash
# Copy environment template
cp .env.example .env

# Add your OpenAI API key to .env
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

### 4. **Business Configuration**
Edit `src/data/business.json` with your business information:
```json
{
  "name": "Your Business Name",
  "description": "Your business description",
  "website": "https://your-website.com",
  "branding": {
    "primaryColor": "#your-brand-color"
  }
}
```

### 5. **Run Development Server**
```bash
npm run dev
```
Visit `http://localhost:3000` to see your chat interface.

### 6. **Deploy to Production**
```bash
npm run build
# Deploy the dist/ folder to your hosting service
```

### 7. **Embed on Your Website**
Add this script tag to any webpage:
```html
<script src="https://your-domain.com/widget-loader.js"></script>
```

## 📖 Detailed Setup Guide

### 🎯 **Customization Levels**

#### **Level 1: Basic (5 minutes)**
- Get OpenAI API key from [OpenAI Platform](https://platform.openai.com/api-keys)
- Update business name and description
- Add contact information
- Test with `npm run test:openai`

#### **Level 2: Branding (15 minutes)**
- Upload your logo to `public/images/company/logo.png`
- Update brand colors in `business.json`
- Customize welcome message

#### **Level 3: Content (30 minutes)**
- Add knowledge base questions & answers
- Configure contact forms
- Set up appointment booking

#### **Level 4: Advanced (1 hour)**
- Custom integrations
- Multi-language support
- Advanced styling

### 🎨 **Branding Customization**

Update colors in `src/data/business.json`:
```json
{
  "branding": {
    "primaryColor": "#3b82f6",    // Main brand color
    "secondaryColor": "#1e40af",  // Secondary color
    "accentColor": "#f59e0b",     // Accent color
    "logo": "/images/company/logo.png",
    "font": "Inter"               // Google Font name
  }
}
```

## 🚀 Deployment Options

### **Vercel (Recommended)**
1. Push to GitHub
2. Connect to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### **Netlify**
1. Push to GitHub
2. Connect to Netlify
3. Build command: `npm run build`
4. Publish directory: `dist`

### **Docker**
```bash
# Build container
npm run docker:build

# Run container
npm run docker:run
```

## 🔧 Configuration

### **Required Environment Variables**
```env
VITE_OPENAI_API_KEY=your_openai_api_key_here  # Required for AI chat
```

### **Optional Environment Variables**
```env
HEYGEN_API_KEY=your_heygen_key          # For avatar features
VITE_API_URL=https://api.yourdomain.com # External config API
```

## 📱 Widget Integration

### **Basic Integration**
```html
<!-- Add before closing </body> tag -->
<script src="https://your-domain.com/widget-loader.js"></script>
```

## 🛠 Development

### **Development Commands**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run type-check   # TypeScript validation
```

## 📄 License

MIT License - Use freely for personal and commercial projects.

---

**Ready to launch your AI chat in 5 minutes?** 🚀

*Built with ❤️ using Vue 3, TypeScript, and Modern 2025 UI/UX Design Standards*