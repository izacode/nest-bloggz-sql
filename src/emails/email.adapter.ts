import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailAdapter {
  constructor(private config: ConfigService) {}
  async sendEmail(email: string, subject: string, message: string) {
    //  1) Create transport object
    let transport = nodemailer.createTransport({
      service: 'gmail',

      auth: {
        user: await this.config.get('EMAIL_ADAPTER_USER'),
        pass: await this.config.get('EMAIL_ADAPTER_PASSWORD'),
      },
    });

    // 2) Send email with defined transport object
    let info = await transport.sendMail({
      from: process.env.EMAIL_ADAPTER_TEST_EMAIL_FROM, // sender address
      to: email,
      subject: subject,
      html: message,
    });
   
    return info.accepted[0] === email;
  }
}
