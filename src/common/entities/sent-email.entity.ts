import { User } from '../../users/user.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class SentEmail {
  @Column()
  sentEmail: string;

  @Column()
  sentAt: Date

  @ManyToOne(() => User, (u) => u.id)
  user: User;

  @Column()
  userId: User;
}

