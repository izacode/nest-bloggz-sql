// import { UserAccountDBType } from '../types/types';
import { Injectable } from '@nestjs/common';
import { User } from 'src/schemas/user.schema';
import { EmailAdapter } from './email.adapter';

@Injectable()
export class EmailManager {
  constructor(private emailAdapter: EmailAdapter) {}
  async sendPasswordRecoveryMessage(email: string) {
    const subject: string = `This is password recovery message`;
    const message: string =
      "<H1>This is password recovery message , if you didn't ask for it , please ignire<H1/>";
    const info = await this.emailAdapter.sendEmail(email, subject, message);
    return info;
  }
  async sendEmailConfirmationMassage(user: User) {
    // 1) Destructure email and confirmaitonCode from user
    let {
      emailConfirmation: { confirmationCode },
      accountData: { email },
    } = user;

    // 2) Create subject and message for Confifmation email
    const subject: string = 'This is email confirmation message';
    const message: string = `<H1> Please confirm your email <a href='https://somesite.com/confirm-email?code=${confirmationCode}'>confirm email <a/><H1/>`;

    //  3) Pass it to emailAdapter(Nodemailer)
    const result = await this.emailAdapter.sendEmail(email, subject, message);

    return result;
  }
}
