import OpenAI from 'openai';

export class OpenAIAssistant {
  private openai: OpenAI;
  private assistantId: string | null = null;
  private threadId: string | null = null;

  constructor(apiKey: string) {
    this.openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true
    });
  }

  async createAssistant(name: string = "English Tutor", instructions: string = "You are an English tutor. Help users improve their English skills through conversation and exercises.") {
    try {
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
      const thread = await this.openai.beta.threads.create();
      this.threadId = thread.id;
      console.log(`Thread created with ID: ${this.threadId}`);
      return thread;
    } catch (error) {
      console.error('Error creating thread:', error);
      throw error;
    }
  }

  async sendMessage(content: string): Promise<string> {
    if (!this.assistantId || !this.threadId) {
      throw new Error('Assistant and thread must be initialized before sending messages');
    }

    try {
      await this.openai.beta.threads.messages.create(this.threadId, {
        role: 'user',
        content: content
      });

      const run = await this.openai.beta.threads.runs.create(this.threadId, {
        assistant_id: this.assistantId
      });

      let runStatus = await this.openai.beta.threads.runs.retrieve(this.threadId, run.id);
      
      while (runStatus.status !== 'completed') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        runStatus = await this.openai.beta.threads.runs.retrieve(this.threadId, run.id);
        
        if (runStatus.status === 'failed') {
          throw new Error('Run failed');
        }
      }

      const messages = await this.openai.beta.threads.messages.list(this.threadId);
      const lastMessage = messages.data[0];
      
      if (lastMessage.content[0].type === 'text') {
        return lastMessage.content[0].text.value;
      }
      
      return 'No response generated';
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  async initialize(assistantName?: string, instructions?: string) {
    await this.createAssistant(assistantName, instructions);
    await this.createThread();
  }
}