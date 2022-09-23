import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';

@Injectable()
export class WalletsRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  create(createWalletDto: CreateWalletDto) {
    const {title,currency, ownerId} = createWalletDto
    return this.dataSource.query(`
    INSERT INTO public."Wallets"
    ("Title", "Currency", "OwnerId")
	  VALUES ('Wine Euro', 'EUR', 3)`);
  }

  async findAll() {
    const result = await this.dataSource.query(`SELECT * FROM "Wallets"`);
    return result
  }

  async findOne(id: string) {
    const result = await this.dataSource.query(`SELECT * FROM "Wallets" AS w WHERE w."Id"=$1`, [id]);
    return result
  }

  update(id: number, updateWalletDto: UpdateWalletDto) {
    return `This action updates a #${id} wallet`;
  }

  remove(id: number) {
    return `This action removes a #${id} wallet`;
  }
}
