import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { LLMModule } from './llm/llm.module';
import { SummaryModule } from './summary/summary.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CoreModule } from './core/core.module';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
    }),
    LLMModule,
    SummaryModule,
    CoreModule,
  ],
})
export class AppModule {}
