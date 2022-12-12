const app = require("../app.js");
const seed = require("../db/seeds/seed.js");
const request = require("supertest");
const db = require("../db/connection.js");
const testData = require("../db/data/test-data/index.js");

afterAll(() => db.end());

beforeEach(() => seed(testData));

describe("GET api/categories", () => {
  test("200: should respond with an array of objects, each with properties slug & description", () => {
    return request(app)
      .get("/api/categories")
      .expect(200)
      .then(({ body: { categories } }) => {
        expect(categories.length).toBe(4);
        categories.forEach((category) => {
          expect(category).toEqual(
            expect.objectContaining({
              slug: expect.any(String),
              description: expect.any(String),
            })
          );
        });
      });
  });
});

describe("GET api/reviews", () => {
  test("200: should respond with an array of objects, each with properties (owner, title, review_id, category, review_img_url, created_at, votes, designer, comment_count)", () => {
    return request(app)
      .get("/api/reviews")
      .expect(200)
      .then(({ body: { reviews } }) => {
        expect(reviews.length).toBe(13);
        reviews.forEach((review) => {
          expect(review).toEqual(
            expect.objectContaining({
              review_id: expect.any(Number),
              title: expect.any(String),
              designer: expect.any(String),
              owner: expect.any(String),
              review_img_url: expect.any(String),
              category: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
              comment_count: expect.any(Number),
            })
          );
        });
      });
  });
  test("200: response array should be sorted by date in descending order)", () => {
    return request(app)
      .get("/api/reviews")
      .expect(200)
      .then(({ body: { reviews } }) => {
        expect(reviews).toBeSortedBy("created_at", { descending: true });
      });
  });
});

describe("GET /api/reviews/:review_id", () => {
  test("200: should respond with a single object, with properties (review_id, title, review_body, designer, review_img_url, votes, category, owner, created_at) when passed a valid review_id", () => {
    return request(app)
      .get("/api/reviews/1")
      .expect(200)
      .then(({ body: { review } }) => {
        expect(review).toEqual({
          review_id: 1,
          title: "Agricola",
          designer: "Uwe Rosenberg",
          owner: "mallionaire",
          review_img_url:
            "https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png",
          review_body: "Farmyard fun!",
          category: "euro game",
          created_at: "2021-01-18T10:00:20.514Z",
          votes: 1,
        });
      });
  });
  test("404: not found when review_id is valid but does not exist in table", () => {
    return request(app)
      .get("/api/reviews/10000")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("not found");
      });
  });
  test("400: bad request when review_id is an invalid data type", () => {
    return request(app)
      .get("/api/reviews/pineapple")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });
});

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
              review_id: expect.toBeInteger(2),
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
  test("404: not found if no comments with the specified review_id", () => {
    return request(app)
      .get("/api/reviews/200/comments")
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

describe('POST /api/reviews/:review_id/comments', () => {
    test("201: responds with posted comment if succesful", () => {
        const newComment = { username: 'dav3rid', body: 'life changing'}
        return request(app)
        .post("/api/reviews/1/comments")
        .send(newComment)
        .expect(201)
        .then(({body: {comment}}) => {
            expect(comment).toEqual({
                comment_id: 7,
                author: 'dav3rid',
                body: 'life changing',
                created_at: expect.any(String),
                review_id: 1,
                votes: 0
            })
        })
    })
    test("400: bad request if username does not exist in users table", () => {
        const newComment = { username: 'fakeName123', body: 'life changing'}
        return request(app)
        .post("/api/reviews/1/comments")
        .send(newComment)
        .expect(400).then(({body : {msg}}) => {
            expect(msg).toBe("bad request")
        })
    })
    test("400: bad request if review_id does not exist in reviews table", () => {
        const newComment = { username: 'dav3rid', body: 'life changing'}
        return request(app)
        .post("/api/reviews/1001/comments")
        .send(newComment)
        .expect(400).then(({body : {msg}}) => {
            expect(msg).toBe("bad request")
        })
    })
    test("400: bad request if review_id is invalid data type", () => {
        const newComment = { username: 'dav3rid', body: 'life changing'}
        return request(app)
        .post("/api/reviews/pineapple/comments")
        .send(newComment)
        .expect(400).then(({body : {msg}}) => {
            expect(msg).toBe("bad request")
        })
    })
});

describe("request invalid path", () => {
  test("404: not found when requesting a non existent path", () => {
    return request(app)
      .get("/asjdfnkjasdnfjk")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("not found");
      });
  });
});
