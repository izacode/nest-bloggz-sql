import { User } from '../../users/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class CommentReaction {
  @PrimaryGeneratedColumn()
  commentId: string;

  @Column()
  likeStatus: string;

  @ManyToOne(() => User, (u) => u.id)
  user: User;

  @Column()
  userId: string;
}
