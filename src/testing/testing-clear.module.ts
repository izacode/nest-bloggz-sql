import { Module } from '@nestjs/common';
import { TestingClearController } from './testing-clear.controller';
import { TestingClearService } from './testing-clear.service';

@Module({
  controllers: [TestingClearController],
  providers: [TestingClearService],
})
export class TestingClearModule {}
