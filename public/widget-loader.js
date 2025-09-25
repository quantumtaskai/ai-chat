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

  // 2025 Optimized Design System - GPU-efficient, reduced layer count
  const S = `.qc-card{position:fixed;bottom:1.25rem;right:1.25rem;width:17rem;height:10rem;background:#2563eb;border-radius:1.25rem;padding:1.5rem;box-shadow:0 2px 4px rgba(0,0,0,.08);cursor:pointer;display:flex;align-items:center;justify-content:center;overflow:hidden;z-index:999999;font-family:system-ui,sans-serif;transition:transform .15s ease-out,box-shadow .15s ease-out;user-select:none;contain:layout style size;backface-visibility:hidden}
.qc-content{display:flex;flex-direction:column;align-items:center;gap:1rem;width:100%;position:relative;z-index:1}
.qc-icon{width:3rem;height:3rem;background:rgba(255,255,255,.15);border-radius:1rem;display:flex;align-items:center;justify-content:center;border:1px solid rgba(255,255,255,.2);transition:transform .15s ease-out,background-color .15s ease-out;color:#fff;backface-visibility:hidden}
.qc-text{color:#fff;text-align:center;line-height:1.4}
.qc-title{font-size:1rem;font-weight:700;margin-bottom:.25rem;letter-spacing:-.01em}
.qc-subtitle{font-size:.8125rem;opacity:.95;font-weight:600;letter-spacing:.005em}
.qc-status{position:absolute;top:-.5rem;right:-.5rem;width:.75rem;height:.75rem;background:#10b981;border-radius:50%;border:2px solid rgba(255,255,255,.4);animation:qc-pulse 2s infinite;z-index:2}
.qc-card::before{content:'';position:absolute;inset:0;background:rgba(255,255,255,.08);border-radius:1.25rem;pointer-events:none;z-index:0}
.qc-card:hover{transform:translateY(-1px);box-shadow:0 4px 8px rgba(0,0,0,.12)}
.qc-card:hover .qc-icon{transform:scale(1.03);background:rgba(255,255,255,.22)}
.qc-card:active{transform:translateY(-1px) scale(.98)}
.qc-card:focus-visible{outline:2px solid #eff6ff;outline-offset:2px}
.qc-card.widget-closing{opacity:0;transform:scale(.98);transition:opacity .15s ease-out,transform .15s ease-out}
.qc-card.widget-opening{opacity:0;transform:scale(.95)}
.qc-card.widget-opening:not(.paused){opacity:1;transform:scale(1);transition:opacity .2s ease-out,transform .2s ease-out}
@media(max-width:30rem){.qc-card{width:15rem;bottom:1rem;right:1rem;padding:1.25rem}.qc-icon{width:2.5rem;height:2.5rem}.qc-title{font-size:.875rem}.qc-subtitle{font-size:.6875rem}}
@media(prefers-reduced-motion:reduce){.qc-card,.qc-card *{animation-duration:.01ms!important;transition-duration:.01ms!important}}
@media(prefers-contrast:high){.qc-card{border:2px solid #fff}}
@media print{.qc-card{display:none!important}}
@keyframes qc-pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.03);opacity:.9}}
.qc-card.paused .qc-status{animation-play-state:paused!important}
.qc-card.paused{will-change:auto}
.qc-card:not(.paused){will-change:transform}`;

  // Optimized widget factory
  function getCardHTML(name) {
    return W.c(name) + `<style>${S}</style>`;
  }

  // Global resource management
  let widgetState = {
    observers: [],
    intervals: [],
    timeouts: [],
    eventHandlers: [],
    isPopupActive: false
  };

  // Cleanup function for resource management
  function cleanupResources() {
    // Clear all observers
    widgetState.observers.forEach(observer => observer.disconnect());
    widgetState.observers = [];

    // Clear all intervals and timeouts
    widgetState.intervals.forEach(clearInterval);
    widgetState.timeouts.forEach(clearTimeout);
    widgetState.intervals = [];
    widgetState.timeouts = [];

    // Remove event handlers
    widgetState.eventHandlers.forEach(({element, event, handler}) => {
      element.removeEventListener(event, handler);
    });
    widgetState.eventHandlers = [];
  }

  // Enhanced resource management
  function pauseWidgetResources() {
    const card = document.getElementById('quantum-chat-card');
    if (card) {
      card.classList.add('paused');
      card.style.willChange = 'auto'; // Release GPU resources
    }
    widgetState.isPopupActive = true;
  }

  function resumeWidgetResources() {
    const card = document.getElementById('quantum-chat-card');
    if (card) {
      card.classList.remove('paused');
      card.style.willChange = 'transform'; // Re-enable GPU optimization
    }
    widgetState.isPopupActive = false;
  }

  // Create simple card that opens iframe popup
  function createCard() {
    const hostUrl = getHostUrl();

    // Add resource hints for faster iframe loading
    addResourceHints(hostUrl);

    // Insert optimized card HTML
    document.body.insertAdjacentHTML('beforeend', getCardHTML('QuantumTask AI'));

    const card = document.getElementById('quantum-chat-card');

    // Optimized Intersection Observer for performance
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (!widgetState.isPopupActive) { // Only manage visibility when popup is not active
            if (entry.isIntersecting) {
              card.classList.remove('paused');
              card.style.willChange = 'transform';
            } else {
              card.classList.add('paused');
              card.style.willChange = 'auto'; // Save GPU resources
            }
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '50px'
      });

      observer.observe(card);
      widgetState.observers.push(observer);
    }

    // Optimized Page Visibility API
    const visibilityHandler = function() {
      if (!widgetState.isPopupActive) { // Only manage visibility when popup is not active
        if (document.hidden) {
          card.classList.add('paused');
          card.style.willChange = 'auto';
        } else {
          card.classList.remove('paused');
          card.style.willChange = 'transform';
        }
      }
    };

    if ('visibilitychange' in document) {
      document.addEventListener('visibilitychange', visibilityHandler);
      widgetState.eventHandlers.push({
        element: document,
        event: 'visibilitychange',
        handler: visibilityHandler
      });
    }

    // Add accessible event handlers with optimized debouncing
    function handleActivation() {
      // Clear any existing timeout
      if (widgetState.timeouts.length > 0) {
        widgetState.timeouts.forEach(clearTimeout);
        widgetState.timeouts = [];
      }

      const timeout = setTimeout(() => {
        pauseWidgetResources(); // Pause resources before opening popup
        openPopup(hostUrl);
      }, 100);

      widgetState.timeouts.push(timeout);
    }

    // Click handler with passive option for better performance
    const clickHandler = function(event) {
      event.preventDefault();
      handleActivation();
    };

    card.addEventListener('click', clickHandler, { passive: false });
    widgetState.eventHandlers.push({
      element: card,
      event: 'click',
      handler: clickHandler
    });

    // Keyboard handler for accessibility
    const keydownHandler = function(event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleActivation();
      }
    };

    card.addEventListener('keydown', keydownHandler);
    widgetState.eventHandlers.push({
      element: card,
      event: 'keydown',
      handler: keydownHandler
    });

    console.log('✨ AI Receptionist v4.1.0-flat2025 loaded with minimal shadows, flat morphism, and bold typography');
  }

  // Optimized popup function with progressive loading
  function openPopup(hostUrl) {
    // Efficient CSS-based animation for card
    const card = document.getElementById('quantum-chat-card');
    card.classList.add('widget-closing');

    // Use CSS transition instead of setTimeout for better performance
    const hideTimeout = setTimeout(() => {
      card.style.display = 'none';
      card.classList.remove('widget-closing');
    }, 150);
    widgetState.timeouts.push(hideTimeout);

    // Create optimized iframe with progressive loading
    const iframe = document.createElement('iframe');
    iframe.id = 'quantum-chat-popup';

    // Start with minimal permissions - add more on demand
    iframe.allow = 'microphone'; // Only essential permission initially
    iframe.loading = 'lazy'; // Changed from eager to prevent resource competition
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';

    // Optimized iframe styling with better performance
    iframe.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      border: none;
      z-index: 999999;
      opacity: 0;
      background: #f8fafc;
      contain: layout style size;
      content-visibility: auto;
      transition: opacity 0.2s ease-out;
    `;

    // Enhanced loading with resource management
    let loadTimeout;

    const onIframeLoad = () => {
      if (loadTimeout) {
        clearTimeout(loadTimeout);
        const index = widgetState.timeouts.indexOf(loadTimeout);
        if (index > -1) widgetState.timeouts.splice(index, 1);
      }

      // Progressive permission enhancement
      iframe.allow = 'microphone; camera; geolocation; encrypted-media; autoplay';
      iframe.style.opacity = '1';
      iframe.style.background = 'transparent';

      // Force a repaint for smoother transition
      iframe.offsetHeight;
    };

    const onIframeError = () => {
      if (loadTimeout) {
        clearTimeout(loadTimeout);
        const index = widgetState.timeouts.indexOf(loadTimeout);
        if (index > -1) widgetState.timeouts.splice(index, 1);
      }

      console.warn('Widget iframe failed to load');
      iframe.style.opacity = '1';
      iframe.style.background = '#f8fafc';
    };

    iframe.addEventListener('load', onIframeLoad, { once: true });
    iframe.addEventListener('error', onIframeError, { once: true });

    // Reduced timeout for better perceived performance
    loadTimeout = setTimeout(() => {
      if (iframe.style.opacity === '0') {
        iframe.style.opacity = '1';
        iframe.style.background = 'transparent';
      }
    }, 2000); // Reduced from 3000ms

    widgetState.timeouts.push(loadTimeout);

    // Add iframe to DOM first, then set src to avoid layout thrashing
    document.body.appendChild(iframe);

    // Use requestAnimationFrame for smoother iframe loading
    requestAnimationFrame(() => {
      iframe.src = `${hostUrl}/widget?mode=simple&auto=true`;
    });

    // Enhanced message handler with proper cleanup
    const messageHandler = function(event) {
      if (event.data?.type === 'quantum-chat' && event.data?.action === 'widget-minimized') {
        // Comprehensive cleanup
        if (loadTimeout) {
          clearTimeout(loadTimeout);
          const index = widgetState.timeouts.indexOf(loadTimeout);
          if (index > -1) widgetState.timeouts.splice(index, 1);
        }

        // Remove iframe with proper cleanup
        iframe.removeEventListener('load', onIframeLoad);
        iframe.removeEventListener('error', onIframeError);
        iframe.remove();

        // Clean up message handler
        window.removeEventListener('message', messageHandler);

        // Resume widget resources
        resumeWidgetResources();

        // Efficient CSS-based card restoration
        card.style.display = 'flex';
        card.classList.add('widget-opening');

        // Use CSS animation instead of manual style manipulation
        requestAnimationFrame(() => {
          card.classList.remove('widget-opening');
        });

        // Force garbage collection hint
        if (window.gc && typeof window.gc === 'function') {
          setTimeout(() => window.gc(), 100);
        }
      }
    };

    window.addEventListener('message', messageHandler, { passive: true });

    // Store message handler for potential cleanup
    widgetState.eventHandlers.push({
      element: window,
      event: 'message',
      handler: messageHandler
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createCard);
  } else {
    createCard();
  }

  // Enhanced global API with resource management
  window.QuantumChat = {
    version: '4.2.0-performance',
    loaded: true,

    showCard: function() {
      const card = document.getElementById('quantum-chat-card');
      if (card) {
        resumeWidgetResources();
        card.style.display = 'flex';
        card.classList.add('widget-opening');

        requestAnimationFrame(() => {
          card.classList.remove('widget-opening');
        });
      }
    },

    hideCard: function() {
      const card = document.getElementById('quantum-chat-card');
      if (card) {
        pauseWidgetResources();
        card.classList.add('widget-closing');

        const hideTimeout = setTimeout(() => {
          card.style.display = 'none';
          card.classList.remove('widget-closing');
        }, 150);

        widgetState.timeouts.push(hideTimeout);
      }
    },

    // Advanced performance controls
    pauseAnimations: function() {
      const card = document.getElementById('quantum-chat-card');
      if (card) {
        card.classList.add('paused');
        card.style.willChange = 'auto';
      }
    },

    resumeAnimations: function() {
      const card = document.getElementById('quantum-chat-card');
      if (card && !widgetState.isPopupActive) {
        card.classList.remove('paused');
        card.style.willChange = 'transform';
      }
    },

    // Resource cleanup for SPA navigation
    cleanup: function() {
      cleanupResources();
      const card = document.getElementById('quantum-chat-card');
      if (card) {
        card.remove();
      }

      const popup = document.getElementById('quantum-chat-popup');
      if (popup) {
        popup.remove();
      }

      // Reset widget state
      widgetState.isPopupActive = false;
    },

    // Performance monitoring
    getPerformanceStats: function() {
      return {
        activeObservers: widgetState.observers.length,
        activeTimeouts: widgetState.timeouts.length,
        activeIntervals: widgetState.intervals.length,
        activeEventHandlers: widgetState.eventHandlers.length,
        isPopupActive: widgetState.isPopupActive,
        memoryUsage: performance.memory ? {
          used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + 'MB',
          total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024) + 'MB'
        } : null
      };
    }
  };

  // Cleanup on page unload to prevent memory leaks
  window.addEventListener('beforeunload', function() {
    if (window.QuantumChat) {
      window.QuantumChat.cleanup();
    }
  }, { once: true });

})();