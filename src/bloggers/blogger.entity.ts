import { Post } from '../posts/post.entity';
import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';


@Entity()
export class Blogger extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  name: string;
  @Column()
  youtubeUrl: string;
  @Column()
  createdAt: string;
  @OneToMany(() => Post, (p) => p.blogger)
  post: Post[];
}
