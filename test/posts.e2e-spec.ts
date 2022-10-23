import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { HttpExceptionFilter } from './../src/exception.filter';
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';
import { getAppAndCleanDB } from './../test/test-utils';
import { CustomResponseType } from '../src/types';

let accessToken: string;
let refreshToken: string;
let postId: string;
let newPost;
let newComment;
let userId;
let newUser;

function stripPostIdAndReturnNewComment(obj) {
  const { postId, ...rest } = obj;
  return rest;
}

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
        .set('Authorization', 'basic YWRtaW46cXdlcnR5')
        .send(blogger)
        .then(({ body }) => {
          blogger.id = body.id;
          expect(body).toEqual({
            id: expect.any(String),
            name: 'Alex',
            youtubeUrl: 'https://www.youtube.com',
          });
        });
    });

    describe('Creating new Post', () => {
      it('Should return an error if basic auth fails, status 401 ', async () => {
        return request(app.getHttpServer())
          .post('/posts')
          .set('Authorization', 'basic YWRtaW46cXdlcnR-6')
          .send({
            title: 'some title',
            shortDescription: 'some description',
            content: 'some content',
            blogId: 'string',
          })
          .expect(401);
      });
      it('Should return an error if unaccepted title  is provided, status 400 ', async () => {
        return request(app.getHttpServer())
          .post('/posts')
          .set('Authorization', 'basic YWRtaW46cXdlcnR5')
          .send({
            title: '',
            shortDescription: 'some description',
            content: 'some content',
            blogId: 'string',
          })
          .expect(400);
      });
      it('Should return an error if unaccepted shortDescription is provided, status 400 ', async () => {
        return request(app.getHttpServer())
          .post('/posts')
          .set('Authorization', 'basic YWRtaW46cXdlcnR5')
          .send({
            title: 'some title',
            shortDescription: '',
            content: 'some content',
            blogId: 'string',
          })
          .expect(400);
      });
      it('Should return an error if unaccepted content is provided, status 400 ', async () => {
        return request(app.getHttpServer())
          .post('/posts')
          .set('Authorization', 'basic YWRtaW46cXdlcnR5')
          .send({
            title: 'some title',
            shortDescription: 'some description',
            content: '',
            blogId: 'string',
          })
          .expect(400);
      });
      it('Should return an error if unaccepted bloggerId is provided, status 400 ', async () => {
        return request(app.getHttpServer())
          .post('/posts')
          .set('Authorization', 'basic YWRtaW46cXdlcnR5')
          .send({
            title: 'some title',
            shortDescription: 'some description',
            content: 'some content',
            blogId: '',
          })
          .expect(400);
      });
      it('Should return an error if blogger doesnt exist , status 404 ', async () => {
        return request(app.getHttpServer())
          .post('/posts')
          .set('Authorization', 'basic YWRtaW46cXdlcnR5')
          .send({
            title: 'some title',
            shortDescription: 'some description',
            content: 'some content',
            blogId: '11111111111111',
          })
          .expect(404);
      });
      it('Should return a new post with status 201 ', async () => {
        return request(app.getHttpServer())
          .post('/posts')
          .set('Authorization', 'basic YWRtaW46cXdlcnR5')
          .send({
            title: 'some title',
            shortDescription: 'some description',
            content: 'some content',
            blogId: blogger.id,
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
              blogId: blogger.id,
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
    it('Should return an error if basic auth fail , status 401 ', async () => {
      return request(app.getHttpServer())
        .put(`/posts/${postId}`)
        .set('Authorization', 'basic YWRtaW46cXdlcnR-6')
        .send({
          title: 'some title',
          shortDescription: 'some description',
          content: 'some content',
          blogId: '11111111111111',
        })
        .expect(401);
    });
    it('Should return an error if post doesnt exist , status 404 ', async () => {
      return request(app.getHttpServer())
        .put(`/posts/1111111111111`)
        .set('Authorization', 'basic YWRtaW46cXdlcnR5')
        .send({
          title: 'some title',
          shortDescription: 'some description',
          content: 'some content',
          blogId: '11111111111111',
        })
        .expect(404);
    });
    it('Should return an error if wrong title, status 400', async () => {
      return request(app.getHttpServer())
        .put(`/posts/${postId}`)
        .set('Authorization', 'basic YWRtaW46cXdlcnR5')
        .send({
          title: '',
          shortDescription: 'some description',
          content: 'some content',
          blogId: blogger.id,
        })
        .expect(400);
    });
    it('Should return an error if wrong shortDescription, status 400', async () => {
      return request(app.getHttpServer())
        .put(`/posts/${postId}`)
        .set('Authorization', 'basic YWRtaW46cXdlcnR5')
        .send({
          title: 'some title',
          shortDescription: '',
          content: 'some content',
          blogId: blogger.id,
        })
        .expect(400);
    });
    it('Should return an error if wrong content, status 400', async () => {
      return request(app.getHttpServer())
        .put(`/posts/${postId}`)
        .set('Authorization', 'basic YWRtaW46cXdlcnR5')
        .send({
          title: 'some title',
          shortDescription: 'some description',
          content: '',
          blogId: blogger.id,
        })
        .expect(400);
    });
    it('Should return an error if wrong bloggerId, status 400', async () => {
      return request(app.getHttpServer())
        .put(`/posts/${postId}`)
        .set('Authorization', 'basic YWRtaW46cXdlcnR5')
        .send({
          title: 'some title',
          shortDescription: 'some description',
          content: 'some content',
          blogId: '',
        })
        .expect(400);
    });
    it('Should update a post and return a status 204', async () => {
      return request(app.getHttpServer())
        .put(`/posts/${postId}`)
        .set('Authorization', 'basic YWRtaW46cXdlcnR5')
        .send({
          title: 'some title',
          shortDescription: 'some description',
          content: 'some content',
          blogId: blogger.id,
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

  //   CREATING POST COMMENT =======================================================================================================
  //   =======================REGISTERING USER =====================================================================================
  describe('Register user', () => {
    // it('Should return  status 204 and register user ', async () => {
    //   return request(app.getHttpServer())
    //     .post('/auth/registration')
    //     .send({
    //       login: 'user5',
    //       email: 'user5@user.com',
    //       password: '123456',
    //     })
    //     .expect(204);
    // });
    it('Should return created user, status 201 ', async () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          login: 'user5',
          email: 'user5@user.com',
          password: '123456',
        })
        .expect(201)
        .then(({ body }) => {
          userId = body.id;
          newUser = body;
          expect(body).toEqual({
            id: userId,
            login: 'user5',
          });
        });
    });
  });
  //  ========================LOGIN USER ==========================================================================================
  describe('Login user in', () => {
    it('should return 200 and pair of access and refresh tokens', async () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          login: 'user5',
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

  //  ========================CREATING POST COMMENT ================================================================================
  describe('Creating post comment', () => {
    it('should return 401 if user is unauthorizrd', async () => {
      return request(app.getHttpServer())
        .post(`/posts/${postId}/comments`)
        .set('Authorization', 'bearer ' + 'wrong token')
        .send({ content: 'comment' })
        .expect(401);
    });
    it('should return 404 if post is not found', async () => {
      return request(app.getHttpServer())
        .post(`/posts/11111111111111/comments`)
        .set('Authorization', 'bearer ' + accessToken)
        .send({ content: 'comment comments content comments content' })
        .expect(404);
    });
    it('should return 400 if invalid body content', async () => {
      return request(app.getHttpServer())
        .post(`/posts/${postId}/comments`)
        .set('Authorization', 'bearer ' + accessToken)
        .send({ content: 'comment' })
        .expect(400);
    });
    it('should create post comment with status 201', async () => {
      return request(app.getHttpServer())
        .post(`/posts/${postId}/comments`)
        .set('Authorization', 'bearer ' + accessToken)
        .send({ content: 'comments content comments content' })
        .expect(201)
        .then(({ body }) => {
          newComment = body;
          expect(body).toEqual({
            id: expect.any(String),
            content: 'comments content comments content',
            userId,
            postId,
            userLogin: 'user5',
            addedAt: expect.any(String),
            likesInfo: {
              likesCount: 0,
              dislikesCount: 0,
              myStatus: 'None',
            },
          });
        });
    });
  });

  //   GETTING POST COMMENTS ============================================================================================================

  describe('Getting post comments', () => {
    it('should return 404 if post is not found', async () => {
      return request(app.getHttpServer())
        .get(`/posts/11111111111111/comments`)
        .expect(404);
    });

    it('should return all post comments with status 200, Custom pagesize 5', async () => {
      return request(app.getHttpServer())
        .get(`/posts/${postId}/comments`)
        .query({ PageNumber: 1, PageSize: 5 })
        .expect(200)
        .then(({ body }) => {
          expect(body).toEqual({
            ...customResponse,
            pageSize: 5,
            items: [stripPostIdAndReturnNewComment(newComment)],
          });
        });
    });
    it('should return all post comments with status 200, no queries', async () => {
      return request(app.getHttpServer())
        .get(`/posts/${postId}/comments`)
        .expect(200)
        .then(({ body }) => {
          expect(body).toEqual({
            ...customResponse,
            items: [stripPostIdAndReturnNewComment(newComment)],
          });
        });
    });
  });

  //   POST LIKE/DISLIKE ============================================================================================================

  describe('Post like/dislike', () => {
    it('should return 401 if action is unauthorized', async () => {
      return request(app.getHttpServer())
        .put(`/posts/${postId}/like-status`)
        .set('Authorization', `bearer unauthorized`)
        .expect(401);
    });
    it('should return 404 if post is not found', async () => {
      return request(app.getHttpServer())
        .put(`/posts/11111111111111/like-status`)
        .set('Authorization', `bearer ${accessToken}`)
        .send({
          likeStatus: 'Like',
        })
        .expect(404);
    });
    it('should return 400 If the lilkeStatus has incorrect value', async () => {
      return request(app.getHttpServer())
        .put(`/posts/${postId}/like-status`)
        .set('Authorization', `bearer ${accessToken}`)
        .send({
          likeStatus: '',
        })
        .expect(400);
    });
    //  ---------------------LIKE POST AND CHECK--------------------------------
    describe('like post', () => {
      it('should return 204 and set likestatus to LIKE and update likesCount', async () => {
        return request(app.getHttpServer())
          .put(`/posts/${postId}/like-status`)
          .set('Authorization', `bearer ${accessToken}`)
          .send({
            likeStatus: 'Like',
          })
          .expect(204);
      });
      it('Should return post by id with status 200  -auth', async () => {
        return request(app.getHttpServer())
          .get(`/posts/${postId}`)
          .set('Authorization', `bearer ${accessToken}`)
          .expect(200)
          .then(({ body }) => {
           
            expect(body).toEqual({
              ...newPost,
              extendedLikesInfo: {
                likesCount: 1,
                dislikesCount: 0,
                myStatus: 'Like',
                newestLikes: [
                  {
                    addedAt: expect.any(String),
                    login: 'user5',
                    userId,
                  },
                ],
              },
            });
          });
      });
      it('Should return post by id with status 200 -no auth ', async () => {
        return request(app.getHttpServer())
          .get(`/posts/${postId}`)
          .expect(200)
          .then(({ body }) => {
            expect(body).toEqual({
              ...newPost,
              extendedLikesInfo: {
                likesCount: 1,
                dislikesCount: 0,
                myStatus: 'None',
                newestLikes: [
                  {
                    addedAt: expect.any(String),
                    login: 'user5',
                    userId,
                  },
                ],
              },
            });
          });
      });
    });
    //  ---------------------NONE POST AND CHECK--------------------------------
    describe('dislike post', () => {
      it('should return 204 and set likestatus to DISLIKE and update dislikesCount and likesCOunt', async () => {
        return request(app.getHttpServer())
          .put(`/posts/${postId}/like-status`)
          .set('Authorization', `bearer ${accessToken}`)
          .send({
            likeStatus: 'None',
          })
          .expect(204);
      });
      it('Should return post by id with status 200 -auth ', async () => {
        return request(app.getHttpServer())
          .get(`/posts/${postId}`)
          .set('Authorization', `bearer ${accessToken}`)
          .expect(200)
          .then(({ body }) => {
            expect(body).toEqual({
              ...newPost,
              extendedLikesInfo: {
                likesCount: 0,
                dislikesCount: 0,
                myStatus: 'None',
                newestLikes: [],
              },
            });
          });
      });
      it('Should return post by id with status 200 -no auth ', async () => {
        return request(app.getHttpServer())
          .get(`/posts/${postId}`)
          .expect(200)
          .then(({ body }) => {
            expect(body).toEqual({
              ...newPost,
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
    //  ---------------------DISLIKE POST AND CHECK--------------------------------
    describe('dislike post', () => {
      it('should return 204 and set likestatus to DISLIKE and update dislikesCount and likesCOunt', async () => {
        return request(app.getHttpServer())
          .put(`/posts/${postId}/like-status`)
          .set('Authorization', `bearer ${accessToken}`)
          .send({
            likeStatus: 'Dislike',
          })
          .expect(204);
      });
      it('Should return post by id with status 200 -auth ', async () => {
        return request(app.getHttpServer())
          .get(`/posts/${postId}`)
          .set('Authorization', `bearer ${accessToken}`)
          .expect(200)
          .then(({ body }) => {
            expect(body).toEqual({
              ...newPost,
              extendedLikesInfo: {
                likesCount: 0,
                dislikesCount: 1,
                myStatus: 'Dislike',
                newestLikes: [],
              },
            });
          });
      });
      it('Should return post by id with status 200 -no auth ', async () => {
        return request(app.getHttpServer())
          .get(`/posts/${postId}`)
          .expect(200)
          .then(({ body }) => {
            expect(body).toEqual({
              ...newPost,
              extendedLikesInfo: {
                likesCount: 0,
                dislikesCount: 1,
                myStatus: 'None',
                newestLikes: [],
              },
            });
          });
      });
    });
  });

  //   DELETING POST ============================================================================================================

  describe('Delete post', () => {
    it('Should return status 401 if basic auth fail ', async () => {
      return request(app.getHttpServer())
        .delete(`/posts/${postId}`)
        .set('Authorization', 'basic YWRtaW46cXdlcnR-6')
        .expect(401);
    });

    it('Should return 404, if post doesnt exist ', async () => {
      return request(app.getHttpServer())
        .delete(`/posts/1111111111`)
        .set('Authorization', 'basic YWRtaW46cXdlcnR5')
        .expect(404);
    });

    it('Should delete a post by id ,return status 204 ', async () => {
      return request(app.getHttpServer())
        .delete(`/posts/${postId}`)
        .set('Authorization', 'basic YWRtaW46cXdlcnR5')
        .expect(204);
    });
  });
});
