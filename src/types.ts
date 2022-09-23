import { Blogger } from './schemas/blogger.schema';
import { Post } from './schemas/post.schema';
import { Comment } from './schemas/comment.schema';
import { User } from './schemas/user.schema';



export class CustomResponseType {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: Blogger[] | Post[] | Comment[] | User[];
}


