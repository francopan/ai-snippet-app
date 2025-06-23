import { Controller, Get } from '@nestjs/common';

@Controller('nest')
export class AppController {
  @Get()
  getHello(): string {
    return 'Hello from Nest!';
  }
}
