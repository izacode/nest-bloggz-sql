import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  ParseUUIDPipe,
  Post,
  Get,
  UseGuards,
  Res,
} from '@nestjs/common';


import { CurrentUserData } from '../common/current-user-data.param.decorator';
// import { JwtService } from './application/jwt.service';
import { EmailDto } from '../dto/email.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth-guard';
import { LocalAuthGuard } from './guards/local-auth-guard';
import { Response } from 'express';
import { Cookies } from '../common/cookies.param.decorator';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private config: ConfigService,
  ) {}

  @HttpCode(204)
  @Post('/registration')
  async registerUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.createUser(createUserDto);
  }

  @HttpCode(204)
  @Post('/registration-confirmation')
  async confirmRegistration(@Body('code', ParseUUIDPipe) code: string) {
    return this.authService.confirmEmail(code);
  }

  @HttpCode(204)
  @Post('/registration-email-resending')
  async resendConfirmaitionEmail(@Body() emailDto: EmailDto) {
    const result = await this.authService.resendConfirmaitionEmail(emailDto);
    if (!result) throw new BadRequestException();
    return;
  }

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  @HttpCode(200)
  async login(
    @CurrentUserData() currentUserData: any,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { sub, username } = currentUserData;
    const payload = { username, sub };

    // IIFE solution
    // let payload = (({ sub, username }) => ({ sub, username }))(currentUserData);
 

    const accessToken = await this.authService.createToken(
      payload,
      await this.config.get('ACCESS_TOKEN_SECRET'),
      await this.config.get('JWT_ACCESS_EXPIRATION'),
    );

    const refreshToken = await this.authService.createToken(
      payload,
      await this.config.get('REFRESH_TOKEN_SECRET'),
      await this.config.get('JWT_REFRESH_EXPIRATION'),
    );

    // response.cookie('refreshToken', refreshToken);
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
    });

    return { accessToken, refreshToken };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/me')
  async showUserInfo(@CurrentUserData() currentUserData: any) {
    const userInfo = {
      email: currentUserData.email,
      login: currentUserData.username,
      userId: currentUserData.sub,
    };
    return userInfo;
  }

  @Post('refresh-token')
  async refreshTokens(
    @Cookies('refreshToken') refreshToken: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { sub, username } = await this.authService.validateToken(
      refreshToken,
    );
    const payload = { sub, username };

    await this.usersService.updateRevokedTokensList(refreshToken, payload.sub);

    const accessToken = await this.authService.createToken(
      payload,
      await this.config.get('ACCESS_TOKEN_SECRET'),
      await this.config.get('JWT_ACCESS_EXPIRATION'),
    );
    const newRefreshToken = await this.authService.createToken(
      payload,
      await this.config.get('REFRESH_TOKEN_SECRET'),
      await this.config.get('JWT_REFRESH_EXPIRATION'),
    );

    response.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: true,
    });

    return { accessToken };
  }
  @HttpCode(204)
  @Post('/logout')
  async logoutUser(
    @Cookies('refreshToken') refreshToken: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { sub } = await this.authService.validateToken(refreshToken);

    await this.usersService.updateRevokedTokensList(refreshToken, sub);

    response.clearCookie('refreshToken', {
      // httpOnly: true,
      // secure: true,
    });
  }
}
