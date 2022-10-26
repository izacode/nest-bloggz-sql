import { Column, Entity } from 'typeorm';

@Entity()
export class Attempt extends Document {
  @Column()
  ip: string;
  @Column()
  attemptDate: Date;
  @Column()
  url: string;
}
