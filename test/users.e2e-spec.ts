import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { getAppAndCleanDB } from './../test/test-utils';

let userId: string;
let newUser;

let customResponse = {
  pagesCount: 1,
  page: 1,
  pageSize: 10,
  totalCount: 1,
  items: [],
};

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  beforeAll(async () => {
    app = await getAppAndCleanDB();
  });

  //   CREATING USER ============================================================================================================

  describe('Creating new User', () => {
    it('Should return an error if unaccepted login is provided, status 400 ', async () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          login: 'us',
          email: 'user1@user.com',
          password: '123456',
        })
        .expect(400);
    });
    it('Should return an error if unaccepted email is provided, status 400 ', async () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          login: 'user1',
          email: 'user1user.com',
          password: '123456',
        })
        .expect(400);
    });
    it('Should return an error if unaccepted password is provided, status 400 ', async () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          login: 'user1',
          email: 'user1@user.com',
          password: '12345',
        })
        .expect(400);
    });
    it('Should return created user, status 201 ', async () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          login: 'user1',
          email: 'user1@user.com',
          password: '123456',
        })
        .expect(201)
        .then(({ body }) => {
          userId = body.id;
          newUser = body;
          expect(body).toEqual({
            id: userId,
            login: 'user1',
          });
        });
    });
  });

  //   GETTING ALL USERS ============================================================================================================

  describe('Getting all users', () => {
    describe('without PageNumber and without PageSize', () => {
      it('Should return array of all users status 200 ', async () => {
        return request(app.getHttpServer())
          .get(`/users`)
          .expect(200)
          .then(({ body }) => {
            expect(body).toEqual({
              ...customResponse,
              items: [newUser],
            });
          });
      });
    });
    describe('with PageNumber and without PageSize', () => {
      it('Should return array of all users status 200 ', async () => {
        return request(app.getHttpServer())
          .get(`/users`)
          .query({ PageNumber: 2 })
          .expect(200)
          .then(({ body }) => {
            expect(body).toEqual({
              ...customResponse,
              page: 2,
            });
          });
      });
    });
    describe('without PageNumber and with PageSize', () => {
      it('Should return array of all posts status 200 ', async () => {
        return request(app.getHttpServer())
          .get(`/users`)
          .query({ PageSize: 5 })
          .expect(200)
          .then(({ body }) => {
            expect(body).toEqual({
              ...customResponse,
              pageSize: 5,
              items: [newUser],
            });
          });
      });
    });
    describe('with PageNumber and with PageSize', () => {
      it('Should return array of all users status 200 ', async () => {
        return request(app.getHttpServer())
          .get(`/users`)
          .query({ PageNumber: 2, PageSize: 5 })
          .expect(200)
          .then(({ body }) => {
            expect(body).toEqual({
              ...customResponse,
              page: 2,
              pageSize: 5,
            });
          });
      });
    });
  });

  //   DELETING USER ============================================================================================================

  // describe('Delete user', () => {
  //   it('Should return 404, if user doesnt exist ', async () => {
  //     return request(app.getHttpServer())
  //       .delete(`/users/18c5de8c-8f8c-4de9-b1dd-a6b4f76b5dfb`)
  //       .expect(404);
  //   });

  //   it('Should delete a user by id ,return status 204 ', async () => {
  //     return request(app.getHttpServer())
  //       .delete(`/users/${userId}`)
  //       .expect(204);
  //   });
  // });
});
