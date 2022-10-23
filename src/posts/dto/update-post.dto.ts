import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdatePostDto {
  @IsNotEmpty()
  @MaxLength(30)
  title: string;
  @IsNotEmpty()
  @MaxLength(100)
  shortDescription: string;
  @IsNotEmpty()
  @MaxLength(1000)
  content: string;
  @IsNotEmpty()
  @IsString()
  blogId: string;
}
