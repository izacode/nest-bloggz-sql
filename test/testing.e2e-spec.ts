import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { HttpExceptionFilter } from './../src/exception.filter';
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';
import { getAppAndCleanDB } from './../test/test-utils';
import { CustomResponseType } from '../src/types';
import { isUUID } from 'class-validator';

let customResponse = {
  pagesCount: 0,
  page: 1,
  pageSize: 10,
  totalCount: 0,
  items: [],
};

describe('BloggersController (e2e)', () => {
  let app: INestApplication;
  beforeAll(async () => {
    app = await getAppAndCleanDB();
  });
  afterAll(async () => {
    await app.close();
  });

  describe('Clearing DB', () => {
    it('Should clear db', () => {
      return request(app.getHttpServer())
        .delete(`/testing/all-data`)
        .expect(204);
    });
  });

  //   GETTING ALL BLOGGERS ============================================================================================================

  describe('Getting all bloggers', () => {
    describe('without serch filter and query params', () => {
      it('Should return array of all bloggers status 200 ', async () => {
        return request(app.getHttpServer())
          .get(`/bloggers`)
          .expect(200)
          .then(({ body }) => {
            expect(body).toEqual({
              ...customResponse,
              items: [],
            });
          });
      });
    });
  });

  //   GETTING ALL POSTS ============================================================================================================

  describe('Getting all posts', () => {
    it('Should return array of all posts status 200 ', async () => {
      return request(app.getHttpServer())
        .get(`/posts`)
        .expect(200)
        .then(({ body }) => {
          expect(body).toEqual({
            ...customResponse,
            items: [],
          });
        });
    });
  });

  //   GETTING ALL USERS ============================================================================================================

  describe('without PageNumber and without PageSize', () => {
    it('Should return array of all users status 200 ', async () => {
      return request(app.getHttpServer())
        .get(`/users`)
        .expect(200)
        .then(({ body }) => {
          expect(body).toEqual({
            ...customResponse,
            items: [],
          });
        });
    });
  });
});
