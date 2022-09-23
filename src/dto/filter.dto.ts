import { IsOptional } from 'class-validator';

export class FilterDto {
  @IsOptional()
  SearchNameTerm?: string = '';
  @IsOptional()
  PageNumber?: string | number = 1;
  @IsOptional()
  PageSize?: string | number = 10;
}
