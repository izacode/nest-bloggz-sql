import { User } from '../../users/user.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class RevokedRefreshToken {
  @Column()
  token: string;

  @ManyToOne(() => User, (u) => u.id)
  user: User;

  @Column()
  userId: User;
}
