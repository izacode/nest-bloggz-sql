import { Injectable } from '@nestjs/common';

import { EmailManager } from './email.manager';

@Injectable()
export class EmailService {
  constructor(private emailManager: EmailManager) {}
  async recoverPassword(email: string) {
    const result = await this.emailManager.sendPasswordRecoveryMessage(email);
    return result;
  }
  async sendEmailConfirmationMassage(user) {
    const result = await this.emailManager.sendEmailConfirmationMassage(user);
    return result;
  }
}
