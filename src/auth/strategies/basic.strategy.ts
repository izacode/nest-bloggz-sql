import { BasicStrategy as Strategy } from 'passport-http';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy) {
  constructor(private config: ConfigService) {
    super();
  }

  public validate = async (
    username: string,
    password: string,
  ): Promise<boolean> => {
    if (
      await this.config.get("BASIC_AUTH_USERNAME") === username &&
      await this.config.get("BASIC_AUTH_PASSWORD") === password
    ) {
      return true;
    }
    throw new UnauthorizedException();
  };
}
