import { User } from '../../users/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Post } from '../../posts/post.entity';

@Entity()
export class PostReaction {
  @PrimaryGeneratedColumn()
  commentId: string;

  @Column()
  addedAt: string;

  @ManyToOne(() => User, (u) => u.id)
  user: User;
  @Column()
  userId: string;

  @ManyToOne(() => Post, (p) => p.id)
  post: Post;
  @Column()
  postId: string;

  @Column()
  likeStatus: string;
}
