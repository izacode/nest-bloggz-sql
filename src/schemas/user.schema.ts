import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';
@Schema()
export class UserAccount extends Document {
  @Prop()
  email: string;
  @Prop()
  userName: string;
  @Prop()
  passwordHash: string;
  @Prop({ default: new Date() })
  createdAt: Date;
  @Prop()
  ip: string;
  @Prop([String])
  revokedRefreshTokens: string[];
}

export const UserAccountSchema = SchemaFactory.createForClass(UserAccount);
@Schema()
export class LoginAttempt extends Document {
  @Prop()
  attemptDate: Date;
  @Prop()
  ip: string;
}

export const LoginAttemptSchema = SchemaFactory.createForClass(LoginAttempt);
@Schema()
export class SentConfirmationEmails {
  @Prop()
  sentDate: Date;
}
//   {
//     sentDate: {
//       type: Date,
//       required: true,
//     },
//   },
//   {
//     _id: false,
//   },
// );

export const SentConfirmationEmailsSchema = SchemaFactory.createForClass(
  SentConfirmationEmails,
);
@Schema()
export class EmailConfirmation extends Document {
  @Prop()
  isConfirmed: boolean;
  @Prop()
  confirmationCode: string;
  @Prop()
  expirationDate: Date;
  @Prop({ type: [SentConfirmationEmailsSchema] })
  sentEmails: SentConfirmationEmails[];
}

export const EmailConfirmationSchema =
  SchemaFactory.createForClass(EmailConfirmation);

@Schema()
export class User extends Document {

  @Prop({ type: UserAccountSchema })
  accountData: UserAccount;
  @Prop({ type: [LoginAttemptSchema] })
  loginAttempts: LoginAttempt[];
  @Prop({ type: EmailConfirmationSchema })
  emailConfirmation: EmailConfirmation;
}

export const UserSchema = SchemaFactory.createForClass(User)
