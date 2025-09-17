import * as dotenv from 'dotenv';
import * as readline from 'readline';
import { OpenAIAssistant } from './openai-assistant';

dotenv.config();

class AIChatApp {
  private assistant: OpenAIAssistant;
  private rl: readline.Interface;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }

    this.assistant = new OpenAIAssistant(apiKey);
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async initialize() {
    try {
      console.log('Initializing AI Assistant...');
      await this.assistant.initialize(
        'AI Chat Assistant',
        'You are a helpful AI assistant. Provide clear, concise, and helpful responses to user questions and requests.'
      );
      console.log('AI Assistant ready! Type "exit" to quit.\n');
    } catch (error) {
      console.error('Failed to initialize assistant:', error);
      process.exit(1);
    }
  }

  async startChat() {
    this.rl.question('You: ', async (input) => {
      if (input.toLowerCase() === 'exit') {
        console.log('Goodbye!');
        this.rl.close();
        return;
      }

      try {
        console.log('Assistant is thinking...');
        const response = await this.assistant.sendMessage(input);
        console.log(`\nAssistant: ${response}\n`);
      } catch (error) {
        console.error('Error getting response:', error);
        console.log('\nSorry, I encountered an error. Please try again.\n');
      }

      this.startChat();
    });
  }

  async run() {
    await this.initialize();
    await this.startChat();
  }
}

const app = new AIChatApp();
app.run().catch(error => {
  console.error('Application error:', error);
  process.exit(1);
});