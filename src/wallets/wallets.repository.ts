import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { Wallet } from './wallet.entity';


@Injectable()
export class WalletsRepo {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(Wallet) protected walletsReposiory: Repository<Wallet>,
  ) {}
  async create(createWalletDto: CreateWalletDto): Promise<void> {
    await this.walletsReposiory.save(createWalletDto);
    return;
    // return this.dataSource.query(
    //   `
    // INSERT INTO public."Wallets"
    // ("currency")
    // VALUES ($1)`,
    //   [currency],
    // );
  }
}
