import StreamingAvatar, {
  AvatarQuality,
  StreamingEvents,
  TaskMode,
  TaskType,
} from '@heygen/streaming-avatar';

export class HeyGenAvatarManager {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.avatar = null;
    this.sessionInfo = null;
    this.isConnected = false;
  }

  async initialize(videoElement) {
    try {
      this.avatar = new StreamingAvatar({
        token: await this.generateAccessToken(),
      });

      this.setupEventListeners(videoElement);

      this.sessionInfo = await this.avatar.createStartAvatar({
        quality: AvatarQuality.High,
        avatarName: 'Wayne_20240711',
      });

    } catch (error) {
      console.error('Failed to initialize HeyGen avatar:', error);
      throw error;
    }
  }

  setupEventListeners(videoElement) {
    if (!this.avatar) return;

    this.avatar.on(StreamingEvents.STREAM_DISCONNECTED, () => {
      console.log('Avatar stream disconnected');
      this.isConnected = false;
    });

    this.avatar.on(StreamingEvents.AVATAR_START_TALKING, (event) => {
      console.log('Avatar started talking:', event);
    });

    this.avatar.on(StreamingEvents.AVATAR_STOP_TALKING, (event) => {
      console.log('Avatar stopped talking:', event);
    });

    this.avatar.on(StreamingEvents.STREAM_READY, (event) => {
      console.log('Stream ready event received - setting connected = true');
      this.isConnected = true;
      
      if (event.detail && videoElement) {
        console.log('Setting video srcObject and starting playback');
        videoElement.srcObject = event.detail;
        videoElement.onloadedmetadata = () => {
          console.log('Video metadata loaded, starting playback');
          videoElement.play().catch(console.error);
        };
      } else {
        console.warn('No video stream or element available');
      }
      
      // Enable voice mode button when stream is ready
      const voiceModeBtn = document.getElementById('voiceModeBtn');
      if (voiceModeBtn) {
        voiceModeBtn.disabled = false;
        voiceModeBtn.style.background = '#28a745';
        voiceModeBtn.style.color = 'white';
        voiceModeBtn.style.cursor = 'pointer';
        voiceModeBtn.style.borderColor = '#28a745';
      }
    });

    // Voice chat event listeners
    this.avatar.on(StreamingEvents.USER_START, () => {
      console.log('User started speaking');
      this.updateVoiceStatus('Listening...');
    });

    this.avatar.on(StreamingEvents.USER_STOP, () => {
      console.log('User stopped speaking');
      this.updateVoiceStatus('Processing...');
    });

    this.avatar.on(StreamingEvents.AVATAR_START_TALKING, () => {
      console.log('Avatar started talking');
      this.updateVoiceStatus('Avatar speaking...');
    });

    this.avatar.on(StreamingEvents.AVATAR_STOP_TALKING, () => {
      console.log('Avatar stopped talking');
      this.updateVoiceStatus('Ready for voice chat');
    });
  }

  updateVoiceStatus(message) {
    const voiceStatus = document.getElementById('voiceStatus');
    if (voiceStatus) {
      voiceStatus.textContent = message;
    }
  }

  async speak(text) {
    if (!this.avatar || !this.isConnected) {
      throw new Error('Avatar is not connected');
    }

    try {
      console.log('Making avatar speak custom text:', text);
      await this.avatar.speak({
        text: text,
        taskType: TaskType.REPEAT,
      });
      console.log('Avatar speak command sent successfully');
    } catch (error) {
      console.error('Error making avatar speak:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.avatar) {
      try {
        await this.avatar.stopAvatar();
        this.isConnected = false;
        this.sessionInfo = null;
      } catch (error) {
        console.error('Error disconnecting avatar:', error);
      }
    }
  }

  async generateAccessToken() {
    if (!this.apiKey) {
      throw new Error('HeyGen API key is required');
    }

    console.log('Generating HeyGen access token with key:', this.apiKey);
    console.log('API key length:', this.apiKey.length);

    try {
      const requestOptions = {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
        },
      };
      
      console.log('Request options:', requestOptions);
      
      const response = await fetch('https://api.heygen.com/v1/streaming.create_token', requestOptions);

      console.log('HeyGen API response status:', response.status);
      console.log('HeyGen API response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('HeyGen API error response:', errorText);
        throw new Error(`Failed to get access token: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('HeyGen API success response:', data);
      
      if (!data.data || !data.data.token) {
        throw new Error('Invalid token response format from HeyGen API');
      }
      
      return data.data.token;
    } catch (error) {
      console.error('Error generating access token:', error);
      throw error;
    }
  }

  async getAvailableAvatars() {
    if (!this.apiKey) {
      throw new Error('HeyGen API key is required');
    }

    try {
      const response = await fetch('https://api.heygen.com/v1/streaming/avatar.list', {
        method: 'GET',
        headers: {
          'x-api-key': this.apiKey,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error fetching avatars:', errorText);
        throw new Error(`Failed to get avatars: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Available avatars:', data);
      return data.data || [];
    } catch (error) {
      console.error('Error getting available avatars:', error);
      throw error;
    }
  }

  async startVoiceChat() {
    if (!this.avatar || !this.isConnected) {
      throw new Error('Avatar is not connected');
    }

    try {
      console.log('Starting voice chat...');
      await this.avatar.startVoiceChat({ language: 'en' });
      console.log('Voice chat started successfully');
    } catch (error) {
      console.error('Error starting voice chat:', error);
      throw error;
    }
  }

  async stopVoiceChat() {
    if (!this.avatar) {
      return;
    }

    try {
      console.log('Stopping voice chat...');
      await this.avatar.closeVoiceChat();
      console.log('Voice chat stopped successfully');
    } catch (error) {
      console.error('Error stopping voice chat:', error);
      throw error;
    }
  }

  isAvatarConnected() {
    console.log('Connection status check - isConnected:', this.isConnected);
    return this.isConnected;
  }
}