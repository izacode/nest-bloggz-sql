import { IsNotEmpty, Length } from "class-validator";


export class LoginDto {
  @IsNotEmpty()
  @Length(3, 10)
  login: string;

  @IsNotEmpty()
  @Length(6, 20)
  password: string;
}
