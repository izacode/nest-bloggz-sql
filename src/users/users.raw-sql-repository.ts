import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ObjectId } from 'mongodb';

import { FilterDto } from '../dto/filter.dto';
import { CustomResponseType } from 'src/types';
import { User } from '../schemas/user.schema';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class UsersRawSqlRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  userMapper(user) {}

  async checkRevokedTokensList(
    refreshToken: string,
    _id: string,
  ): Promise<Boolean> {
    const result = await this.dataSource.query(
      `
    SELECT token, "userId"
	  FROM public."RevokedRefreshTokens"
    WHERE token = $1 && "userId" = $2;
    `,
      [refreshToken, _id],
    );

    return result ? true : false;
  }

  async updateRevokedTokensList(
    refreshToken: string,
    id: string,
  ): Promise<Boolean> {
    await this.getUserById(id);

    await this.dataSource.query(
      `
    INSERT INTO public."RevokedRefreshTokens"
    (token, "userId")
	  VALUES ($1, $2);
    `,
      [refreshToken, id],
    );
    return;
  }

  async getUsers(filterDto: FilterDto): Promise<CustomResponseType> {
    const { PageNumber, PageSize } = filterDto;
    const offset = (+PageNumber - 1) * +PageSize || 0;
    const users = await this.dataSource.query(
      `
      SELECT id, "userName" as login
	    FROM public."Users"
      LIMIT $1 OFFSET $2;
    `,
      [+PageSize, offset],
    );

    const totalCount: number = await this.dataSource.query(`
    SELECT COUNT(*)
    FROM "Users"
    `);

    const customResponse = {
      pagesCount: Math.ceil(totalCount / +PageSize),
      page: +PageNumber,
      pageSize: +PageSize,
      totalCount,
      items: users,
    };
    return customResponse;
  }
  async createUser(user: any): Promise<any> {
    const {
      accountData: { email, userName, passwordHash, createdAt },
      emailConfirmation: { isConfirmed, confirmationCode, expirationDate },
    } = user;
    await this.dataSource.query(
      `
    INSERT INTO public."Users"
    (email, "userName", "passwordHash", "createdAt", "isConfirmed", "confirmationCode", "expirationDate")
	  VALUES ($1, $2, $3, $4, $5, $6, $7);
    `,
      [
        email,
        userName,
        passwordHash,
        createdAt,
        isConfirmed,
        confirmationCode,
        expirationDate,
      ],
    );

    const createdUser = await this.findUserByEmail(email);
    // add _id to returned user
    user._id = createdUser._id;
    // ========================

    return user;
  }

  async findUserByLogin(login: string): Promise<User | null> {
    const user = await this.dataSource.query(
      `
    SELECT "passwordHash", "userName", id , email
    FROM "Users"
    WHERE "userName" = $1
    `,
      [login],
    );
    if (user.length === 0) return null;
    const {id, email, userName, passwordHash} = user[0]
   
    const dataToReturn = {
      _id: id,
      accountData: {
        email,
        userName,
        passwordHash,

      },
    };

    return dataToReturn as User;
  }

  async findUserByEmail(email: string): Promise<User> {
    const user = await this.dataSource.query(
      `
    SELECT id as _id, email, "confirmationCode"
    FROM "Users"
    WHERE email = $1
    `,
      [email],
    );
    if (user.length === 0) return null;
  
    return user[0];
  }

  async getUserById(id): Promise<User | null> {
   
    let user = await this.dataSource.query(
      `
    SELECT id, "userName", email
    FROM "Users"
    WHERE id = $1
    `,
      [id],
    );
    if (user.length === 0) throw new NotFoundException();
    const {userName, email} = user[0]   

    const userToReturn = {
      _id: user[0].id,
      accountData: {
        userName,
        email,
      },
    }
    return userToReturn as User;
  }

  async findUserByConfirmationCode(code: string): Promise<User | null> {
    let user = await this.dataSource.query(
      `
    SELECT id, "expirationDate"
    FROM "Users"
    WHERE "confirmationCode" = $1
    `,
      [code],
    );
    let userToReturn;
    if (user.length === 0) throw new NotFoundException();
    userToReturn = {
      _id: user[0].id,
      emailConfirmation: {
        expirationDate: user[0].expirationDate,
      },
    };
    return userToReturn;
  }

  async updateConfirmationStatus(_id: string): Promise<boolean> {
    await this.dataSource.query(
      `
    UPDATE public."Users"
	  SET "isConfirmed"= true
	  WHERE id = $1;
    `,
      [_id],
    );
    return true;
  }

  async updateConfirmationCode(_id: string, newCode: string): Promise<boolean> {
    await this.dataSource.query(
      `
    UPDATE public."Users"
	  SET "confirmationCode"= $2
	  WHERE id = $1;
    `,
      [_id, newCode],
    );
    return true;
  }

  async updateSentEmails(_id: string, email: string): Promise<boolean> {
    await this.dataSource.query(
      `
    INSERT INTO public."SentEmails"
    ("sentEmail", "userId", "sentAt")
    VALUES ($3, $1, $2);
  `,
      [_id, new Date().toISOString(), email],
    );
    return true;
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      await this.getUserById(id);
    } catch (error) {
      console.log(error.message);
    }

    await this.dataSource.query(
      `
     DELETE FROM public."Users"
	   WHERE id = $1;
     `,
      [id],
    );
    return true;
  }

  // Ips and requests================================================================
  // async deleteAllIps() {
  //   await this.attemptModel.deleteMany({});
  //   const totalCount: number = await this.attemptModel.countDocuments({});
  //   if (totalCount !== 0) return false;
  //   return true;
  // }
  // async deleteAllRequests() {
  //   await requestsCollection.deleteMany({});
  //   const totalCount: number = await requestsCollection.countDocuments({});
  //   if (totalCount !== 0) return false;
  //   return true;
  // }
  // async saveRequests(income: any): Promise<boolean> {
  //   await requestsCollection.insertOne(income);

  //   const isAdded = await requestsCollection.findOne({ requestIp: income.requestIp });
  //   if (!isAdded) return false;
  //   return true;
  // }
  // async getAllRequests() {
  //   const list = await registrationIpCollection.find().toArray();
  //   return list;
  // }
}
