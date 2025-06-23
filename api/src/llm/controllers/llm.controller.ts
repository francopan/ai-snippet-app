import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Logger,
  Post,
  Res,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiProduces,
  ApiResponse,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { Response } from 'express';
import { ChatRequest } from '../dtos/chat-request.dto';
import { ChatResultDeltaDto } from '../dtos/chat-result-delta.dto';
import { ChatResultDto } from '../dtos/chat-result.dto';
import { ChatRole } from '../enums/chat-role.enum';
import { LLMService } from '../services/llm/llm.service';

@Controller('llm')
export class LLMController {
  private readonly logger = new Logger(LLMController.name);

  constructor(private readonly llmService: LLMService) {}

  @Post('chat/')
  @ApiBody({
    type: ChatRequest,
    examples: {
      example1: {
        summary: 'Sample chat request',
        description: 'One message and model name',
        value: {
          messages: [{ role: ChatRole.user, content: 'Hello!' }],
          model: 'phi3',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'The generated reply',
    type: ChatResultDto,
  })
  async chat(@Body() body: ChatRequest): Promise<ChatResultDto> {
    this.validateChatRequest(body);

    const reply = await this.llmService.generate(
      body.messages,
      body.model,
      false,
    );

    return plainToInstance(ChatResultDto, reply.toString());
  }

  @Post('chat/stream')
  @ApiOperation({ summary: 'Stream chat completion from LLM' })
  @ApiProduces('text/event-stream')
  @ApiResponse({
    status: 200,
    description: 'Stream of ChatResultDeltaDto objects',
    type: ChatResultDeltaDto,
    content: {
      'application/json': {
        examples: {
          example1: {
            summary: 'Example chunk',
            value: {
              message: {
                role: 'assistant',
                content: 'Hello, how can I help you?',
              },
              done: false,
            },
          },
          example2: {
            summary: 'Last chunk',
            value: {
              message: {
                role: 'assistant',
                content: 'Goodbye!',
              },
              done: true,
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request error',
    content: {
      'text/event-stream': {
        schema: {
          type: 'string',
          example: 'event: error\ndata: {"message":"Bad Request"}\n\n',
        },
      },
    },
  })
  async chatStream(
    @Body() body: ChatRequest,
    @Res() res: Response,
  ): Promise<void> {
    this.validateChatRequest(body);

    try {
      this.validateChatRequest(body);
      const stream = await this.llmService.generate(
        body.messages,
        body.model,
        true,
      );
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders();

      for await (const chunk of stream as AsyncGenerator<ChatResultDeltaDto>) {
        res.write(`data: ${JSON.stringify(chunk)}\n\n`);
        res.flush();
      }
      res.write('event: done\ndata: [DONE]\n\n');
      res.end();
    } catch (error: any) {
      this.logger.error('LLM streaming error:', JSON.stringify(error));
      res.status(error.status ?? 500);
      res.write(
        `event: error\ndata: ${JSON.stringify(error?.response ?? error)}\n\n`,
      );
      res.end();
    }
  }

  private validateChatRequest(body: ChatRequest) {
    if (!Array.isArray(body.messages)) {
      throw new HttpException(
        { error: 'Invalid or missing messages array' },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (
      body.messages.find(
        message =>
          message.role === ChatRole.assistant ||
          message.role === ChatRole.system,
      )
    ) {
      throw new HttpException(
        { error: 'Invalid Role' },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
