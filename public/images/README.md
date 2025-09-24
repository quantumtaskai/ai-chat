# Template Images Directory

This directory contains placeholder images for the AI Chat Template. Replace these with your own business assets.

## Required Images

### Company Branding
- `company/logo.png` - Your company logo (recommended: 200x60px, PNG with transparency)
- `company/favicon.ico` - Website favicon (16x16, 32x32, 48x48px ICO format)

### Optional Product Images
- `products/` - Directory for product images referenced in your content
- Use any web-friendly format (PNG, JPG, WebP)
- Recommended max width: 800px for optimal loading

## Image Guidelines

### Logo Requirements
- Format: PNG with transparent background preferred
- Size: 200x60px recommended (adjust in CSS if needed)
- Should be readable on both light and dark backgrounds
- Keep file size under 100KB for fast loading

### Favicon
- Use https://favicon.io/ to generate from your logo
- Include multiple sizes: 16x16, 32x32, 48x48px
- Place `favicon.ico` in the root `public/` directory

### Product Images
- Max width: 800px
- Optimize for web (use tools like TinyPNG)
- Use descriptive filenames
- Reference in your `business.json` content sections

## Updating Images

1. Replace placeholder files with your actual images
2. Keep the same filenames or update references in `src/data/business.json`
3. Test that images load correctly in both light and dark themes
4. Optimize file sizes for web performance

## Image Optimization Tools

- [TinyPNG](https://tinypng.com/) - PNG/JPG compression
- [Favicon.io](https://favicon.io/) - Favicon generator
- [ImageOptim](https://imageoptim.com/) - Mac image optimization
- [Squoosh](https://squoosh.app/) - Web-based image optimization