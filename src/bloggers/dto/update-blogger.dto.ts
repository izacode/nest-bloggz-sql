import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';

// export class UpdateBloggerDto extends PartialType(CreateBloggerDto){}  //needs @nestjs/mapped-types to be installed
export class UpdateBloggerDto {
  @IsOptional()
  id: string;

  @IsNotEmpty()
  @Length(1, 15)
  name: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  youtubeUrl: string;
}
