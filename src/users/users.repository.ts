// import {
//   Injectable,
//   NotFoundException,
//   UnauthorizedException,
// } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model, Types } from 'mongoose';
// import { ObjectId } from 'mongodb';

// import { FilterDto } from '../dto/filter.dto';
// import { CustomResponseType } from 'src/types';
// import { User } from '../schemas/user.schema';

// @Injectable()
// export class UsersRepository {
//   @InjectModel(User.name) private userModel: Model<User>;
//   // @InjectModel(Attempt.name) private attemptModel: Model<Attempt>;

//   async checkRevokedTokensList(
//     refreshToken: string,
//     _id: string,
//   ): Promise<Boolean> {
//     const doc = await this.userModel.findById({ _id: new ObjectId(_id) });

//     if (!doc) throw new UnauthorizedException();

//     return doc.accountData.revokedRefreshTokens.includes(refreshToken);
//   }
//   async updateRevokedTokensList(
//     refreshToken: string,
//     id: string,
//   ): Promise<Boolean> {
//     const doc = await this.userModel.findById({ _id: new ObjectId(id) });
//     if (!doc) throw new UnauthorizedException();
//     doc.accountData.revokedRefreshTokens.push(refreshToken);
//     await doc.save();
//     return;
//   }
//   async getUsers(filterDto: FilterDto): Promise<CustomResponseType> {
//     const { PageNumber = 1, PageSize = 10 } = filterDto;
//     const users = await this.userModel
//       .find({}, { _id: 0, 'accountData.userName': 1, 'accountData.email': 1 })
//       // .find({}, '-_id -accountData.passwordHash -passwordSalt -__v')
//       //   .find({}, { projection: { _id: 0, passwordHash: 0, passwordSalt: 0 } })
//       .skip((+PageNumber - 1) * +PageSize)
//       .limit(+PageSize)
//       .sort({ id: 1 })
//       .exec();

//     const totalCount: number = await this.userModel.countDocuments();

//     const customResponse = {
//       pagesCount: Math.ceil(totalCount / +PageSize),
//       page: +PageNumber,
//       pageSize: +PageSize,
//       totalCount,
//       items: users,
//     };
//     return customResponse;
//   }
//   async createUser(user: any): Promise<any> {
  
//     await this.userModel.create(user);
//     const createdUser = await this.userModel.findOne({ _id: user._id });
//     return createdUser;
//   }
//   async createUser1(user: any): Promise<any> {

//     await this.userModel.create(user);
//     const createdUser = await this.userModel.findOne({ _id: user._id }, {"_id": 0, id: user._id, login: user.accountData.userName});
//     return createdUser;
//   }
//   // async findUserByLoginOrEmail(login: string, email: string): Promise<User> {
//   //   const user = await this.userModel
//   //     .findOne({
//   //       $or: [
//   //         { 'accountData.userName': login },
//   //         { 'accountData.email': email },
//   //       ],
//   //     })
//   //     .exec();
//   //   if (!user) throw new NotFoundException();
//   //   return user;
//   // }
//   async findUserByLogin(login: string): Promise<User | null> {
//     const user = await this.userModel.findOne({
//       'accountData.userName': login,
//     });
//     if (!user) return null;
//     return user;
//   }

//   async findUserByEmail(email: string): Promise<User> {
//     const user = await this.userModel.findOne({ 'accountData.email': email });
//     if (!user) throw new NotFoundException();
//     return user;
//   }

//   async getUserById(_id: ObjectId): Promise<User | null> {
//     const user = await this.userModel.findOne({ _id });
//     if (!user) throw new NotFoundException();
//     return user;
//   }

//   async findUserByConfirmationCode(code: string): Promise<User | null> {
//     const user = await this.userModel.findOne({
//       'emailConfirmation.confirmationCode': code,
//     });
//     return user;
//   }

//   async updateConfirmationStatus(_id: ObjectId): Promise<boolean> {
//     const result = await this.userModel.updateOne(
//       { _id },
//       { $set: { 'emailConfirmation.isConfirmed': true } },
//     );

//     return result.matchedCount === 1;
//   }

//   async updateConfirmationCode(
//     _id: ObjectId,
//     newCode: string,
//   ): Promise<boolean> {
//     const result = await this.userModel.updateOne(
//       { _id },
//       { $set: { 'emailConfirmation.confirmationCode': newCode } },
//     );
//     return result.matchedCount === 1;
//   }

//   async updateSentEmails(_id: ObjectId): Promise<boolean> {
//     const doc = await this.userModel.findById({ _id });
//     doc.emailConfirmation.sentEmails.push({ sentDate: new Date() });
//     await doc.save();
//     return true;
//   }

//   async deleteUser(_id: ObjectId): Promise<boolean> {
//     try {
//       await this.getUserById(_id);
//     } catch (error) {
//       console.log(error.message);
//     }
//     const isDeleted = await this.userModel.deleteOne({ _id });
//     return isDeleted.deletedCount === 1;
//   }

//   async deleteAllUsers() {
//     await this.userModel.deleteMany({});
//     const totalCount: number = await this.userModel.countDocuments({});
//     if (totalCount !== 0) return false;
//     return true;
//   }

//   async deleteAllUsersAccount() {
//     await this.userModel.deleteMany({});
//     const totalCount: number = await this.userModel.countDocuments({});
//     if (totalCount !== 0) return false;
//     return true;
//   }

//   // Ips and requests================================================================
//   // async deleteAllIps() {
//   //   await this.attemptModel.deleteMany({});
//   //   const totalCount: number = await this.attemptModel.countDocuments({});
//   //   if (totalCount !== 0) return false;
//   //   return true;
//   // }
//   // async deleteAllRequests() {
//   //   await requestsCollection.deleteMany({});
//   //   const totalCount: number = await requestsCollection.countDocuments({});
//   //   if (totalCount !== 0) return false;
//   //   return true;
//   // }
//   // async saveRequests(income: any): Promise<boolean> {
//   //   await requestsCollection.insertOne(income);

//   //   const isAdded = await requestsCollection.findOne({ requestIp: income.requestIp });
//   //   if (!isAdded) return false;
//   //   return true;
//   // }
//   // async getAllRequests() {
//   //   const list = await registrationIpCollection.find().toArray();
//   //   return list;
//   // }
// }
