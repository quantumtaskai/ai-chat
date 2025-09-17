# AI Chat with HeyGen Avatar

A web application that combines OpenAI's Assistant API with HeyGen's Streaming Avatar SDK to create an interactive AI chat experience with a realistic avatar.

## Features

- 🤖 **OpenAI Assistant Integration**: Powered by GPT-4 for intelligent conversations
- 👤 **HeyGen Avatar**: Realistic AI avatar that speaks responses with natural voice and gestures  
- 🌐 **Web-based Interface**: Modern browser-based chat application
- 🔄 **Real-time Streaming**: Live video and audio streaming from HeyGen's platform
- 💬 **Interactive Chat**: Type messages and get spoken responses from the AI avatar

## Prerequisites

- Node.js 16+ and npm
- OpenAI API key
- HeyGen API key
- Modern web browser with WebRTC support

## Setup Instructions

1. **Clone and install dependencies**:
   ```bash
   git clone <repository-url>
   cd ai-chat
   npm install
   ```

2. **Configure API keys**:
   - Copy `.env.example` to `.env.local`
   - Add your API keys:
     ```
     VITE_OPENAI_API_KEY=your_openai_api_key_here
     VITE_HEYGEN_API_KEY=your_heygen_api_key_here
     ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to `http://localhost:3000`

## Usage

1. Click "Connect to Avatar" to initialize both OpenAI Assistant and HeyGen Avatar
2. Wait for the connection to be established (you'll see the avatar video stream)
3. Type your message in the input field and click "Send" or press Enter
4. The AI will process your message and the avatar will speak the response

## Project Structure

```
ai-chat/
├── public/
│   ├── index.html          # Main web interface
│   ├── main.js            # Application logic
│   ├── openai-assistant.js # OpenAI integration
│   └── heygen-avatar.js   # HeyGen avatar management
├── src/
│   ├── openai-assistant.ts # TypeScript version (for reference)
│   └── heygen-avatar.ts   # TypeScript version (for reference)
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Security Notes

⚠️ **Important**: This implementation exposes API keys in the browser for development purposes only. For production use:

- Move API calls to a secure backend
- Implement server-side token generation
- Use environment variables on the server
- Never expose API keys in client-side code

## API Requirements

### OpenAI API Key
- Sign up at [OpenAI Platform](https://platform.openai.com/)
- Create an API key with GPT-4 access
- Ensure you have sufficient credits

### HeyGen API Key  
- Sign up at [HeyGen](https://app.heygen.com/)
- Get your API key from the dashboard
- Ensure you have streaming avatar credits

## Troubleshooting

- **Avatar not connecting**: Check your HeyGen API key and credits
- **No AI responses**: Verify your OpenAI API key and account status
- **Video not playing**: Ensure your browser supports WebRTC and has camera/microphone permissions
- **Build errors**: Make sure all dependencies are installed with `npm install`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production  
- `npm run preview` - Preview production build

## Technologies Used

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Build Tool**: Vite
- **AI**: OpenAI GPT-4 Assistant API
- **Avatar**: HeyGen Streaming Avatar SDK
- **Streaming**: LiveKit Client for WebRTC

## License

MIT License