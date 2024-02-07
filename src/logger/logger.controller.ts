import { Body, Controller, Post } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { promptDto } from './dto/index'

@Controller('api/v1')
export class LoggerController {
    constructor(private loggerService: LoggerService) { }

    @Post('prompt')
    async prompt(@Body() dto: promptDto): Promise<string> {
        return this.loggerService.promptResponse(dto.prompt);
    }

}
