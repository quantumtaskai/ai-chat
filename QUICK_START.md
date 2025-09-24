# Quick Start Guide - Enhanced AI Receptionist

## 1. Clone & Setup
```bash
# Clone to new location
git clone https://github.com/quantumtaskai/quantumchat.git ai-receptionist-enhanced
cd ai-receptionist-enhanced

# Install dependencies
npm install

# Install new AI/scraping packages
npm install playwright cheerio openai @anthropic-ai/sdk
```

## 2. Environment Setup
```bash
# Copy existing environment
cp .env .env.backup

# Add new environment variables
echo "VITE_OPENAI_API_KEY=your_openai_key_here" >> .env
echo "VITE_AI_PROVIDER=openai" >> .env
echo "VITE_SCRAPING_ENABLED=true" >> .env
```

## 3. Test Current System
```bash
# Start development server
npm run dev

# Test widget on demo page
open http://localhost:3000/demo.html

# Verify everything works before modifications
```

## 4. Development Workflow
1. **Create feature branch**: `git checkout -b feature/ai-enhancement`
2. **Follow ENHANCEMENT_TASKS.md** checklist
3. **Test frequently**: After each major change
4. **Commit often**: Small, focused commits
5. **Keep backup**: Original system as fallback

## 5. File Structure for New Features
```
src/
├── services/
│   ├── advancedScraper.ts    # Enhanced scraping
│   ├── aiService.ts          # AI integration
│   └── contentProcessor.ts   # Content analysis
├── components/admin/         # Admin dashboard
└── types/ai.ts              # AI-specific types
```

## 6. Quick Commands
```bash
# Test scraping
npm run test:scraping

# Test AI integration
npm run test:ai

# Build for production
npm run build

# Deploy to staging
npm run deploy:staging
```

## Need Help?
- Check `ENHANCEMENT_TASKS.md` for detailed checklist
- Current working system is always available as fallback
- Each phase builds on the previous one
- Test each feature before moving to next phase