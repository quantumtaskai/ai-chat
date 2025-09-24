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

  // Compressed modular components for optimal bundle size
  const W = {
    // Optimized SVG icon - compressed path
    i: s => `<svg width="${s||20}" height="${s||20}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>`,

    // Compressed component builder
    c: n => `<div id="quantum-chat-card" class="qc-card" role="button" tabindex="0" aria-label="Open AI chat assistant"><div class="qc-content"><div class="qc-icon" aria-hidden="true">${W.i()}</div><div class="qc-text"><div class="qc-title">${n||'AI Assistant'}</div><div class="qc-subtitle">Need help? Click to chat</div></div><div class="qc-status" aria-hidden="true"></div></div></div>`
  };

  // 2025 Flat Design System - minimal shadows, modern morphism
  const S = `.qc-card{position:fixed;bottom:1.25rem;right:1.25rem;width:17rem;height:10rem;background:#2563eb;border-radius:1.25rem;padding:1.5rem;box-shadow:0 2px 4px rgba(0,0,0,.08);cursor:pointer;display:flex;align-items:center;justify-content:center;overflow:hidden;z-index:999999;font-family:system-ui,sans-serif;transition:transform .2s cubic-bezier(.4,0,.2,1),box-shadow .2s ease;transform:translate3d(0,0,0);user-select:none;will-change:transform;contain:layout style}
.qc-content{display:flex;flex-direction:column;align-items:center;gap:1rem;width:100%;position:relative;z-index:1}
.qc-icon{width:3rem;height:3rem;background:rgba(255,255,255,.15);border-radius:1rem;display:flex;align-items:center;justify-content:center;border:1px solid rgba(255,255,255,.2);transition:transform .2s ease,background-color .2s ease;transform:translate3d(0,0,0);color:#fff;will-change:transform}
.qc-text{color:#fff;text-align:center;line-height:1.4}
.qc-title{font-size:1rem;font-weight:700;margin-bottom:.25rem;letter-spacing:-.01em}
.qc-subtitle{font-size:.8125rem;opacity:.95;font-weight:600;letter-spacing:.005em}
.qc-status{position:absolute;top:-.5rem;right:-.5rem;width:.75rem;height:.75rem;background:#10b981;border-radius:50%;border:2px solid rgba(255,255,255,.4);animation:qc-pulse 3s infinite;z-index:2;will-change:transform}
.qc-card::before{content:'';position:absolute;inset:0;background:rgba(255,255,255,.08);border-radius:1.25rem;pointer-events:none;z-index:0}
.qc-card:hover{transform:translateY(-1px) translate3d(0,0,0);box-shadow:0 4px 8px rgba(0,0,0,.12)}
.qc-card:hover .qc-icon{transform:scale(1.03) translate3d(0,0,0);background:rgba(255,255,255,.22)}
.qc-card:active{transform:translateY(-1px) scale(.98) translate3d(0,0,0)}
.qc-card:focus-visible{outline:2px solid #eff6ff;outline-offset:2px}
@media(max-width:30rem){.qc-card{width:15rem;bottom:1rem;right:1rem;padding:1.25rem}.qc-icon{width:2.5rem;height:2.5rem}.qc-title{font-size:.875rem}.qc-subtitle{font-size:.6875rem}}
@media(prefers-reduced-motion:reduce){.qc-card,.qc-card *{animation-duration:.01ms!important;transition-duration:.01ms!important}}
@media(prefers-contrast:high){.qc-card{border:2px solid #fff}}
@media print{.qc-card{display:none!important}}
@keyframes qc-pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.05);opacity:.95}}
.qc-card.paused *{animation-play-state:paused!important}`;

  // Optimized widget factory
  function getCardHTML(name) {
    return W.c(name) + `<style>${S}</style>`;
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

    // Add accessible event handlers with debouncing
    let clickTimeout;

    function handleActivation() {
      clearTimeout(clickTimeout);
      clickTimeout = setTimeout(() => openPopup(hostUrl), 100);
    }

    // Click handler
    card.addEventListener('click', handleActivation);

    // Keyboard handler for accessibility
    card.addEventListener('keydown', function(event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleActivation();
      }
    });

    console.log('✨ AI Receptionist v4.1.0-flat2025 loaded with minimal shadows, flat morphism, and bold typography');
  }

  // Flat design popup function - minimal animations
  function openPopup(hostUrl) {
    // Subtle fade animation for card
    const card = document.getElementById('quantum-chat-card');
    card.style.transform = 'scale(0.98)';
    card.style.opacity = '0';

    setTimeout(() => {
      card.style.display = 'none';
    }, 150);

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
      transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      background: #f8fafc;
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

        // Subtle show animation for card
        card.style.display = 'flex';
        card.style.opacity = '0';
        card.style.transform = 'scale(0.95)';

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
    version: '4.1.0-flat2025',
    loaded: true,
    showCard: function() {
      const card = document.getElementById('quantum-chat-card');
      if (card) {
        card.style.display = 'flex';
        card.style.opacity = '0';
        card.style.transform = 'scale(0.95)';
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
        card.style.transform = 'scale(0.98)';
        setTimeout(() => {
          card.style.display = 'none';
        }, 150);
      }
    }
  };

})();