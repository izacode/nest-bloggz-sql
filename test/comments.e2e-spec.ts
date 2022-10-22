import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { getAppAndCleanDB } from './../test/test-utils';

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

describe('CommentsController (e2e)', () => {
  let app: INestApplication;
  beforeAll(async () => {
    app = await getAppAndCleanDB();
  });

  //   GETTING COMMENT BY ID============================================================================================================

  describe('Creating blogger', () => {
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
  });
  describe('Creating new Post', () => {
    it('Should return a new post with status 201 ', async () => {
      return request(app.getHttpServer())
        .post('/posts')
        .set('Authorization', 'basic YWRtaW46cXdlcnR5')
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

  //   =======================CREATING POST COMMENT ====================================================================================
  //   ===========================REGISTERING USER =====================================================================================
  describe('Register user', () => {
    it('Should return created user, status 201 ', async () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          login: 'user-6',
          email: 'user6@user.com',
          password: '123456',
        })
        .expect(201)
        .then(({ body }) => {
          userId = body.id;
          newUser = body;
          expect(body).toEqual({
            id: userId,
            login: 'user-6',
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
          login: 'user-6',
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
            userLogin: 'user-6',
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

  // ------------------------------------------------------------------------------------------------------------------------------------

  describe('Getting comment by id without reation', () => {
    it('Should return 404 if comment doesnt exist ', async () => {
      return request(app.getHttpServer())
        .get(`/comments/1111111111111`)
        .expect(404);
    });
    it('Should return 200 and comment ---no auth ', async () => {
      return request(app.getHttpServer())
        .get(`/comments/${newComment.id}`)
        .expect(200)
        .then(({ body }) => {
          expect(body).toEqual({
            id: expect.any(String),
            content: 'comments content comments content',
            userId,
            addedAt: expect.any(String),
            userLogin: 'user-6',
            likesInfo: {
              likesCount: 0,
              dislikesCount: 0,
              myStatus: 'None',
            },
          });
        });
    });
    it('Should return 200 and comment --- with auth', async () => {
      return request(app.getHttpServer())
        .get(`/comments/${newComment.id}`)
        .set('Authorization', 'bearer ' + accessToken)
        .expect(200)
        .then(({ body }) => {
          expect(body).toEqual({
            id: expect.any(String),
            content: 'comments content comments content',
            userId,
            addedAt: expect.any(String),
            userLogin: 'user-6',
            likesInfo: {
              likesCount: 0,
              dislikesCount: 0,
              myStatus: 'None',
            },
          });
        });
    });
  });
  // CREATE REATION AND TEST=========================================================================================

  describe('Creating comment reaction', () => {
    it('Should return 404 if comment doesnt exist ', async () => {
      return request(app.getHttpServer())
        .put(`/comments/1111111111111/like-status`)
        .set('Authorization', 'bearer ' + accessToken)
        .send({ likeStatus: 'Like' })
        .expect(404);
    });
    it('Should return 401 user is unauthorized ', async () => {
      return request(app.getHttpServer())
        .put(`/comments/${newComment.id}/like-status`)
        .set('Authorization', 'bearer ' + 'accessToken')
        .send({ likeStatus: 'Like' })
        .expect(401);
    });
    it('Should return 400 if input model has incorrect value ', async () => {
      return request(app.getHttpServer())
        .put(`/comments/${newComment.id}/like-status`)
        .set('Authorization', 'bearer ' + accessToken)
        .send({ likeStatus: '' })
        .expect(400);
    });
    it('Should return 204', async () => {
      return request(app.getHttpServer())
        .put(`/comments/${newComment.id}/like-status`)
        .set('Authorization', 'bearer ' + accessToken)
        .send({ likeStatus: 'Like' })
        .expect(204);
    });
    it('Should return 204', async () => {
      return request(app.getHttpServer())
        .put(`/comments/${newComment.id}/like-status`)
        .set('Authorization', 'bearer ' + accessToken)
        .send({ likeStatus: 'None' })
        .expect(204);
    });
    it('Should return 204', async () => {
      return request(app.getHttpServer())
        .put(`/comments/${newComment.id}/like-status`)
        .set('Authorization', 'bearer ' + accessToken)
        .send({ likeStatus: 'Dislike' })
        .expect(204);
    });
  });

  // WITH REATION====================================================================================================
  describe('Getting comment by id with reation', () => {
    it('Should return 404 if comment doesnt exist ', async () => {
      return request(app.getHttpServer())
        .get(`/comments/1111111111111`)
        .expect(404);
    });
    it('Should return 200 and comment ---no auth ', async () => {
      return request(app.getHttpServer())
        .get(`/comments/${newComment.id}`)
        .expect(200)
        .then(({ body }) => {
          expect(body).toEqual({
            id: expect.any(String),
            content: 'comments content comments content',
            userId,
            addedAt: expect.any(String),
            userLogin: 'user-6',
            likesInfo: {
              likesCount: 0,
              dislikesCount: 1,
              myStatus: 'None',
            },
          });
        });
    });
    it('Should return 200 and comment --- with auth', async () => {
      return request(app.getHttpServer())
        .get(`/comments/${newComment.id}`)
        .set('Authorization', 'bearer ' + accessToken)
        .expect(200)
        .then(({ body }) => {
          expect(body).toEqual({
            id: expect.any(String),
            content: 'comments content comments content',
            userId,
            addedAt: expect.any(String),
            userLogin: 'user-6',
            likesInfo: {
              likesCount: 0,
              dislikesCount: 1,
              myStatus: 'Dislike',
            },
          });
        });
    });
  });

  //   UPDATING UCOMMENT ============================================================================================================

  // describe('Updating comment', () => {
  //   describe('without PageNumber and without PageSize', () => {
  //     it('Should return array of all users status 200 ', async () => {
  //       return request(app.getHttpServer())
  //         .get(`/comments/${newComment.id}`)
  //         .expect(200)
  //         .then(({ body }) => {
  //           expect(body).toEqual({
  //             ...customResponse,
  //             items: [newUser],
  //           });
  //         });
  //     });
  //   });
  // });

  //   DELETING COMMENT ============================================================================================================

  // describe('Delete comment', () => {
  //   it('Should return 404, if comment doesnt exist ', async () => {
  //     return request(app.getHttpServer())
  //       .delete(`/comment/18c5de8c-8f8c-4de9-b1dd-a6b4f76b5dfb`)
  //       .expect(404);
  //   });

  //   it('Should delete a comment by id ,return status 204 ', async () => {
  //     return request(app.getHttpServer())
  //       .delete(`/users/${newComment.id}`)
  //       .expect(204);
  //   });
  // });
});
