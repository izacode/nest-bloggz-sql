import { Module } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { WalletsController } from './wallets.controller';
import { WalletsRepository } from './wallets.repository';

@Module({
  controllers: [WalletsController],
  providers: [WalletsService, WalletsRepository]
})
export class WalletsModule {}
