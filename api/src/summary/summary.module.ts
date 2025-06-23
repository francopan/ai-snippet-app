import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TextSummaryController } from './controllers/text-summary.controller';
import { TextSummaryService } from './services/text-summary.service';
import { TextSummaryRepository } from './repositories/text-summary.repository';
import { LLMModule } from '../llm/llm.module';
import { TextSummarySchema, TextSummary } from './models/text-summary.model'; // ajuste o caminho

@Module({
  imports: [
    LLMModule,
    MongooseModule.forFeature([
      { name: TextSummary.name, schema: TextSummarySchema },
    ]),
  ],
  controllers: [TextSummaryController],
  providers: [TextSummaryService, TextSummaryRepository],
})
export class SummaryModule {}
