import { Body, Controller, Post, Sse, MessageEvent, Get } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { FilterDto, promptDto } from './dto/index';
import { Observable, interval } from 'rxjs';
import { map } from 'rxjs/operators';
@Controller('api/v1')
export class LoggerController {
  constructor(private loggerService: LoggerService) {}

  @Post('prompt')
  async prompt(@Body() dto: promptDto): Promise<string> {
    return this.loggerService.promptResponse(dto.prompt);
  }

  @Get('stats')
  async stats(): Promise<any> {
    return this.loggerService.getAggregateMetrics();
  }

  @Post('filter')
  async filter(@Body() dto: FilterDto): Promise<any> {
    return this.loggerService.getFilteredRequests(dto);
  }

//   @Sse('sse')
//   sse(): Observable<MessageEvent> {
//     return interval(1000).pipe(
//       map((_) => ({ data: { hello: 'world' } }) as MessageEvent),
//     );
//   }
}
