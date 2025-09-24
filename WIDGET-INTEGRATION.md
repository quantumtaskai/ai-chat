# AI Receptionist Widget Integration Guide

## Overview

The AI Receptionist Widget is a modern card-style interface that provides intelligent customer support and business information display for any website. Our ultra-simple integration requires just one script tag - no configuration needed.

## Features

- **Modern Card Design**: Professional 180px tall card with 2025 design trends
- **Popup Overlay Expansion**: Smart 80vw×75vh popup with dual-panel layout
- **Content Synchronization**: Content panel updates based on chat conversation
- **Modern Typography**: Enhanced Inter font stack with improved readability
- **Mobile Responsive**: Adapts perfectly to mobile devices with Info/Chat toggle
- **Clean AI Messages**: Streamlined message display without unnecessary labels
- **Auto-Loading**: Appears automatically when page loads

## Ultra-Simple Integration

### Just One Script Tag

Add this single line to your website:

```html
<script src="https://yourhost.com/widget-loader.js"></script>
```

**That's it!** The widget loads automatically with:
- ✅ Auto-detection of host URL
- ✅ Professional card design
- ✅ Smart popup expansion
- ✅ Full feature set enabled
- ✅ Mobile responsive behavior
- ✅ Cross-origin microphone support

### Requirements for Voice Features

For microphone/voice functionality to work on external websites:

- **HTTPS Required**: Voice APIs only work over secure connections
- **User Permission**: Users must grant microphone access when prompted
- **Modern Browser**: Chrome 25+, Firefox 44+, Safari 14.1+, Edge 79+

## How It Works

### Auto-Loading Widget
- **Card appears** in bottom-right corner when page loads
- **180px height** with modern gradient design and lighting effects
- **Pulse indicator** shows the widget is active and ready

### Smart Expansion
- **Click the card** to open full interface in popup overlay
- **80vw × 75vh popup** provides optimal viewing space
- **70% content / 30% chat** split for desktop
- **Mobile toggle** between Info and Chat panels

### Content Intelligence
- **AI responses trigger content** automatically (services → company info, pricing → pricing guide)
- **Seamless synchronization** between chat and content panels
- **Modern typography** throughout for enhanced readability

## Troubleshooting Voice Issues

### Common Problems and Solutions

**Microphone button appears grayed out:**
- ✅ Ensure website is served over HTTPS
- ✅ Check browser permissions for microphone access
- ✅ Try refreshing the page and granting permissions

**"Speech recognition not supported" error:**
- ✅ Verify browser supports Web Speech API
- ✅ Check if website is in secure context (HTTPS)
- ✅ Ensure widget iframe has proper permissions policy

**"Microphone access denied" error:**
- ✅ Click the microphone icon in browser address bar
- ✅ Set permissions to "Allow" for both host site and widget domain
- ✅ Refresh the page and try again

### Testing Voice Features

1. **Test on HTTPS**: Deploy to HTTPS-enabled domain
2. **Grant Permissions**: Allow microphone when browser prompts
3. **Check Console**: Look for voice API status logs
4. **Try Different Browsers**: Test across Chrome, Firefox, Safari

## Analytics Integration

Track widget interactions with your analytics:

```javascript
// Listen for widget events
window.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'quantum-chat') {
    switch (event.data.action) {
      case 'widget-ready':
        console.log('🤖 AI Receptionist ready');
        // Track widget load
        gtag('event', 'widget_loaded');
        break;

      case 'widget-expanded':
        console.log('💬 Chat started');
        // Track user engagement
        gtag('event', 'widget_expanded');
        break;
    }
  }
});
```

## Mobile Experience

The widget automatically adapts to mobile devices:

- **Minimized State**: 160px height card optimized for mobile
- **Expanded State**: Full-screen popup with Info/Chat toggle
- **Navigation**: Simple toggle between panels
- **Gestures**: Tap outside popup to minimize

## Security Considerations

### Domain Whitelist

The widget automatically validates the parent domain for security. Ensure your domain is properly configured:

```javascript
// The widget automatically passes the parent domain
// No additional configuration needed for basic security
```

### Content Security Policy (CSP)

Add these CSP directives to allow the widget:

```
script-src 'self' 'unsafe-inline' https://yourhost.com;
frame-src https://yourhost.com;
connect-src https://yourhost.com;
```

## Performance Optimization

### Lazy Loading

Load the widget only when needed:

```javascript
// Load widget on user interaction
document.addEventListener('scroll', function() {
  // Load after user scrolls
  if (!window.QuantumChat) {
    loadWidget();
  }
}, { once: true });

function loadWidget() {
  const script = document.createElement('script');
  script.src = 'https://yourhost.com/widget-loader.js';
  script.onload = function() {
    QuantumChat.init({ businessId: 'your-business-id' });
  };
  document.head.appendChild(script);
}
```

### Preload Resources

Improve loading performance:

```html
<!-- Preload widget resources -->
<link rel="preload" href="https://yourhost.com/widget-loader.js" as="script">
<link rel="dns-prefetch" href="https://yourhost.com">
```

## Troubleshooting

### Common Issues

1. **Widget doesn't appear**
   - Check console for JavaScript errors
   - Verify the script URL is correct
   - Ensure businessId is valid

2. **Widget appears but doesn't load content**
   - Check network requests in browser dev tools
   - Verify API endpoints are accessible
   - Check CORS configuration

3. **Styling conflicts**
   - Widget uses scoped styles to avoid conflicts
   - Check for CSS that might override widget styles
   - Use browser dev tools to inspect styles

### Debug Mode

Enable debug logging:

```javascript
QuantumChat.init({
  businessId: 'your-business-id',
  debug: true // Enable debug logging
});
```

### Browser Compatibility

Supported browsers:
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

For older browsers, include polyfills:

```html
<script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
```

## Examples

### Any Website Integration

```html
<!-- E-commerce store -->
<script src="https://yourhost.com/widget-loader.js"></script>

<!-- SaaS platform -->
<script src="https://yourhost.com/widget-loader.js"></script>

<!-- Professional services -->
<script src="https://yourhost.com/widget-loader.js"></script>

<!-- Blog or content site -->
<script src="https://yourhost.com/widget-loader.js"></script>
```

**Same simple integration works everywhere!**

## Widget Properties

After loading, the widget provides:

- **Auto-initialization** - Starts immediately when script loads
- **Responsive design** - Adapts to all screen sizes
- **Modern styling** - Professional appearance with 2025 design trends
- **Smart content** - AI-driven content synchronization
- **Event messaging** - PostMessage communication for analytics tracking

## Support

For questions or issues:

1. Check this documentation
2. Review the demo at `/demo.html`
3. Open an issue in our repository
4. Contact support at support@yourcompany.com

## Changelog

### v3.0.0 (Ultra-Simple)
- **Ultra-simple integration**: One script tag, zero configuration
- **Modern card design**: 180px height with 2025 design trends
- **Popup overlay expansion**: 80vw×75vh smart popup
- **Content synchronization**: AI responses trigger relevant content
- **Enhanced typography**: Modern Inter font stack
- **Clean messaging**: Streamlined AI message display
- **Auto-loading**: Widget appears automatically on page load