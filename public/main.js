import { OpenAIAssistant } from './openai-assistant.js';
import { HeyGenAvatarManager } from './heygen-avatar.js';

class AIChatApp {
  constructor() {
    this.openaiAssistant = null;
    this.heygenAvatar = null;
    this.isConnected = false;
    this.currentMode = 'text'; // 'text' or 'voice'
    
    this.initializeElements();
    this.setupEventListeners();
  }

  initializeElements() {
    this.connectButton = document.getElementById('connectButton');
    this.sendButton = document.getElementById('sendButton');
    this.messageInput = document.getElementById('messageInput');
    this.avatarVideo = document.getElementById('avatarVideo');
    this.statusDiv = document.getElementById('status');
    this.voiceStatus = document.getElementById('voiceStatus');
    
    // Mode switching elements
    this.textModeBtn = document.getElementById('textModeBtn');
    this.voiceModeBtn = document.getElementById('voiceModeBtn');
    this.textModeControls = document.getElementById('textModeControls');
    this.voiceModeControls = document.getElementById('voiceModeControls');
  }

  setupEventListeners() {
    this.connectButton.addEventListener('click', () => this.connectToAvatar());
    this.sendButton.addEventListener('click', () => this.sendMessage());
    this.messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // Mode switching event listeners
    this.textModeBtn.addEventListener('click', () => this.switchMode('text'));
    this.voiceModeBtn.addEventListener('click', () => this.switchMode('voice'));
  }

  showStatus(message, type = 'loading') {
    this.statusDiv.textContent = message;
    this.statusDiv.className = `status ${type}`;
    this.statusDiv.style.display = 'block';
  }

  hideStatus() {
    this.statusDiv.style.display = 'none';
  }

  async connectToAvatar() {
    try {
      this.connectButton.disabled = true;
      this.showStatus('Connecting to avatar...', 'loading');

      // Get API keys from environment (in production, these should come from a secure backend)
      const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY;
      const heygenApiKey = import.meta.env.VITE_HEYGEN_API_KEY;

      console.log('All environment variables:', import.meta.env);
      console.log('Environment check:', {
        openaiKeyExists: !!openaiApiKey,
        heygenKeyExists: !!heygenApiKey,
        openaiKeyLength: openaiApiKey?.length,
        heygenKeyLength: heygenApiKey?.length
      });

      if (!openaiApiKey || openaiApiKey.trim() === '') {
        throw new Error('OpenAI API key is not configured. Please set VITE_OPENAI_API_KEY in your .env.local file.');
      }

      if (!heygenApiKey || heygenApiKey.trim() === '') {
        throw new Error('HeyGen API key is not configured. Please set VITE_HEYGEN_API_KEY in your .env.local file.');
      }

      // Initialize OpenAI Assistant
      this.showStatus('Initializing OpenAI Assistant...', 'loading');
      this.openaiAssistant = new OpenAIAssistant(openaiApiKey);
      await this.openaiAssistant.initialize(
        'AI Avatar Assistant',
        'You are a helpful AI assistant speaking through a HeyGen avatar. Keep your responses conversational, engaging, and concise since they will be spoken aloud. Aim for responses that are natural when heard rather than read.'
      );

      // Initialize HeyGen Avatar
      this.showStatus('Connecting to HeyGen avatar...', 'loading');
      this.heygenAvatar = new HeyGenAvatarManager(heygenApiKey);
      await this.heygenAvatar.initialize(this.avatarVideo);

      // Wait a moment for the stream to be fully ready
      console.log('Waiting for avatar stream to be ready...');
      await new Promise(resolve => setTimeout(resolve, 3000));

      console.log('Checking avatar connection status:', this.heygenAvatar.isAvatarConnected());
      
      if (this.heygenAvatar.isAvatarConnected()) {
        this.isConnected = true;
        this.showStatus('Connected! You can now chat with the AI avatar.', 'connected');
        this.connectButton.textContent = 'Connected';
        this.messageInput.disabled = false;
        this.sendButton.disabled = false;
        this.messageInput.focus();

        // Welcome message
        console.log('Playing welcome message...');
        await this.heygenAvatar.speak('Hello! I am your AI assistant. How can I help you today?');
      } else {
        console.error('Avatar connection check failed - isConnected is false');
        throw new Error('Failed to establish avatar connection');
      }

    } catch (error) {
      console.error('Connection error:', error);
      this.showStatus(`Connection failed: ${error.message}`, 'error');
      this.connectButton.disabled = false;
      this.connectButton.textContent = 'Retry Connection';
    }
  }

  async sendMessage() {
    if (!this.isConnected || !this.messageInput.value.trim()) {
      return;
    }

    const message = this.messageInput.value.trim();
    this.messageInput.value = '';
    this.sendButton.disabled = true;
    this.messageInput.disabled = true;

    try {
      this.showStatus('AI is thinking...', 'loading');

      // Get response from OpenAI Assistant
      const response = await this.openaiAssistant.sendMessage(message);
      
      this.showStatus('Avatar is speaking...', 'loading');

      // Make avatar speak the response
      await this.heygenAvatar.speak(response);

      this.showStatus('Ready for your next message', 'connected');

    } catch (error) {
      console.error('Error processing message:', error);
      this.showStatus(`Error: ${error.message}`, 'error');
    } finally {
      this.sendButton.disabled = false;
      this.messageInput.disabled = false;
      this.messageInput.focus();
    }
  }

  async switchMode(mode) {
    if (!this.isConnected) {
      this.showStatus('Please connect to avatar first', 'error');
      return;
    }

    if (mode === this.currentMode) {
      return; // Already in this mode
    }

    try {
      if (mode === 'voice') {
        // Switch to voice mode
        console.log('Switching to voice mode...');
        await this.heygenAvatar.startVoiceChat();
        
        // Update UI
        this.textModeControls.style.display = 'none';
        this.voiceModeControls.style.display = 'block';
        
        // Update button styles
        this.textModeBtn.classList.remove('active');
        this.textModeBtn.style.background = '#f8f9fa';
        this.textModeBtn.style.color = '#6c757d';
        this.textModeBtn.style.borderColor = '#ddd';
        
        this.voiceModeBtn.classList.add('active');
        this.voiceModeBtn.style.background = '#007bff';
        this.voiceModeBtn.style.color = 'white';
        this.voiceModeBtn.style.borderColor = '#007bff';
        
        this.showStatus('Voice mode active - speak to the avatar', 'connected');
        
      } else {
        // Switch to text mode
        console.log('Switching to text mode...');
        await this.heygenAvatar.stopVoiceChat();
        
        // Update UI
        this.textModeControls.style.display = 'block';
        this.voiceModeControls.style.display = 'none';
        
        // Update button styles
        this.voiceModeBtn.classList.remove('active');
        this.voiceModeBtn.style.background = '#28a745';
        this.voiceModeBtn.style.color = 'white';
        this.voiceModeBtn.style.borderColor = '#28a745';
        
        this.textModeBtn.classList.add('active');
        this.textModeBtn.style.background = '#007bff';
        this.textModeBtn.style.color = 'white';
        this.textModeBtn.style.borderColor = '#007bff';
        
        this.showStatus('Text mode active - type your messages', 'connected');
      }

      this.currentMode = mode;
      
    } catch (error) {
      console.error('Error switching modes:', error);
      this.showStatus(`Failed to switch to ${mode} mode: ${error.message}`, 'error');
    }
  }

  async disconnect() {
    if (this.heygenAvatar) {
      // Stop voice chat if active
      if (this.currentMode === 'voice') {
        await this.heygenAvatar.stopVoiceChat();
      }
      await this.heygenAvatar.disconnect();
    }
    this.isConnected = false;
  }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
  const app = new AIChatApp();
  
  // Handle page unload
  window.addEventListener('beforeunload', () => {
    app.disconnect();
  });
});

// Handle errors globally
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});