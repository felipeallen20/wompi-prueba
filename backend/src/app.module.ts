import { Module } from '@nestjs/common';
import { HttpModule } from './infrastructure/http/http.module.js';

@Module({
  imports: [HttpModule],
})
export class AppModule {}
