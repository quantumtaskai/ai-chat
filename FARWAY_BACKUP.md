# Far Way Company - Integration Backup

**Created**: 2025-09-22
**Purpose**: Preserve all Far Way Company specific data for integration into new chat system

---

## 🏢 Business Configuration

### Company Details
```json
{
  "id": "farway-company",
  "name": "FAR WAY®",
  "description": "Global FMCG import, export, and distribution company established in 2001. Trusted leader operating in 40+ countries with 500+ global brands, specializing in beverages, confectionaries, snacks, cleaning & household, personal care, and beauty equipment.",
  "industry": "FMCG Import/Export/Distribution",
  "website": "https://farwaycompany.com"
}
```

### Branding & Styling
```json
{
  "branding": {
    "primaryColor": "#4260C6",
    "secondaryColor": "#1A2754",
    "accentColor": "#FECD29",
    "logo": "/logos/farway-logo.svg",
    "font": "Inter"
  }
}
```

### Contact Information
```json
{
  "contactInfo": {
    "whatsapp": "+971 52 76 76 100",
    "whatsappBeauty": "+971 50 67 62 217",
    "email": "contact@farwaycompany.com",
    "phone": "+971 42 289501",
    "address": "Office No. 507, New Century City Tower, Deira, Dubai, UAE"
  }
}
```

---

## 💼 Trader Network Data

### Summary
- **Total Traders**: 100
- **Countries**: USA, Canada, UK, Germany, France, Japan, China, India, Australia, Brazil
- **Product Categories**: 10 categories

### Product Categories
1. **Automobiles** - 10 traders
2. **Chemicals** - 10 traders
3. **Electronics** - 10 traders
4. **Fruits & Vegetables** - 10 traders
5. **Lumber & Paper** - 10 traders
6. **Machinery** - 10 traders
7. **Pharmaceuticals** - 10 traders
8. **Seafood** - 10 traders
9. **Spices** - 13 traders ⭐ (Key for testing)
10. **Textiles** - 10 traders

### Trader Data Structure
```json
{
  "id": 1,
  "name": "Trader Name",
  "country": "Country",
  "type": "Importer|Exporter|Both",
  "products": "Product Category",
  "email": "contact@email.com",
  "phone": "+XX-XXXXX-XXXX",
  "website": "www.website.com"
}
```

### Sample Spice Traders (for testing)
```json
[
  {
    "id": 4,
    "name": "Spices Traders 4",
    "country": "UK",
    "type": "Importer",
    "products": "Spices",
    "email": "contact4@spicestraders4.com",
    "phone": "+44-81234-5678",
    "website": "www.spicestraders4.com"
  }
]
```

---

## 🧠 Knowledge Base (16 Q&A Items)

### Key Knowledge Entries
1. **Services** - "What services does Far Way Company offer?"
2. **Products** - "What product categories do you handle?"
3. **Traders** - "How can I connect with traders?"
4. **Countries** - "What countries do you operate in?"
5. **Contact** - "How can I contact Far Way Company?"
6. **Certifications** - "Are you certified?" (HACCP)
7. **Experience** - "How long have you been in business?" (2001)
8. **Pricing** - "What are your pricing details?"
9. **Quality** - "How do you ensure product quality?"
10. **Private Label** - "Do you provide private label services?"

### Critical Knowledge Entry (Causing Issues)
```json
{
  "id": "kb-3",
  "question": "How can I connect with traders?",
  "answer": "We have an extensive network of verified traders across multiple industries and countries. I can help you find the right traders based on your product needs, location, and whether you're looking to import or export.",
  "tags": ["traders", "network", "connections", "import", "export"],
  "priority": 9
}
```
⚠️ **Note**: This generic trader response was overriding specific product searches

---

## ⚙️ Key Functionality Requirements

### 1. Spice Trader Search
**Test Queries**:
- "spice trader"
- "find spice trader"
- "find spice importer"
- "spice exporters"

**Expected Behavior**:
- Find specific spice traders from data
- Update left panel to show filtered results
- Provide trader names and contact details

### 2. Dynamic Left Panel
**Requirements**:
- Default: Show all traders (first 20)
- Search: Filter traders based on chat queries
- Events: Listen for `search-traders` and `highlight-traders` events
- Mobile: Toggle between chat and traders view

### 3. Chat Intelligence
**Pattern Matching**:
- Product-specific searches (spices, chemicals, etc.)
- Country-specific searches (USA, China, etc.)
- Generic trader inquiries
- Business information (services, pricing, contact)

---

## 🔧 Integration Instructions

### 1. Business Configuration File
- Replace/update main business config with Far Way data
- Ensure branding colors are applied to UI components
- Set welcome message and AI personality

### 2. Trader Data Integration
- Import traders.json with 100 trader records
- Implement search/filter functionality
- Add trader recommendation engine

### 3. Chat System Requirements
**Critical**: Product-specific searches must take priority over generic knowledge base responses

**Flow Should Be**:
1. Check for specific product keywords first
2. Search trader database
3. Update left panel
4. Fallback to knowledge base only if no product match

### 4. Event System
- Emit `search-traders` events for panel updates
- Emit `highlight-traders` for specific recommendations
- Listen for events in TradersPanel component

---

## 🎨 UI/Styling Notes

### Color Scheme
- **Primary**: #4260C6 (Far Way Blue)
- **Secondary**: #1A2754 (Dark Blue)
- **Accent**: #FECD29 (Yellow)

### Components to Update
- Header gradient background
- Button styling
- Card components
- Mobile toggle buttons

---

## 🧪 Testing Checklist

### Essential Tests
- [ ] "spice trader" → Shows spice traders in left panel
- [ ] "china traders" → Shows traders from China
- [ ] "contact" → Shows Far Way contact info
- [ ] "services" → Shows FMCG services description
- [ ] "pricing" → Shows pricing information
- [ ] Mobile view toggle works
- [ ] Trader contact actions work

### Known Issues to Avoid
- Generic knowledge base overriding specific searches
- Left panel not updating on chat interactions
- Old cached data persisting in localStorage
- Condition order causing wrong response paths

---

**Files to Preserve**:
- `/src/data/business.json` - Complete business configuration
- `/src/data/traders.json` - All 100 trader records
- Branding/styling configurations