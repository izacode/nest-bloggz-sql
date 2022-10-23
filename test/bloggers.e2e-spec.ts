import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { HttpExceptionFilter } from './../src/exception.filter';
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';
import { getAppAndCleanDB } from './../test/test-utils';
import { CustomResponseType } from '../src/types';
import { isUUID } from 'class-validator';

let blogId: string = '';
let postId: string;
let newPost;

let bloggerUpdated = {
  id: blogId,
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
  afterAll(async () => {
    await app.close();
  });

  //   CREATING BLOGGER ================================================================================================================

  describe('Creating new Blogger', () => {
    it('Should return an error if wrong name is provided, status 400 ', async () => {
      return request(app.getHttpServer())
        .post('/blogs')
        .set('Authorization', 'basic YWRtaW46cXdlcnR5')
        .send({
          name: '',
          youtubeUrl: 'https://www.youtube.com',
        })
        .expect(400);
    });
    it('Should return an error if wrong youtubeUrl is provided, status 400 ', async () => {
      return request(app.getHttpServer())
        .post('/blogs')
        .set('Authorization', 'basic YWRtaW46cXdlcnR5')
        .send({
          name: 'Alex',
          youtubeUrl: '',
        })
        .expect(400);
    });

    it('Should create a new blogger and return it with status 201', async () => {
      return request(app.getHttpServer())
        .post('/blogs')
        .set('Authorization', 'basic YWRtaW46cXdlcnR5')
        .send(bloggerAlex)
        .expect(HttpStatus.CREATED)
        .then(({ body }) => {
          blogId = body.id;
          expect(body).toEqual({
            id: expect.any(String),
            name: 'Alex',
            youtubeUrl: 'https://www.youtube.com',
            createdAt: expect.any(String),
          });
        });
      // const res = await request(app.getHttpServer()).post('/bloggers').send(bloggerAlex)
      // expect(res.status).toBe(201)
      // expect(res.body).not.toBeUndefined
      // const isUuid = isUUID(res.body.id)
    });
    it('Should return an 401 error if blogger is not authorized', async () => {
      return request(app.getHttpServer())
        .post(`/blogs`)
        .set('Authorization', 'basic YWRtaW46cXdlcnRp')
        .send({
          name: 'Alex',
          youtubeUrl: 'https://www.youtube.com',
        })
        .expect(401);
    });
  });

  //   GETTING BLOGGER =================================================================================================================

  describe('Getting a blogger', () => {
    it('Should return blogger by id with status 200 ', async () => {
      return request(app.getHttpServer())
        .get(`/blogs/${blogId}`)
        .expect(200)
        .then(({ body }) => {
          expect(body).toEqual({ id: blogId, ...bloggerAlex });
        });
    });

    it('Should return an 404 error if blogger is not found', async () => {
      return request(app.getHttpServer()).get('/bloggers/11111111').expect(404);
    });
  });

  //   UPDATING BLOGGER ================================================================================================================

  describe('Updating a blogger', () => {
    it('SHould update a blogger and return a status 204', async () => {
      return request(app.getHttpServer())
        .put(`/blogs/${blogId}`)
        .set('Authorization', 'basic YWRtaW46cXdlcnR5')
        .send({
          name: 'UPDATED',
          youtubeUrl: 'https://www.youtubeUPDATED.com',
        })
        .expect(HttpStatus.NO_CONTENT);
    });
    it('Should return an error if wrong name is provided, status 400 ', async () => {
      return request(app.getHttpServer())
        .put(`/blogs/${blogId}`)
        .set('Authorization', 'basic YWRtaW46cXdlcnR5')
        .send({
          name: '',
          youtubeUrl: 'https://www.youtube.com',
        })
        .expect(400);
    });
    it('Should return an error if wrong youtubeUrl is provided, status 400 ', async () => {
      return request(app.getHttpServer())
        .put(`/blogs/${blogId}`)
        .set('Authorization', 'basic YWRtaW46cXdlcnR5')
        .send({
          name: 'Alex',
          youtubeUrl: '',
        })
        .expect(400);
    });
    it('Should return an 404 error if blogger is not found', async () => {
      return request(app.getHttpServer())
        .put('/blogs/11111111')
        .set('Authorization', 'basic YWRtaW46cXdlcnR5')
        .send({
          name: 'UPDATED',
          youtubeUrl: 'https://www.youtubeUPDATED.com',
        })
        .expect(404);
    });
    it('Should return an 401 error if blogger is not authorized', async () => {
      return request(app.getHttpServer())
        .put(`/blogs/${blogId}`)
        .set('Authorization', 'basic YWRtaW46cXdlcnRp')
        .send({
          name: 'UPDATED',
          youtubeUrl: 'https://www.youtubeUPDATED.com',
        })
        .expect(401);
    });
  });

  //   GETTING ALL BLOGGERS ============================================================================================================

  //  ============================Creating 4 additional bloggers===========================================================
  describe('Creating 4 additional bloggers for sorting test', () => {
    it('Should create a new blogger and return it with status 201', async () => {
      return request(app.getHttpServer())
        .post('/blogs')
        .set('Authorization', 'basic YWRtaW46cXdlcnR5')
        .send({
          name: 'Blogger-01',
          youtubeUrl: 'https://www.youtube.com',
        })
        .expect(HttpStatus.CREATED)
        .then(({ body }) => {
          blogId = body.id;
          expect(body).toEqual({
            id: expect.any(String),
            name: 'Blogger-01',
            youtubeUrl: 'https://www.youtube.com',
            createdAt: expect.any(String),
          });
        });
    });
    it('Should create a new blogger and return it with status 201', async () => {
      return request(app.getHttpServer())
        .post('/blogs')
        .set('Authorization', 'basic YWRtaW46cXdlcnR5')
        .send({
          name: 'Blogger-02',
          youtubeUrl: 'https://www.youtube.com',
        })
        .expect(HttpStatus.CREATED)
        .then(({ body }) => {
          blogId = body.id;
          expect(body).toEqual({
            id: expect.any(String),
            name: 'Blogger-02',
            youtubeUrl: 'https://www.youtube.com',
            createdAt: expect.any(String),
          });
        });
    });
    it('Should create a new blogger and return it with status 201', async () => {
      return request(app.getHttpServer())
        .post('/blogs')
        .set('Authorization', 'basic YWRtaW46cXdlcnR5')
        .send({
          name: 'Blogger-03',
          youtubeUrl: 'https://www.youtube.com',
        })
        .expect(HttpStatus.CREATED)
        .then(({ body }) => {
          blogId = body.id;
          expect(body).toEqual({
            id: expect.any(String),
            name: 'Blogger-03',
            youtubeUrl: 'https://www.youtube.com',
            createdAt: expect.any(String),
          });
        });
    });
    it('Should create a new blogger and return it with status 201', async () => {
      return request(app.getHttpServer())
        .post('/blogs')
        .set('Authorization', 'basic YWRtaW46cXdlcnR5')
        .send({
          name: 'Blogger-04',
          youtubeUrl: 'https://www.youtube.com',
        })
        .expect(HttpStatus.CREATED)
        .then(({ body }) => {
          blogId = body.id;
          expect(body).toEqual({
            id: expect.any(String),
            name: 'Blogger-04',
            youtubeUrl: 'https://www.youtube.com',
            createdAt: expect.any(String),
          });
        });
    });
  });

  //  =====================================================================================================================

  describe('Getting all bloggers', () => {
    describe('without serch filter and query params', () => {
      it('Should return array of all bloggers status 200 ', async () => {
        return request(app.getHttpServer())
          .get(`/blogs`)
          .expect(200)
          .then(({ body }) => {
            expect(body).toEqual({
              ...customResponse,
              items: [{ ...bloggerUpdated, id: blogId }],
            });
          });
      });
    });
    describe('without serch with filter and query params', () => {
      it('Should return array of all bloggers status 200 ', async () => {
        return request(app.getHttpServer())
          .get(`/blogs`)
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
          .get(`/blogs`)
          .query({ SearchNameTerm: 'A' })
          .expect(200)
          .then(({ body }) => {
            expect(body).toEqual({
              ...customResponse,
              items: [{ ...bloggerUpdated, id: blogId }],
            });
          });
      });
    });
  });

  //  CREATING BLOGGERS POST ===========================================================================================================
  describe('Create blogger post', () => {
    it('Should return an 401 error if blogger is not authorized', async () => {
      return request(app.getHttpServer())
        .post(`/blogs/${blogId}/posts`)
        .set('Authorization', 'basic YWRtaW46cXdlcnRp')

        .send({
          title: 'some title',
          shortDescription: 'some description',
          content: 'some content',
        })
        .expect(401);
    });
    it('Should return an error if unaccepted title  is provided, status 400 ', async () => {
      return request(app.getHttpServer())
        .post(`/blogs/${blogId}/posts`)
        .set('Authorization', 'basic YWRtaW46cXdlcnR5')
        .send({
          title: '',
          shortDescription: 'some description',
          content: 'some content',
        })
        .expect(400);
    });
    it('Should return an error if unaccepted shortDescription is provided, status 400 ', async () => {
      return request(app.getHttpServer())
        .post(`/blogs/${blogId}/posts`)
        .set('Authorization', 'basic YWRtaW46cXdlcnR5')
        .send({
          title: 'some title',
          shortDescription: '',
          content: 'some content',
        })
        .expect(400);
    });
    it('Should return an error if unaccepted content is provided, status 400 ', async () => {
      return request(app.getHttpServer())
        .post(`/blogs/${blogId}/posts`)
        .set('Authorization', 'basic YWRtaW46cXdlcnR5')
        .send({
          title: 'some title',
          shortDescription: 'some description',
          content: '',
        })
        .expect(400);
    });

    it('Should return an error if blogger doesnt exist , status 404 ', async () => {
      return request(app.getHttpServer())
        .post(`/blogs/11111111/posts`)
        .set('Authorization', 'basic YWRtaW46cXdlcnR5')
        .send({
          title: 'some title',
          shortDescription: 'some description',
          content: 'some content',
        })
        .expect(404);
    });

    it('Should create  bloggers new post with status 201 ', async () => {
      return request(app.getHttpServer())
        .post(`/blogs/${blogId}/posts`)
        .set('Authorization', 'basic YWRtaW46cXdlcnR5')
        .send({
          title: 'some title',
          shortDescription: 'some description',
          content: 'some content',
        })
        .expect(201)
        .then(({ body }) => {
          postId = body.id;
          newPost = body;
          expect(body).toEqual({
            id: postId,
            title: 'some title',
            shortDescription: 'some description',
            content: 'some content',
            blogId,
            blogName: expect.any(String),
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

  //  GETTING BLOGGERS POSTS ===========================================================================================================

  describe('Getting  all blogger posts', () => {
    it('Should return array of all bloggers posts status 200 ', async () => {
      return request(app.getHttpServer())
        .get(`/blogs/${blogId}/posts`)
        .expect(200)
        .then(({ body }) => {
          expect(body).toEqual({
            ...customResponse,
            items: [newPost],
          });
        });
    });
  });

  //   DELETING BLOGGER ================================================================================================================

  describe('Delete blogger', () => {
    it('Should return an 401 error if blogger is not authorized', async () => {
      return request(app.getHttpServer())
        .delete(`/blogs/${blogId}`)
        .set('Authorization', 'basic YWRtaW46cXdlcnRp')
        .expect(401);
    });
  });
  describe('Delete blogger', () => {
    it('Should delete a blogger by id ,return status 204 ', async () => {
      return request(app.getHttpServer())
        .delete(`/blogs/${blogId}`)
        .set('Authorization', 'basic YWRtaW46cXdlcnR5')
        .expect(204);
    });

    it('Should return 404, if blogger doesnt exist ', async () => {
      return request(app.getHttpServer())
        .delete(`/blogs/${blogId}`)
        .set('Authorization', 'basic YWRtaW46cXdlcnR5')
        .expect(404);
    });
  });
});
