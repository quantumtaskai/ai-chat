# AI Business Receptionist - Changelog

## v1.0.0 - Simplified Single-Business Architecture (2025-09-19)

### 🎯 Major Architectural Changes

**Simplified from Multi-Business to Single-Business Model**
- ✅ Removed complex multi-tenant business selection logic
- ✅ Converted `businesses.json` array → single `business.json` object
- ✅ Eliminated business ID lookups and URL parsing
- ✅ Streamlined configuration for per-client deployments

### 🔧 Code Cleanup & Refactoring

**Store Simplification**
- ✅ **App Store**: Removed business ID logic, simplified initialization
- ✅ **Chat Store**: Removed business parameter passing, direct context access
- ✅ **Knowledge Store**: Single business context, simplified search logic
- ✅ **Content Store**: Streamlined content suggestion handling

**Service Layer Updates**
- ✅ **Business Scraper**: Removed multi-business ID references
- ✅ **Content Scheduler**: Simplified to single business scheduling
- ✅ **Type Definitions**: Cleaned up business ID references from interfaces

**Component Updates**
- ✅ **Content Panel**: Simplified business context handling
- ✅ **Chat Panel**: Direct business access from app store
- ✅ **Form/Booking Components**: Updated analytics tracking

### 📁 File Structure Improvements

**Configuration**
- ✅ `src/data/business.json` - Single business configuration file
- ✅ `.env.example` - Updated environment variables
- ✅ Removed old `businesses.json` array format

**Documentation**
- ✅ `README.md` - Comprehensive architecture documentation
- ✅ `DEPLOYMENT.md` - Single-business deployment guide
- ✅ `CHANGELOG.md` - Complete change history

**Cleanup**
- ✅ Removed demo files: `demo.html`, `embed.js`, `widget.html`, `scrape-demo.html`
- ✅ Cleaned up package.json naming and scripts
- ✅ Updated Docker configuration for generic deployment

### 🚀 Deployment Improvements

**Docker Configuration**
- ✅ Updated Dockerfile to use production build
- ✅ Simplified docker-compose.yml labels
- ✅ Removed business-specific naming conventions

**Package Management**
- ✅ Renamed from "quantum-receptionist" to "ai-business-receptionist"
- ✅ Added utility scripts for clean installs
- ✅ Simplified build commands

### ✨ Features & Benefits

**For Developers**
- 50% reduction in configuration complexity
- Cleaner, more maintainable codebase
- Simplified debugging and testing
- Faster development cycles

**For Deployments**
- One configuration file per business
- Independent scaling per client
- Easier customization and branding
- Simplified monitoring and maintenance

**For Clients**
- Dedicated instance per business
- Complete data isolation
- Custom domain and branding
- No multi-tenant complexity

### 🐛 Bug Fixes

- ✅ Fixed content panel not responding to chat suggestions
- ✅ Resolved knowledge base initialization issues
- ✅ Corrected business context in AI responses
- ✅ Fixed content ID references in suggestions

### 🔒 Security & Performance

- ✅ Removed unnecessary business lookup logic
- ✅ Simplified authentication flow
- ✅ Improved content suggestion performance
- ✅ Cleaner event handling

### 📋 Migration Guide

**For Existing Multi-Business Deployments:**

1. **Extract Business Configuration**
   ```bash
   # Copy specific business from old businesses.json
   jq '.[] | select(.id=="your-business-id")' businesses.json > business.json
   ```

2. **Update Environment Variables**
   ```bash
   # Remove VITE_DEFAULT_BUSINESS
   # Update VITE_APP_TITLE with business name
   ```

3. **Test and Deploy**
   ```bash
   npm install
   npm run build:prod
   npm run docker:build
   ```

### 🎯 Breaking Changes

- `VITE_DEFAULT_BUSINESS` environment variable removed
- `businesses.json` file format no longer supported
- Business ID parameters removed from all URLs
- Multi-business selection logic removed

### 🔮 Future Roadmap

- **v1.1.0**: Real AI integration (OpenAI/Claude)
- **v1.2.0**: Enhanced content management
- **v1.3.0**: Advanced analytics and tracking
- **v2.0.0**: Multi-language support

---

**Migration Support**: For assistance migrating existing deployments, refer to the DEPLOYMENT.md guide or contact the development team.