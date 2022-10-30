import { Blogger } from "./bloggers/blogger.entity";
import { Post } from "./posts/post.entity";
import { User } from "./users/user.entity";
import { Comment } from "./comments/comment.entity";




export class CustomResponseType {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: Blogger[] | Post[] | Comment[] | User[];
}


