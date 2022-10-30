import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
console.log('inside wallet controller')

@Controller('wallets')
export class WalletsController {
  constructor(protected walletsService: WalletsService) {}

  @Post()
  create(@Body() createWalletDto: CreateWalletDto) {

    return this.walletsService.create(createWalletDto);
  }
}
