import StreamingAvatar, {
  AvatarQuality,
  StreamingEvents,
  TaskMode,
  TaskType,
} from '@heygen/streaming-avatar';

export class HeyGenAvatarManager {
  private avatar: StreamingAvatar | null = null;
  private sessionInfo: any = null;
  private isConnected: boolean = false;

  constructor(private apiKey: string) {}

  async initialize(videoElement: HTMLVideoElement): Promise<void> {
    try {
      this.avatar = new StreamingAvatar({
        token: await this.generateAccessToken(),
      });

      this.setupEventListeners();

      this.sessionInfo = await this.avatar.createStartAvatar({
        quality: AvatarQuality.High,
        avatarName: 'Anna_public_3_20240108',
        knowledgeBase: '',
        voice: {
          rate: 1.5,
          emotion: 'Excited',
        },
        language: 'en',
      });

      await this.avatar.on(StreamingEvents.STREAM_READY, (event) => {
        console.log('Avatar stream is ready');
        this.isConnected = true;
        if (event.detail && videoElement) {
          videoElement.srcObject = event.detail;
          videoElement.onloadedmetadata = () => {
            videoElement.play().catch(console.error);
          };
        }
      });

    } catch (error) {
      console.error('Failed to initialize HeyGen avatar:', error);
      throw error;
    }
  }

  private setupEventListeners(): void {
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
      console.log('Stream ready event received');
    });
  }

  async speak(text: string): Promise<void> {
    if (!this.avatar || !this.isConnected) {
      throw new Error('Avatar is not connected');
    }

    try {
      await this.avatar.speak({
        taskRequest: {
          text: text,
          task_type: TaskType.TALK,
          task_mode: TaskMode.SYNC,
        },
        sessionInfo: this.sessionInfo,
      });
    } catch (error) {
      console.error('Error making avatar speak:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.avatar && this.sessionInfo) {
      try {
        await this.avatar.stopAvatar(this.sessionInfo);
        this.isConnected = false;
        this.sessionInfo = null;
      } catch (error) {
        console.error('Error disconnecting avatar:', error);
      }
    }
  }

  private async generateAccessToken(): Promise<string> {
    if (!this.apiKey) {
      throw new Error('HeyGen API key is required');
    }

    try {
      const response = await fetch('https://api.heygen.com/v1/streaming.create_token', {
        method: 'POST',
        headers: {
          'X-Api-Key': this.apiKey,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get access token: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data.token;
    } catch (error) {
      console.error('Error generating access token:', error);
      throw error;
    }
  }

  isAvatarConnected(): boolean {
    return this.isConnected;
  }
}