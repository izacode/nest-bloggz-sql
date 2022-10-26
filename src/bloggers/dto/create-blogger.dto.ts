import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateBloggerDto {
  @IsNotEmpty()
  @Length(1, 15)
  name: string;

  @IsString()
  @MaxLength(100)
  @Matches(/^https:\/\/([\w-]+\.)+[\w-]+(\/[\w-]+)*\/?$/)
  youtubeUrl: string;
 
}
