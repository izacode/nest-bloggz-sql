import { Injectable } from '@nestjs/common';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { WalletsRepo } from './wallets.repository';

@Injectable()
export class WalletsService {
  constructor(protected walletsRepository: WalletsRepo){}
 async create(createWalletDto: CreateWalletDto) {
    return this.walletsRepository.create(createWalletDto);
  }
}
