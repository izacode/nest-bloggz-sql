import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { HttpExceptionFilter } from './../src/exception.filter';
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';
import { getAppAndCleanDB } from './../test/test-utils';
import { CustomResponseType } from '../src/types';

let postId: string;
let newPost;

let blogger: any = {
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

describe('PostsController (e2e)', () => {
  let app: INestApplication;
  beforeAll(async () => {
    app = await getAppAndCleanDB();
  });
  afterAll(async () => {
    await app.close();
  });

  //   CREATING POST ============================================================================================================

  describe('Creating blogger for testing PostController e2e', () => {
    it('Should create a new blogger', async () => {
      const res = await request(app.getHttpServer())
        .post('/bloggers')
        .send(blogger);
      blogger.id = res.body.id;
      expect(res.status).toBe(201);
    });
  });

  describe('Creating new Post', () => {
    it('Should return an error if unaccepted title  is provided, status 400 ', async () => {
      return request(app.getHttpServer())
        .post('/posts')
        .send({
          title: '',
          shortDescription: 'some description',
          content: 'some content',
          bloggerId: 'string',
        })
        .expect(400);
    });
    it('Should return an error if unaccepted shortDescription is provided, status 400 ', async () => {
      return request(app.getHttpServer())
        .post('/posts')
        .send({
          title: 'some title',
          shortDescription: '',
          content: 'some content',
          bloggerId: 'string',
        })
        .expect(400);
    });
    it('Should return an error if unaccepted content is provided, status 400 ', async () => {
      return request(app.getHttpServer())
        .post('/posts')
        .send({
          title: 'some title',
          shortDescription: 'some description',
          content: '',
          bloggerId: 'string',
        })
        .expect(400);
    });
    it('Should return an error if unaccepted bloggerId is provided, status 400 ', async () => {
      return request(app.getHttpServer())
        .post('/posts')
        .send({
          title: 'some title',
          shortDescription: 'some description',
          content: 'some content',
          bloggerId: '',
        })
        .expect(400);
    });
    it('Should return an error if blogger doesnt exist , status 404 ', async () => {
      return request(app.getHttpServer())
        .post('/posts')
        .send({
          title: 'some title',
          shortDescription: 'some description',
          content: 'some content',
          bloggerId: '11111111111111',
        })
        .expect(404);
    });
    it('Should return a new post with status 201 ', async () => {
      return request(app.getHttpServer())
        .post('/posts')
        .send({
          title: 'some title',
          shortDescription: 'some description',
          content: 'some content',
          bloggerId: blogger.id,
        })
        .expect(201)
        .then(({ body }) => {
          postId = body.id;
          newPost = body;

          expect(body).toEqual({
            // id: expect.any(String),
            id: postId,
            title: 'some title',
            shortDescription: 'some description',
            content: 'some content',
            bloggerId: blogger.id,
            bloggerName: expect.any(String),
            createdAt: expect.any(String),
            extendedLikesInfo: {
              likesCount: 0,
              dislikesCount: 0,
              myStatus: 'None',
              newestLikes: [],
            },
          });
        });
    });
  });

  //   GETTING POST ============================================================================================================

  describe('Getting a post', () => {
    it('Should return an 404 error if post is not found', async () => {
      return request(app.getHttpServer()).get('/posts/11111111').expect(404);
    });

    it('Should return post by id with status 200 ', async () => {
      return request(app.getHttpServer())
        .get(`/posts/${postId}`)
        .expect(200)
        .then(({ body }) => {
          expect(body).toEqual(newPost);
        });
    });
  });

  //   UPDATING POST ============================================================================================================

  describe('Updating a post', () => {
    it('Should return an error if post doesnt exist , status 404 ', async () => {
      return request(app.getHttpServer())
        .put(`/posts/1111111111111`)
        .send({
          title: 'some title',
          shortDescription: 'some description',
          content: 'some content',
          bloggerId: '11111111111111',
        })
        .expect(404);
    });

    it('Should return an error if wrong title, status 400', async () => {
      return request(app.getHttpServer())
        .put(`/posts/${postId}`)
        .send({
          title: '',
          shortDescription: 'some description',
          content: 'some content',
          bloggerId: blogger.id,
        })
        .expect(400);
    });
    it('Should return an error if wrong shortDescription, status 400', async () => {
      return request(app.getHttpServer())
        .put(`/posts/${postId}`)
        .send({
          title: 'some title',
          shortDescription: '',
          content: 'some content',
          bloggerId: blogger.id,
        })
        .expect(400);
    });
    it('Should return an error if wrong content, status 400', async () => {
      return request(app.getHttpServer())
        .put(`/posts/${postId}`)
        .send({
          title: 'some title',
          shortDescription: 'some description',
          content: '',
          bloggerId: blogger.id,
        })
        .expect(400);
    });
    it('Should return an error if wrong bloggerId, status 400', async () => {
      return request(app.getHttpServer())
        .put(`/posts/${postId}`)
        .send({
          title: 'some title',
          shortDescription: 'some description',
          content: 'some content',
          bloggerId: '',
        })
        .expect(400);
    });

    it('Should update a post and return a status 204', async () => {
      return request(app.getHttpServer())
        .put(`/posts/${postId}`)
        .send({
          title: 'some title',
          shortDescription: 'some description',
          content: 'some content',
          bloggerId: blogger.id,
        })
        .expect(HttpStatus.NO_CONTENT);
    });
  });

  //   GETTING ALL POSTS ============================================================================================================

  describe('Getting all posts', () => {
    describe('with SearchNameTerm and without other filters', () => {
      it('Should return array of all posts status 200 ', async () => {
        return request(app.getHttpServer())
          .get(`/posts`)
          .query({ SearchNameTerm: 's' })
          .expect(200)
          .then(({ body }) => {
            expect(body).toEqual({
              ...customResponse,
              items: [newPost],
            });
          });
      });
    });
    describe('without serch filter and query params', () => {
      it('Should return array of all posts status 200 ', async () => {
        return request(app.getHttpServer())
          .get(`/posts`)
          .expect(200)
          .then(({ body }) => {
            expect(body).toEqual({
              ...customResponse,
              items: [newPost],
            });
          });
      });
    });

    describe('without serch and with filter query params', () => {
      it('Should return array of all bloggers status 200 ', async () => {
        return request(app.getHttpServer())
          .get(`/posts`)
          .query({ PageNumber: 1, PageSize: 5 })
          .expect(200)
          .then(({ body }) => {
            expect(body).toEqual({
              ...customResponse,
              page: 1,
              pageSize: 5,
              items: [newPost],
            });
          });
      });
    });
    // interesting case with tests sequence, after filters set to find no items, next tests which is expected to find items won't
    describe('with serch and with filter query params', () => {
      it('Should return array of all posts status 200 ', async () => {
        return request(app.getHttpServer())
          .get(`/posts`)
          .query({ SearchNameTerm: 's', PageNumber: 2, PageSize: 5 })
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

  //   DELETING POST ============================================================================================================

  describe('Delete post', () => {
    it('Should return 404, if post doesnt exist ', async () => {
      return request(app.getHttpServer())
        .delete(`/posts/1111111111`)
        .expect(404);
    });

    it('Should delete a post by id ,return status 204 ', async () => {
      return request(app.getHttpServer())
        .delete(`/posts/${postId}`)
        .expect(204);
    });
  });
});
