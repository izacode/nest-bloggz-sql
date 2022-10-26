import { Column, PrimaryGeneratedColumn } from 'typeorm';

export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  email: string;
  @Column()
  userName: string;
  @Column()
  passwordHash: string;
  @Column()
  createdAt: Date;
  @Column()
  isConfirmed: boolean;
  @Column()
  confirmationCode: string;
  @Column()
  expirationDate: string;
}
