import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule } from './logger/logger.module';
import configuration from './config/configuration';

@Module({
  imports: [LoggerModule,
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: false,
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
