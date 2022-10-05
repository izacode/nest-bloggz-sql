import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { HttpExceptionFilter } from './../src/exception.filter';
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';
import { getAppAndCleanDB } from './../test/test-utils';
import { CustomResponseType } from '../src/types';

let bloggerId: string = '';

let bloggerUpdated = {
  id: bloggerId,
  name: 'UPDATED',
  youtubeUrl: 'https://www.youtubeUPDATED.com',
};

const bloggerAlex = {
  name: 'Alex',
  youtubeUrl: 'https://www.youtube.com',
};

let customResponse = {
  pagesCount: 1,
  page: 1,
  pageSize: 10,
  totalCount: 1,
  items: [],
};

describe('BloggersController (e2e)', () => {
  let app: INestApplication;
  beforeAll(async () => {
    app = await getAppAndCleanDB();
  });

  describe('Creating new Blogger', () => {
    it('Should return an error if wrong name is provided, status 400 ', async () => {
      return request(app.getHttpServer())
        .post('/bloggers')
        .send({
          name: '',
          youtubeUrl: 'https://www.youtube.com',
        })
        .expect(400);
    });
    it('Should return an error if wrong youtubeUrl is provided, status 400 ', async () => {
      return request(app.getHttpServer())
        .post('/bloggers')
        .send({
          name: 'Alex',
          youtubeUrl: '',
        })
        .expect(400);
    });

    it('Should create a new blogger and return it with status 201', async () => {
      return request(app.getHttpServer())
        .post('/bloggers')
        .send(bloggerAlex)
        .expect(HttpStatus.CREATED)
        .then(({ body }) => {
          bloggerId = body.id;
          expect(body).toEqual({
            id: expect.any(String),
            name: 'Alex',
            youtubeUrl: 'https://www.youtube.com',
          });
        });
    });
  });

  describe('Getting a blogger', () => {
    it('Should return blogger by id with status 200 ', async () => {
      return request(app.getHttpServer())
        .get(`/bloggers/${bloggerId}`)
        .expect(200)
        .then(({ body }) => {
          expect(body).toEqual({ id: bloggerId, ...bloggerAlex });
        });
    });

    it('Should return an 404 error if blogger is not found', async () => {
      return request(app.getHttpServer()).get('/bloggers/11111111').expect(404);
    });
  });

  describe('Updating a blogger', () => {
    it('SHould update a blogger and return a status 204', async () => {
      return request(app.getHttpServer())
        .put(`/bloggers/${bloggerId}`)
        .send({
          name: 'UPDATED',
          youtubeUrl: 'https://www.youtubeUPDATED.com',
        })
        .expect(HttpStatus.NO_CONTENT);
    });
    it('Should return an error if wrong name is provided, status 400 ', async () => {
      return request(app.getHttpServer())
        .put(`/bloggers/${bloggerId}`)
        .send({
          name: '',
          youtubeUrl: 'https://www.youtube.com',
        })
        .expect(400);
    });
    it('Should return an error if wrong youtubeUrl is provided, status 400 ', async () => {
      return request(app.getHttpServer())
        .put(`/bloggers/${bloggerId}`)
        .send({
          name: 'Alex',
          youtubeUrl: '',
        })
        .expect(400);
    });
     it('Should return an 404 error if blogger is not found', async () => {
       return request(app.getHttpServer())
         .put('/bloggers/11111111')
         .expect(404);
     });
  });

  describe('Getting all bloggers', () => {
    describe('without serch filter and query params', () => {
      it('Should return array of all bloggers status 200 ', async () => {
        return request(app.getHttpServer())
          .get(`/bloggers`)
          .expect(200)
          .then(({ body }) => {
            console.log('this.is body-----', body);
            expect(body).toEqual({
              ...customResponse,
              items: [{ ...bloggerUpdated, id: bloggerId }],
            });
          });
      });
    });
    describe('without serch with filter and query params', () => {
      it('Should return array of all bloggers status 200 ', async () => {
        return request(app.getHttpServer())
          .get(`/bloggers`)
          .query({ SearchNameTerm: 'A', PageNumber: 2, PageSize: 5 })
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
    describe('with SearchNameTerm and without other filters', () => {
      it('Should return array of all bloggers status 200 ', async () => {
        return request(app.getHttpServer())
          .get(`/bloggers`)
          .query({ SearchNameTerm: 'A' })
          .expect(200)
          .then(({ body }) => {
            expect(body).toEqual({
              ...customResponse,
              items: [{ ...bloggerUpdated, id: bloggerId }],
            });
          });
      });
    });
  });

  describe('Delete blogger', () => {
    it('Should delete a blogger by id ,return status 204 ', async () => {
      return request(app.getHttpServer())
        .delete(`/bloggers/${bloggerId}`)
        .expect(204);
    });

    it('Should return 404, if blogger doesnt exist ', async () => {
      return request(app.getHttpServer())
        .delete(`/bloggers/${bloggerId}`)
        .expect(404);
    });
  });
});
