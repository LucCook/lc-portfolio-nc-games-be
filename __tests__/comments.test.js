const app = require("../app.js");
const seed = require("../db/seeds/seed.js");
const request = require("supertest");
const db = require("../db/connection.js");
const testData = require("../db/data/test-data/index.js");
const fs = require("fs/promises");

afterAll(() => db.end());

beforeEach(() => seed(testData));

describe("GET /api/reviews/:review_id/comments", () => {
  test("200: should return an array of objects, each with properties (comment_id, votes, created_at, author, body, review_id)", () => {
    return request(app)
      .get("/api/reviews/2/comments")
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments.length).toBe(3);
        comments.forEach((comment) => {
          expect(comment).toEqual(
            expect.objectContaining({
              comment_id: expect.any(Number),
              votes: expect.any(Number),
              created_at: expect.any(String),
              author: expect.any(String),
              body: expect.any(String),
              review_id: 2,
            })
          );
        });
      });
  });
  test("200: returned array should be sorted by created_at, descending", () => {
    return request(app)
      .get("/api/reviews/2/comments")
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments).toBeSortedBy("created_at", { descending: true });
      });
  });
  test("200: returns empty array if no comments with the specified review_id, but the review_id exists in the review table", () => {
    return request(app)
      .get("/api/reviews/5/comments")
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments).toEqual([]);
      });
  });
  test("404: not found if the review_id DOES NOT exist in the review table", () => {
    return request(app)
      .get("/api/reviews/5005/comments")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("not found");
      });
  });
  test("400: bad request if review_id not valid data type", () => {
    return request(app)
      .get("/api/reviews/pineapple/comments")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });
});

describe("POST /api/reviews/:review_id/comments", () => {
  test("201: responds with posted comment if succesful", () => {
    const newComment = { username: "dav3rid", body: "life changing" };
    return request(app)
      .post("/api/reviews/1/comments")
      .send(newComment)
      .expect(201)
      .then(({ body: { comment } }) => {
        expect(comment).toEqual(
          expect.objectContaining({
            comment_id: expect.any(Number),
            votes: expect.any(Number),
            created_at: expect.any(String),
            author: expect.any(String),
            body: expect.any(String),
            review_id: 1,
          })
        );
      });
  });
  test("404: not found if username does not exist in users table", () => {
    const newComment = { username: "fakeName123", body: "life changing" };
    return request(app)
      .post("/api/reviews/1/comments")
      .send(newComment)
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("not found");
      });
  });
  test("404: not found if review_id does not exist in reviews table", () => {
    const newComment = { username: "dav3rid", body: "life changing" };
    return request(app)
      .post("/api/reviews/1001/comments")
      .send(newComment)
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("not found");
      });
  });
  test("400: bad request if review_id is invalid data type", () => {
    const newComment = { username: "dav3rid", body: "life changing" };
    return request(app)
      .post("/api/reviews/pineapple/comments")
      .send(newComment)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });
  test("400: bad request if missing required fields / wrong keys on object", () => {
    const newComment = { wrongKeyOne: "dav3rid", wrongKeyTwo: "life changing" };
    return request(app)
      .post("/api/reviews/1/comments")
      .send(newComment)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });
});

describe("DELETE /api/comments/:comment_id", () => {
  test("204: no content when deletion is succesful", () => {
    return request(app)
      .delete("/api/comments/1")
      .expect(204)
      .then(({ body }) => {
        expect(body).toEqual({});
      });
  });
  test("404: not found when comment_id does not exist in comments table", () => {
    return request(app)
      .delete("/api/comments/1002")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("not found");
      });
  });
  test("400: bad request when comment_id is wrong data-type", () => {
    return request(app)
      .delete("/api/comments/pineapple")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });
});

describe("PATCH /api/comments/:comment_id", () => {
  test("200: should increment the vote count on a comment and return the updated comment", () => {
    return request(app)
      .patch("/api/comments/1")
      .send({ inc_votes: 50 })
      .expect(200)
      .then(({ body: { comment } }) => {
        expect(comment).toEqual(
          expect.objectContaining({
            votes: 66,
            comment_id: 1,
            body: "I loved this game too!",
            author: "bainesface",
            review_id: 2,
            created_at: "2017-11-22T12:43:33.389Z",
            edited: null
          })
        );
      });
  });
  test("200: should alter the comment body, appending ' *edited*' and return the updated comment", () => {
    return request(app)
      .patch("/api/comments/1")
      .send({ body: "new body who dis?" })
      .expect(200)
      .then(({ body: { comment } }) => {
        expect(comment).toEqual(
          expect.objectContaining({
            votes: 16,
            comment_id: 1,
            body: "new body who dis?",
            edited: true,
            author: "bainesface",
            review_id: 2,
            created_at: "2017-11-22T12:43:33.389Z",
          })
        );
      });
  });
  test("200: should alter both the comment body and votes, then return the updated comment", () => {
    return request(app)
      .patch("/api/comments/1")
      .send({ body: "new body who dis?", inc_votes: 50 })
      .expect(200)
      .then(({ body: { comment } }) => {
        expect(comment).toEqual(
          expect.objectContaining({
            votes: 66,
            comment_id: 1,
            body: "new body who dis?",
            edited: true,
            author: "bainesface",
            review_id: 2,
            created_at: "2017-11-22T12:43:33.389Z",
          })
        );
      });
  });
  test("200: returns unmodified object if no properties on request body", () => {
    const voteUpdate = {};
    return request(app)
      .patch("/api/comments/1")
      .send(voteUpdate)
      .expect(200)
      .then(({ body: { comment } }) => {
        expect(comment).toEqual(
          expect.objectContaining({
            votes: 16,
            comment_id: 1,
            body: "I loved this game too!",
            author: "bainesface",
            review_id: 2,
            created_at: "2017-11-22T12:43:33.389Z",
          })
        );
      });
  });
  test("edited column should never switch back to null after a comment has been edited", () => {
    const bodyUpdate = { body: "this is an edited body"};
    return request(app)
      .patch("/api/comments/1")
      .send(bodyUpdate)
      .expect(200)
      .then(() => {
        return request(app)
        .patch("/api/comments/1")
        .send({ inc_votes: 50 })
        .expect(200)
        .then(({body: {comment}}) => {
          expect(comment).toEqual(
            expect.objectContaining({
              votes: 66,
              comment_id: 1,
              body: "this is an edited body",
              author: "bainesface",
              review_id: 2,
              created_at: "2017-11-22T12:43:33.389Z",
              edited: true
            })
          );
        })
      });
  });
  test("400: bad request if inc_votes is wrong data type", () => {
    const voteUpdate = { inc_votes: "pineapple" };
    return request(app)
      .patch("/api/comments/1")
      .send(voteUpdate)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });
  test("400: bad request if comment_id is wrong data type", () => {
    const voteUpdate = { inc_votes: -100 };
    return request(app)
      .patch("/api/comments/pineapple")
      .send(voteUpdate)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });
  test("404: not found comment_id does not exist in reviews table", () => {
    const voteUpdate = { inc_votes: -100 };
    return request(app)
      .patch("/api/comments/1000")
      .send(voteUpdate)
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("not found");
      });
  });
});

describe("GET /api/reviews/:review_id/comments - pagination", () => {
  test("200: responds with an array of objects up to the length specified by limit parameter", () => {
    return request(app)
      .get("/api/reviews/2/comments?limit=1")
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments.length).toBe(1);
      });
  });
  test("200: responds with a property of total_count that is total number of results that match criteria, disregarding limit", () => {
    return request(app)
      .get("/api/reviews/2/comments?limit=1")
      .expect(200)
      .then(({ body: { total_count } }) => {
        expect(total_count).toBe(3);
      });
  });
  test("200: responds with an empty array if limit is 0", () => {
    return request(app)
      .get("/api/reviews/2/comments?limit=0")
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments).toEqual([]);
      });
  });
  test("400: bad request if p is negative", () => {
    return request(app)
      .get("/api/reviews/2/comments?p=-1")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });
  test("400: bad request if limit is negative", () => {
    return request(app)
      .get("/api/reviews/2/comments?limit=-1")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });
  test("400: bad request if limit is wrong data type", () => {
    return request(app)
      .get("/api/reviews/2/comments?limit=sadjnasdjk")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });
});
