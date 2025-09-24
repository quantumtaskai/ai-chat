/**
 * AI Receptionist Widget - Card on Page, Popup in Iframe
 * Perfect integration with zero iframe issues for the card
 */

(function() {
  'use strict';

  // Only create widget once
  if (window.QuantumChatLoaded) return;
  window.QuantumChatLoaded = true;

  // Auto-detect host URL
  function getHostUrl() {
    const scripts = document.getElementsByTagName('script');
    for (let script of scripts) {
      if (script.src && script.src.includes('widget-loader.js')) {
        const url = new URL(script.src);
        return `${url.protocol}//${url.host}`;
      }
    }
    return window.location.origin;
  }

  // Add resource hints for better performance
  function addResourceHints(hostUrl) {
    const head = document.head;

    // Preconnect to widget host for faster iframe loading
    if (!document.querySelector(`link[href="${hostUrl}"]`)) {
      const preconnect = document.createElement('link');
      preconnect.rel = 'preconnect';
      preconnect.href = hostUrl;
      preconnect.crossOrigin = 'anonymous';
      head.appendChild(preconnect);

      // DNS prefetch as fallback for older browsers
      const dnsPrefetch = document.createElement('link');
      dnsPrefetch.rel = 'dns-prefetch';
      dnsPrefetch.href = hostUrl;
      head.appendChild(dnsPrefetch);
    }
  }

  // Optimized card HTML with compressed styles
  function getCardHTML(name) {
    const s1 = 'position:fixed;bottom:20px;right:20px;width:280px;height:170px;background:linear-gradient(135deg,#3b82f6,#1e40af,#7c3aed);border-radius:20px;padding:24px;box-shadow:0 6px 12px rgba(59,130,246,.08);cursor:pointer;display:flex;align-items:center;justify-content:center;overflow:hidden;z-index:999999;font-family:Inter,-apple-system,sans-serif;transition:transform .15s ease;will-change:transform;-webkit-font-smoothing:antialiased;transform:translate3d(0,0,0)';
    const s2 = 'display:flex;flex-direction:column;align-items:center;gap:16px;width:100%;position:relative;z-index:1';
    const s3 = 'width:48px;height:48px;background:rgba(255,255,255,.2);border-radius:16px;display:flex;align-items:center;justify-content:center;border:1px solid rgba(255,255,255,.3);transition:transform .15s ease;will-change:transform;transform:translate3d(0,0,0)';
    const s4 = 'color:#fff;text-align:center;line-height:1.4';
    const s5 = 'font-size:15px;font-weight:600;margin-bottom:4px;text-shadow:0 1px 2px rgba(0,0,0,.1)';
    const s6 = 'font-size:12px;opacity:.92;font-weight:450';
    const s7 = 'position:absolute;top:-8px;right:-8px;width:12px;height:12px;background:linear-gradient(135deg,#10b981,#34d399);border-radius:50%;border:2px solid rgba(255,255,255,.3);animation:modernPulse 3s infinite;box-shadow:0 0 8px rgba(16,185,129,.2);z-index:2';
    return `<div id="quantum-chat-card" style="${s1}"><div style="${s2}"><div style="${s3}"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg></div><div style="${s4}"><div style="${s5}">${name||'AI Assistant'}</div><div style="${s6}">Need help? Click to chat</div></div><div style="${s7}"></div></div></div>

<style>#quantum-chat-card::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,.1),transparent 50%);border-radius:20px;pointer-events:none;z-index:0}#quantum-chat-card:hover{transform:translateY(-1px);box-shadow:0 6px 12px rgba(59,130,246,.1)}#quantum-chat-card:hover>div>div:first-child{transform:scale(1.02)}#quantum-chat-card:active{transform:translateY(0)}@keyframes modernPulse{0%,100%{transform:scale(1);opacity:1;box-shadow:0 0 6px rgba(16,185,129,.15)}50%{transform:scale(1.02);opacity:.95;box-shadow:0 0 10px rgba(16,185,129,.25)}}@media(prefers-reduced-motion:reduce){#quantum-chat-card,#quantum-chat-card *{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}}#quantum-chat-card.paused *{animation-play-state:paused!important}</style>`;
  }

  // Create simple card that opens iframe popup
  function createCard() {
    const hostUrl = getHostUrl();

    // Add resource hints for faster iframe loading
    addResourceHints(hostUrl);

    // Insert optimized card HTML
    document.body.insertAdjacentHTML('beforeend', getCardHTML('QuantumTask AI'));

    const card = document.getElementById('quantum-chat-card');

    // Intersection Observer for performance optimization
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Widget is visible, resume animations
            card.classList.remove('paused');
          } else {
            // Widget is not visible, pause animations to save resources
            card.classList.add('paused');
          }
        });
      }, {
        threshold: 0.1, // Trigger when 10% of widget is visible
        rootMargin: '50px' // Start observing 50px before widget enters viewport
      });

      observer.observe(card);
    }

    // Page Visibility API for tab focus optimization
    if ('visibilitychange' in document) {
      document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
          card.classList.add('paused');
        } else {
          card.classList.remove('paused');
        }
      });
    }

    // Add debounced click handler to prevent double-clicks
    let clickTimeout;
    card.addEventListener('click', function() {
      clearTimeout(clickTimeout);
      clickTimeout = setTimeout(() => openPopup(hostUrl), 100);
    });

    console.log('✨ AI Receptionist card loaded with performance optimizations');
  }

  // Simple popup function
  function openPopup(hostUrl) {
    // Smooth hide animation for card
    const card = document.getElementById('quantum-chat-card');
    card.style.transform = 'scale(0.95)';
    card.style.opacity = '0';

    setTimeout(() => {
      card.style.display = 'none';
    }, 200);

    // Create iframe popup with microphone permissions and loading optimization
    const iframe = document.createElement('iframe');
    iframe.id = 'quantum-chat-popup';
    iframe.src = `${hostUrl}/widget?mode=simple&auto=true`;
    iframe.allow = 'microphone; camera; geolocation; encrypted-media; autoplay; fullscreen';
    iframe.loading = 'eager';
    iframe.setAttribute('importance', 'high'); // Resource hint for priority loading
    iframe.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      border: none;
      z-index: 999999;
      opacity: 0;
      transition: opacity 0.3s ease;
      background: linear-gradient(135deg, #f8fafc, #e2e8f0);
    `;

    // Enhanced loading with error handling
    let loadTimeout;
    iframe.onload = () => {
      clearTimeout(loadTimeout);
      iframe.style.opacity = '1';
      iframe.style.background = 'transparent';
    };

    // Error handling for failed iframe loads
    iframe.onerror = () => {
      clearTimeout(loadTimeout);
      console.warn('Widget iframe failed to load');
      iframe.style.opacity = '1';
      iframe.style.background = '#f8fafc';
    };

    // Timeout fallback for slow connections
    loadTimeout = setTimeout(() => {
      if (iframe.style.opacity === '0') {
        iframe.style.opacity = '1';
        iframe.style.background = 'transparent';
      }
    }, 3000);

    document.body.appendChild(iframe);

    // Handle close message with smooth animation
    const messageHandler = function(event) {
      if (event.data?.type === 'quantum-chat' && event.data?.action === 'widget-minimized') {
        // Cleanup resources
        clearTimeout(loadTimeout);
        iframe.remove();
        window.removeEventListener('message', messageHandler);

        // Smooth show animation for card
        card.style.display = 'flex';
        card.style.opacity = '0';
        card.style.transform = 'scale(0.8)';

        requestAnimationFrame(() => {
          card.style.opacity = '1';
          card.style.transform = 'scale(1)';
        });
      }
    };

    window.addEventListener('message', messageHandler);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createCard);
  } else {
    createCard();
  }

  // Global reference
  window.QuantumChat = {
    version: '3.0.0-hybrid',
    loaded: true,
    showCard: function() {
      const card = document.getElementById('quantum-chat-card');
      if (card) {
        card.style.display = 'flex';
        card.style.opacity = '0';
        card.style.transform = 'scale(0.8)';
        requestAnimationFrame(() => {
          card.style.opacity = '1';
          card.style.transform = 'scale(1)';
        });
      }
    },
    hideCard: function() {
      const card = document.getElementById('quantum-chat-card');
      if (card) {
        card.style.opacity = '0';
        card.style.transform = 'scale(0.95)';
        setTimeout(() => {
          card.style.display = 'none';
        }, 200);
      }
    }
  };

})();