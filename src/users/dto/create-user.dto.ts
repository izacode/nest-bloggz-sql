import { IsNotEmpty, Length, Matches } from "class-validator";


export class CreateUserDto {
  @IsNotEmpty()
  @Length(3, 10)
  login: string;

  @Matches(/^[\w\.]+@([\w]+\.)+[\w]{2,4}$/)
  email: string;
  
  @IsNotEmpty()
  @Length(6,20)
  password: string;
}