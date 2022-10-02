import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from '../../schemas/user.schema';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: `${process.env.ACCESS_TOKEN_SECRET}`,
    });
  }

  async validate(payload: any) {
    
    const user: User = await this.usersService.getUserById(payload.sub);
    const {
      _id,
      accountData: { userName, email },
    } = user;
    return { sub: _id, username: userName, email };
  }
}
