import { Column, Entity } from 'typeorm';

@Entity()
export class Attempt {
  @Column()
  ip: string;
  @Column()
  attemptDate: Date;
  @Column()
  url: string;
}
