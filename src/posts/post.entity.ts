
import { Blogger } from '../bloggers/blogger.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';


@Entity()
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  title: string;
  @Column()
  shortDescription: string;
  @Column()
  content: string;

  @Column()
  bloggerName: string;
  @Column()
  createdAt: string;
  @Column()
  likesCount: number;
  @Column()
  dislikesCount: number;
  @Column()
  myStatus: string;
  @ManyToOne(() => Blogger, (b) => b.id)
  blogger: Blogger;
  @Column()
  bloggerId: string;
}
