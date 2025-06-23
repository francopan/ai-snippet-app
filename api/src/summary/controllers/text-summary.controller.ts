import {
  Body,
  Controller,
  Get,
  Header,
  HttpStatus,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { ChatResultDeltaDto } from '../../llm/dtos/chat-result-delta.dto';
import { CreateTextSummaryDto } from '../dtos/create-text-summary.dto';
import { TextSummaryDto } from '../dtos/text-summary.dto';
import { TextSummaryService } from '../services/text-summary.service';
import { PagedResultDto } from '../../core/dtos/paged-results.dto';
import { PaginationParamsDto } from '../../core/dtos/paginated-params.dto';

@Controller('snippets')
export class TextSummaryController {
  private readonly logger = new Logger(TextSummaryController.name);

  constructor(private readonly textSummaryService: TextSummaryService) {}

  @Get()
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The snippet with generated summary',
    type: TextSummaryDto,
    isArray: true,
    examples: {
      withoutSummary: {
        summary: 'Without summary',
        value: [
          {
            id: '6854db4e8615376d25a539b2',
            text: 'A sample text',
            summary: null,
          },
        ],
      },
      withSummary: {
        summary: 'With summary',
        value: [
          {
            id: '6854db4e8615376d25a539b2',
            text: 'A sample text',
            summary: 'With Summary',
          },
        ],
      },
    },
  })
  async getSnippets() {
    try {
      return await this.textSummaryService.findAll();
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Error fetching snippets');
    }
  }

  @Get('paginated')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Paginated list of text summaries',
    type: PagedResultDto,
  })
  async getPaginated(
    @Query() query: PaginationParamsDto,
  ): Promise<PagedResultDto<TextSummaryDto>> {
    try {
      const page = query.page ?? 1;
      const limit = query.limit ?? 10;
      const { items, total } =
        await this.textSummaryService.findPaginatedWithCount(page, limit);
      const totalPages = Math.ceil(total / limit);

      return {
        page,
        limit,
        totalItems: total,
        totalPages,
        items,
      };
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        'Error fetching paginated snippets',
      );
    }
  }

  @Get(':id')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The generated reply',
    type: TextSummaryDto,
    examples: {
      withoutSummary: {
        summary: 'Without summary',
        value: {
          id: '6854db4e8615376d25a539b2',
          text: 'A sample text',
          summary: null,
        },
      },
      withSummary: {
        summary: 'With summary',
        value: {
          id: '6854db4e8615376d25a539b2',
          text: 'A sample text',
          summary: 'With Summary',
        },
      },
    },
  })
  async getSnippetById(@Param('id') id: string) {
    try {
      const snippet = await this.textSummaryService.findById(id);
      if (!snippet) {
        throw new NotFoundException('Snippet not found');
      }
      return snippet;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(error);
      throw new InternalServerErrorException('Error fetching snippet');
    }
  }

  @Post()
  @ApiBody({
    description: 'Text to summarize',
    type: CreateTextSummaryDto,
    examples: {
      simpleRequest: {
        summary: 'Simple Request',
        value: {
          text: 'A sample text',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The generated reply',
    type: TextSummaryDto,
    examples: {
      withoutResponseStream: {
        value: {
          id: '6854db4e8615376d25a539b2',
          text: 'A sample text',
          summary: null,
        },
        summary: 'Without response stream',
      },
    },
  })
  async createSnippet(@Body('text') text: string) {
    try {
      const newSnippet = await this.textSummaryService.create({ text });
      return newSnippet;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Error creating snippet');
    }
  }

  @Get(':id/stream')
  @Header('Content-Type', 'text/event-stream')
  @Header('Cache-Control', 'no-cache')
  @Header('Connection', 'keep-alive')
  async streamSummary(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const state = this.textSummaryService.getStreamStateById(id);

      if (!state) {
        throw new NotFoundException(
          `No active or cached stream found for id ${id}`,
        );
      }

      res.flushHeaders();

      for (const delta of state.buffer) {
        res.write(`data: ${JSON.stringify(delta)}\n\n`);
      }

      if (state.done) {
        res.end();
        return;
      }

      const onDelta = (delta: ChatResultDeltaDto) => {
        res.write(`data: ${JSON.stringify(delta)}\n\n`);
      };

      const onEnd = () => res.end();
      const onError = () => res.end();

      state.emitter.on('delta', onDelta);
      state.emitter.once('end', onEnd);
      state.emitter.once('error', onError);

      req.on('close', () => {
        state.emitter.off('delta', onDelta);
        state.emitter.off('end', onEnd);
        state.emitter.off('error', onError);
      });
    } catch (error) {
      this.logger.error(error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error streaming snippet');
    }
  }
}
