import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { LoginDto } from '../dto/login.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({ usernameField: 'login' });
  }

  async validate(login: string, password: string): Promise<any> {
    ;
    const loginDto: LoginDto = {
      login,
      password,
    };

    let allErrors = [];

    if (login.trim() === '') {
      allErrors.push({
        message: 'Validation failed (Empty login field)',
        field: 'login',
      });
    }
    if (login.length < 3) {
      allErrors.push({
        message: 'Validation failed (Login should be longer then 3)',
        field: 'login',
      });
    }
    if (login.length > 10) {
      allErrors.push({
        message: 'Validation failed (Login should be shorter then 10)',
        field: 'login',
      });
    }
    if (password.length < 6) {
      allErrors.push({
        message: 'Validation failed ((Password should be longer then 6)',
        field: 'password',
      });
    }
    if (password.length > 20) {
      allErrors.push({
        message: 'Validation failed (Password should be shorter then 20)',
        field: 'password',
      });
    }
    if (password.trim() === '') {
      allErrors.push({
        message: 'Validation failed (Password field is empty)',
        field: 'password',
      });
    }
    if (allErrors.length > 0) throw new BadRequestException(allErrors);

    const user = await this.authService.validateUser(loginDto);

    if (!user) {
      throw new UnauthorizedException();
    }

    return {
      username: user.accountData.userName,
      email: user.accountData.email,
      sub: user._id,
    };
  }
}
