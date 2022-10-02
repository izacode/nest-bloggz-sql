import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { v4 as uuidv4 } from 'uuid';
import * as datefns from 'date-fns';
import { ObjectId } from 'mongodb';

import { User } from '../schemas/user.schema';
import { UsersRepository } from '../users/users.repository';
import { EmailService } from '../emails/email.service';
import * as bcrypt from 'bcrypt';
import { EmailDto } from '../dto/email.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersRawSqlRepository } from '../users/users.raw-sql-repository';

@Injectable()
export class AuthService {
  constructor(
    private emailService: EmailService,
    private usersRepository: UsersRawSqlRepository,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<any> {
   
    const { login, email, password } = createUserDto;
    // const isUserExists = await this.usersRepository.findUserByLoginOrEmail(login, email)
    // if(isUserExists) throw new BadRequestException();
    const passwordHash = await this._generateHash(password);
    const user = {
      accountData: {
        userName: login,
        email,
        passwordHash,
        createdAt: new Date(),
        revokedRefreshTokens: [],
      },
      loginAttempts: [],
      emailConfirmation: {
        sentEmails: [], //Add to send emails, create counter or smth
        confirmationCode: uuidv4(),
        expirationDate: datefns.add(new Date(), {
          days: 1,
          hours: 0,
        }),
        isConfirmed: false,
      },
    };
    const createResult = await this.usersRepository.createUser(user);

    try {
      const result = await this.emailService.sendEmailConfirmationMassage(user);
      // const result = await emailManager.sendEmailConfirmationMassage(user);
      if (result) {
        await this.usersRepository.updateSentEmails(
          createResult._id,
          user.accountData.email,
        );
      }
    } catch (error) {
      await this.usersRepository.deleteUser(createResult._id);
    }

    return createResult;
  }

  async _generateHash(password: string) {
    const hashh = await bcrypt.hash(password, 10);
    return hashh;
  }

  async validateUser(loginDto: LoginDto) {
    const { login, password } = loginDto;
    const user: User | null = await this.usersRepository.findUserByLogin(login); 
    console.log(user)
    if (!user) throw new UnauthorizedException();
    const areHashesEqual = await this._isPasswordCorrect(
      password,
      user.accountData.passwordHash,
    );
    if (!areHashesEqual) throw new UnauthorizedException();
    return user;
  }

  async _isPasswordCorrect(password: string, hash: string) {
    console.log(password, hash)
    const isCorrect = await bcrypt.compare(password, hash);
    return isCorrect;
  }

  async confirmEmail(code: string): Promise<boolean> {
    const user: User = await this.usersRepository.findUserByConfirmationCode(
      code,
    );
    if (!user) return false;
    // if (user.emailConfirmation.isConfirmed) return false;
    if (user.emailConfirmation.expirationDate < new Date()) return false;
    let result: boolean = await this.usersRepository.updateConfirmationStatus(
      user._id,
    );
    return result;
  }
  async resendConfirmaitionEmail(emailDto: EmailDto): Promise<boolean> {
    const { email } = emailDto;
    // 1) Checking if user with this email exists
    const user: User = await this.usersRepository.findUserByEmail(email);
    if (!user) throw new NotFoundException();

    // if (user.emailConfirmation.expirationDate < new Date()) return false;
    // let result = await this.usersRepository.updateConfirmation(user._id);

    // 2) If exists -> generate new confirmation code
    const newConfirmationCode: string = uuidv4();

    // 3) Update this user's confirmation code
    await this.usersRepository.updateConfirmationCode(
      user._id,
      newConfirmationCode,
    );

    // 4) Getting this user again , but already with updated confirmation code, so we can pass it to resend confirmation email
    const updatedUser = await this.usersRepository.findUserByEmail(email);

    //  5-1) Trying to resend confirmatin email
    try {
      const result = await this.emailService.sendEmailConfirmationMassage(
        updatedUser,
      );

      if (result) {
        await this.usersRepository.updateSentEmails(user._id, email);
      }
      return result;
    } catch (error) {
      // 5-2) If there is an error, we are deleting this user
      await this.usersRepository.deleteUser(user._id);
      console.log('registration failed , pls try once again');
    }
    return false;
  }

  async createToken(payload: Object, secret: string, expiresIn: string) {
    const token = this.jwtService.sign(payload, { secret, expiresIn });
    return token;
  }

  async validateToken(token: string) {
    let result: any;
    try {
      result = this.jwtService.verify(token, {
        secret: process.env.REFRESH_TOKEN_SECRET,
      });
    } catch {
      throw new UnauthorizedException();
    }

    // if (!result)

    const isRevoked = await this.usersRepository.checkRevokedTokensList(
      token,
      result.sub,
    );
    if (isRevoked) throw new UnauthorizedException();

    return result;
  }
}
