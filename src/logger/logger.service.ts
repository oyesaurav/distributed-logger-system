import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@clickhouse/client';
import OpenAI from 'openai';
import * as tiktoken from 'js-tiktoken';

const encoding = tiktoken.getEncoding('cl100k_base');

@Injectable()
export class LoggerService {
  constructor(private configService: ConfigService) {}
  private openai = new OpenAI({
    apiKey: this.configService.get<string>('openai.apiKey'),
  });
  private client = createClient({
    host: this.configService.get<string>('clickhouse.host'),
    username: this.configService.get<string>('clickhouse.username'),
    password: this.configService.get<string>('clickhouse.password'),
  });

  public numTokensFromPrompt = (
    messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
  ) => {
    let numTokens = 0;

    for (const message of messages) {
      numTokens += 4; // every message follows <im_start>{role/name}\n{content}<im_end>\n

      for (const [key, value] of Object.entries(message)) {
        numTokens += encoding.encode(value).length;

        if (key === 'name') numTokens -= 1; // role is always required and always 1 token
      }
    }

    numTokens += 2; // every reply is primed with <im_start>assistant

    return numTokens;
  };

  async promptResponse(prompt: string): Promise<string> {
    await this.client.command({
      query: `CREATE OR REPLACE TABLE prompts 
                    (id String, prompt String, success Boolean, created_at DateTime64(3, 'UTC'), response String, model String, prompt_tokens UInt64, response_tokens UInt64, latency UInt64, user String, env String)
                    ENGINE = MergeTree()
                    ORDER BY (id)`,
    });

    let content = '';
    const tokenUsage = {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
    };
    let startTime = new Date().getTime();
    const stream = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      stream: true,
    });

    tokenUsage.prompt_tokens = this.numTokensFromPrompt([
      { role: 'user', content: prompt },
    ]);

    for await (const chunk of stream) {
      if (chunk.choices[0].finish_reason != null) {
        tokenUsage.completion_tokens = encoding.encode(content).length;
        let endTime = new Date().getTime();
        let latency = endTime - startTime;
        await this.client.insert({
          table: 'prompts',
          values: [
            {
              id: chunk.id,
              prompt: prompt,
              success: true,
              created_at: new Date(),
              response: content,
              model: chunk.model,
              prompt_tokens: tokenUsage.prompt_tokens,
              response_tokens: tokenUsage.completion_tokens,
              latency: latency,
              user: 'user',
              env: 'dev',
            },
          ],
          format: 'JSONEachRow',
        });
      }
      content += chunk.choices[0].delta.content;
    }
    console.log(content);
    return prompt;
  }
}