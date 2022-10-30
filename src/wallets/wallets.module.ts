import { Module } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { WalletsController } from './wallets.controller';
import { WalletsRepo } from './wallets.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from './wallet.entity';
console.log('inside wallet module');

@Module({
  imports: [TypeOrmModule.forFeature([Wallet])],
  controllers: [WalletsController],
  providers: [WalletsService, WalletsRepo],
})
export class WalletsModule {}
