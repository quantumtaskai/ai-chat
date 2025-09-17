import OpenAI from 'openai';

export class OpenAIAssistant {
  constructor(apiKey) {
    this.openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true
    });
    this.assistantId = null;
    this.threadId = null;
  }

  async createAssistant(name = "English Tutor", instructions = "You are an English tutor. Help users improve their English skills through conversation and exercises.") {
    try {
      console.log('Creating OpenAI assistant...');
      const assistant = await this.openai.beta.assistants.create({
        name: name,
        instructions: instructions,
        model: "gpt-4"
      });
      
      this.assistantId = assistant.id;
      console.log(`Assistant created with ID: ${this.assistantId}`);
      return assistant;
    } catch (error) {
      console.error('Error creating assistant:', error);
      throw error;
    }
  }

  async createThread() {
    try {
      console.log('Creating OpenAI thread...');
      const thread = await this.openai.beta.threads.create();
      this.threadId = thread.id;
      console.log(`Thread created with ID: ${this.threadId}`);
      return thread;
    } catch (error) {
      console.error('Error creating thread:', error);
      throw error;
    }
  }

  async sendMessage(content) {
    if (!this.assistantId || !this.threadId) {
      throw new Error('Assistant and thread must be initialized before sending messages');
    }

    try {
      // Create message in thread
      await this.openai.beta.threads.messages.create(this.threadId, {
        role: 'user',
        content: content
      });

      // Create and run the assistant using createAndPoll (as per HeyGen docs)
      const run = await this.openai.beta.threads.runs.createAndPoll(
        this.threadId,
        { assistant_id: this.assistantId }
      );

      // Check run status and retrieve response
      if (run.status === 'completed') {
        const messages = await this.openai.beta.threads.messages.list(this.threadId);
        
        const lastMessage = messages.data.filter(
          (msg) => msg.role === 'assistant'
        )[0];

        if (lastMessage && lastMessage.content[0].type === 'text') {
          return lastMessage.content[0].text.value;
        }
      }

      return 'Sorry, I could not process your request.';
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  async initialize(assistantName, instructions) {
    await this.createAssistant(assistantName, instructions);
    await this.createThread();
  }
}