import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { HttpExceptionFilter } from './../src/exception.filter';
import { AppModule } from './../src/app.module';
import { Any, DataSource } from 'typeorm';
import { getAppAndCleanDB } from './../test/test-utils';
import { CustomResponseType } from '../src/types';
import { isUUID } from 'class-validator';

let userId: string;
let newUser;
let accessToken: string;
let refreshToken: string;

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  beforeAll(async () => {
    app = await getAppAndCleanDB();
  });
  afterAll(async () => {
    await app.close();
  });

  //   REGISTERING USER =======================================================================================================================
  describe('Register user', () => {
    it('Should return an error if unaccepted login is provided, status 400 ', async () => {
      return request(app.getHttpServer())
        .post('/auth/registration')
        .send({
          login: 'us',
          email: 'user1@user.com',
          password: '123456',
        })
        .expect(400);
    });
    it('Should return an error if unaccepted email is provided, status 400 ', async () => {
      return request(app.getHttpServer())
        .post('/auth/registration')
        .send({
          login: 'user1',
          email: 'user1user.com',
          password: '123456',
        })
        .expect(400);
    });
    it('Should return an error if unaccepted password is provided, status 400 ', async () => {
      return request(app.getHttpServer())
        .post('/auth/registration')
        .send({
          login: 'user1',
          email: 'user1@user.com',
          password: '12345',
        })
        .expect(400);
    });
    it('Should return  status 204 and register user ', async () => {
      return request(app.getHttpServer())
        .post('/auth/registration')
        .send({
          login: 'user1',
          email: 'user1@user.com',
          password: '123456',
        })
        .expect(204);
    });
    it('Should return  status 400 if user has been registred with same login or email ', async () => {
      return request(app.getHttpServer())
        .post('/auth/registration')
        .send({
          login: 'user1',
          email: 'user1@user.com',
          password: '123456',
        })
        .expect(400);
    });

    it('Should return  status 429 if more then 5 requests from current IP ', async () => {
      return request(app.getHttpServer())
        .post('/auth/registration')
        .send({
          login: 'user3',
          email: 'user3@user.com',
          password: '123456',
        })
        .expect(429);
    });
  });

  //   REGISTRATION CONFIRMATION ==============================================================================================================
  //                  Create a user and find it by id to have access to confirmaiton code and other stuff
  describe('create and get user', () => {
    it('create user', async () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          login: 'user3',
          email: 'user3@user.com',
          password: '123456',
        })
        .expect(201)
        .then(({ body }) => {
          userId = body.id;
          expect(body).toEqual({
            id: userId,
            login: 'user3',
          });
        });
    });
    it('Should return a new user with status 200 ', async () => {
      return request(app.getHttpServer())
        .get(`/users/${userId}`)
        .expect(200)
        .then(({ body }) => {
          newUser = body;
          expect(body.id).toEqual(userId);
        });
    });
  });
  //                  ------------------------------------------------------------------------------
  describe('registration confirmation', () => {
    it('should return 400 if confirmation code is not of uuid type', async () => {
      return request(app.getHttpServer())
        .post('/auth/registration-confirmation')
        .send({
          code: 'uhuoih',
        })
        .expect(400);
    });
    it('should return 404 user is not found', async () => {
      return request(app.getHttpServer())
        .post('/auth/registration-confirmation')
        .send({
          code: 'ccb61fc5-2195-40a4-88f9-2d0752afdb6b',
        })
        .expect(404);
    });
    it('should return 204 and change confitmaiton status to true', async () => {
      return request(app.getHttpServer())
        .post('/auth/registration-confirmation')
        .send({
          code: newUser.confirmationCode,
        })
        .expect(204);
    });

    it('should return 400 if confirmed already', async () => {
      return request(app.getHttpServer())
        .post('/auth/registration-confirmation')
        .send({
          code: newUser.confirmationCode,
        })
        .expect(400);
    });

    it('should return 400 if email confirmation is expired', async () => {
      setTimeout(() => {
        return request(app.getHttpServer())
          .post('/auth/registration-confirmation')
          .send({
            code: newUser.confirmationCode,
          })
          .expect(400);
      }, 30000);
    });
  });

  //   REGISTRATION EMAIL RESENDING ============================================================================================================
  describe('Registration email resending', () => {
    it('should return 400 if email is invalid', async () => {
      return request(app.getHttpServer())
        .post('/auth/registration-email-resending')
        .send({
          email: 'emailemail.com',
        })
        .expect(400);
    });
    it('should return 404 if user with this email is not found', async () => {
      return request(app.getHttpServer())
        .post('/auth/registration-email-resending')
        .send({
          email: 'email@email.com',
        })
        .expect(404);
    });
    it('should return 204 if registration email has been resend successfully', async () => {
      return request(app.getHttpServer())
        .post('/auth/registration-email-resending')
        .send({
          email: newUser.email,
        })
        .expect(204);
    });
  });

  //   LOGIN USER ==============================================================================================================================
  describe('Login user in', () => {
    it('should return 400 if login is invalid', async () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          login: 'as',
          password: '123456',
        })
        .expect(400);
    });
    it('should return 400 if password is invalid', async () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          login: 'user3',
          password: '12345',
        })
        .expect(400);
    });
    it('should return 401 if wrong login', async () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          login: 'aser5',
          password: '123456',
        })
        .expect(401);
    });
    it('should return 401 if wrong password', async () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          login: 'aser3',
          password: '123455',
        })
        .expect(401);
    });
    it('should return 200 and pair of access and refresh tokens', async () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          login: 'user3',
          password: '123456',
        })
        .expect(200)
        .then(({ body }) => {
          accessToken = body.accessToken;
          refreshToken = body.refreshToken;

          expect(body).toEqual({
            accessToken: expect.any(String),
            refreshToken: expect.any(String),
          });
        });
    });
  });

  //   GET INFO ABOUT CURRENT USER ('/me') =====================================================================================================
  describe('/auth/me', () => {
    it('should return 401 if user is unauthorized', async () => {
      return request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', 'bearer ' + 'wrong token')
        .expect(401);
    });
    it('should return 200 and user information', async () => {
      return request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', 'bearer ' + accessToken)
        .expect(200)
        .then(({ body }) => {
          expect(body).toEqual({
            email: newUser.email,
            login: newUser.userName,
            userId: newUser.id,
          });
        });
    });
  });
  //   UPDARTE TOKENS =====================================================================================================
  describe('/auth/refresh-token', () => {
    it('should return 401 if user is unauthorized', async () => {
      return request(app.getHttpServer())
        .post('/auth/refresh-token')
        .set('Authorization', 'bearer ' + 'wrong token')
        .expect(401);
    });
    it('should return 200 and new accesstoken', async () => {
      // const resp = await request(app.getHttpServer())
      //   .post('/auth/refresh-token')
      //   .set('Cookie', [`refreshToken=${refreshToken}`]);
      // const cookies = resp.headers['set-cookie'];

      return request(app.getHttpServer())
        .post('/auth/refresh-token')
        .set('Cookie', [`refreshToken=${refreshToken}`])
        .expect(200)
        .then(({ body, headers }) => {
          refreshToken = headers['set-cookie'][0].split(';')[0].split('=')[1];
          accessToken = body.accessToken;
          expect(body).toEqual({
            accessToken: expect.any(String),
          });
        });
    });
  });

  //   LOGOUT USER =====================================================================================================
  describe('/auth/logout', () => {
    it('should return 401 if user is unauthorized', async () => {
      return request(app.getHttpServer())
        .post('/auth/logout')
        .set('Cookie', [`refreshToken=wrongToken`])
        .expect(401);
    });
    it('should return 200 and log user out', async () => {
      return request(app.getHttpServer())
        .post('/auth/logout')
        .set('Cookie', [`refreshToken=${refreshToken}`])
        .expect(204);
    });
  });
});
