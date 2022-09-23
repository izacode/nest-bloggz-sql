import { IsIn, IsNotEmpty } from 'class-validator';

export class LikeStatusDto {
  @IsNotEmpty()
  @IsIn(['Like', 'Dislike', 'None'])
  likeStatus: string;
}
