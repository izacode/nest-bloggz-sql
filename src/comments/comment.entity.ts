import { User } from '../users/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Post } from '../posts/post.entity';

@Entity()
export class Comment extends Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  content: string;

  @Column()
  userLogin: string;
  @Column()
  addedAt: string;

  @Column()
  myStatus: string;

  @Column()
  likesCount: number;
  
  @Column()
  dislikesCount: number;

  @ManyToOne(() => User, (u) => u.id)
  user: User;
  @Column()
  userId: string;

  @ManyToOne(() => Post, (p) => p.id)
  post: Post;
  @Column()
  postId: string;
}
