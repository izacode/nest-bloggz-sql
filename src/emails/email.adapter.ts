import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class EmailAdapter {
  constructor(
    private config: ConfigService,
    @InjectDataSource() protected dataSource: DataSource,
  ) {}
  async sendEmail(email: string, subject: string, message: string) {
    //  1) Create transport object
    let transport = nodemailer.createTransport({
      service: 'gmail',

      auth: {
        user: await this.config.get('EMAIL_ADAPTER_USER'),
        pass: await this.config.get('EMAIL_ADAPTER_PASSWORD'),
      },
    });
    const sentAt = new Date();
    // 2) Send email with defined transport object
    let info = await transport.sendMail({
      from: process.env.EMAIL_ADAPTER_TEST_EMAIL_FROM, // sender address
      to: email,
      subject: subject,
      html: message,
    });

    if (info.accepted[0] === email) this.updateSentEmails(email, sentAt);
    return info.accepted[0] === email;
  }

  async updateSentEmails(email: string, sentAt: Date) {
    const user = await this.dataSource.query(
      `
    SELECT id
    FROM public."Users"
    WHERE email = $1
    `,
      [email],
    );

    await this.dataSource.query(
      `
    INSERT INTO public."SentEmails"(
	"sentEmail", "userId", "sentAt")
	VALUES ($1, $2, $3)
    `,
      [email, user.id, sentAt],
    );
  }
}
