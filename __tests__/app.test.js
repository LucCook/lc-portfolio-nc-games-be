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
      .then(({ body : {categories}}) => {
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
      .then(({ body : {reviews}}) => {
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
      .then(({ body: {reviews} }) => {
        expect(reviews).toBeSortedBy("created_at", { descending: true });
      });
  });
});

describe("GET /api/reviews/:review_id", () => {
  test("200: should respond with a single object, with properties (review_id, title, review_body, designer, review_img_url, votes, category, owner, created_at) when passed a valid review_id", () => {
    return request(app)
      .get("/api/reviews/1")
      .expect(200)
      .then(({ body: {review} }) => {
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
      .then(({ body : {msg} }) => {
        expect(msg).toBe("not found")
      });
  });
  test("400: bad request when review_id is an invalid data type", () => {
    return request(app)
      .get("/api/reviews/pineapple")
      .expect(400)
      .then(({ body : {msg} }) => {
        expect(msg).toBe("bad request")
      });
  });
});

describe("request invalid path", () => {
  test("404: not found when requesting a non existent path", () => {
    return request(app)
      .get("/asjdfnkjasdnfjk")
      .expect(404)
      .then(({ body: {msg} }) => {
        expect(msg).toBe("not found");
      });
  });
});
