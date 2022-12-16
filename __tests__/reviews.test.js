const app = require("../app.js");
const seed = require("../db/seeds/seed.js");
const request = require("supertest");
const db = require("../db/connection.js");
const testData = require("../db/data/test-data/index.js");
const fs = require("fs/promises");

afterAll(() => db.end());

beforeEach(() => seed(testData));

describe("GET api/reviews", () => {
  test("200: should respond with an array of objects, each with properties (owner, title, review_id, category, review_img_url, created_at, votes, designer, comment_count)", () => {
    return request(app)
      .get("/api/reviews?limit=100")
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

describe("GET api/reviews?queries", () => {
  test("200: should respond with an array of objects, filtered by category value when passed a category query parameter", () => {
    return request(app)
      .get("/api/reviews?category=social_deduction&limit=100")
      .expect(200)
      .then(({ body: { reviews } }) => {
        expect(reviews.length).toBe(11);
        reviews.forEach((review) => {
          expect(review.category).toBe("social deduction");
        });
      });
  });
  test("200: should respond with an array of objects, sorted by the column defined by the sort_by parameter", () => {
    return request(app)
      .get("/api/reviews?category=social_deduction&limit=100")
      .expect(200)
      .then(({ body: { reviews } }) => {
        expect(reviews.length).toBe(11);
        reviews.forEach((review) => {
          expect(review.category).toBe("social deduction");
        });
      });
  });

  test("200: should respond with an empty array when passed a category query parameter that exists in the category table but has no associated reviews in the review table", () => {
    return request(app)
      .get("/api/reviews?category=children's_games")
      .expect(200)
      .then(({ body: { reviews } }) => {
        expect(reviews.length).toBe(0);
      });
  });
  test("200: should respond with an array of objects, sorted by the column defined by the sort_by parameter, in descending order", () => {
    return request(app)
      .get("/api/reviews?sort_by=votes&limit=100")
      .expect(200)
      .then(({ body: { reviews } }) => {
        expect(reviews.length).toBe(13);
        expect(reviews).toBeSortedBy("votes", { descending: true });
      });
  });
  test("200: should respond with an array of objects, sorted by date, ascending if passed ASC as order parameter", () => {
    return request(app)
      .get("/api/reviews?order=ASC&limit=100")
      .expect(200)
      .then(({ body: { reviews } }) => {
        expect(reviews.length).toBe(13);
        expect(reviews).toBeSortedBy("created_at", { descending: false });
      });
  });
  test("200: should respond appropriately when passed a combination of query parameters", () => {
    return request(app)
      .get(
        "/api/reviews?category=social_deduction&sort_by=votes&order=ASC&limit=100"
      )
      .expect(200)
      .then(({ body: { reviews } }) => {
        expect(reviews.length).toBe(11);
        expect(reviews).toBeSortedBy("votes", { descending: false });
        reviews.forEach((review) => {
          expect(review.category).toBe("social deduction");
        });
      });
  });
  test("200: should respond with a single review if review_id query parameter is not undefined", () => {
    return request(app)
      .get(
        "/api/reviews?review_id=1"
      )
      .expect(200)
      .then(({ body: { reviews } }) => {
        expect(reviews.length).toBeGreaterThan(0);
         reviews.forEach((review) => {
          expect(review.review_id).toBe(1)
        });
      });
  });
  test("400: bad request if sort_by parameter is not a column", () => {
    return request(app)
      .get("/api/reviews?sort_by=most_number_of_pieces")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });
  test("400: bad request if order parameter is not ASC / DESC", () => {
    return request(app)
      .get("/api/reviews?order=DROP_TABLES")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });
  test("404: not found if category parameter does not exist in category table", () => {
    return request(app)
      .get("/api/reviews?category=first_person_shooters")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("not found");
      });
  });
});

describe("GET /api/reviews/:review_id", () => {
  test("200: should respond with a single object, with properties (review_id, title, review_body, designer, review_img_url, votes, category, owner, created_at) when passed a valid review_id", () => {
    return request(app)
      .get("/api/reviews/1")
      .expect(200)
      .then(({ body: { review } }) => {
        expect(review).toEqual(
          expect.objectContaining({
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
          })
        );
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

describe("GET /api/reviews/:review_id - with comment_count", () => {
  test("200: should respond with a single object, with additional property of comment_count, equal to the number of comments associated with this review", () => {
    return request(app)
      .get("/api/reviews/2")
      .expect(200)
      .then(({ body: { review } }) => {
        expect(review.comment_count).toBe(3);
      });
  });
});

describe("PATCH /api/reviews/:review_id", () => {
  test("200: returns updated review if patch succesful (increase votes)", () => {
    const voteUpdate = { inc_votes: 100 };
    return request(app)
      .patch("/api/reviews/1")
      .send(voteUpdate)
      .expect(200)
      .then(({ body: { review } }) => {
        expect(review).toEqual(
          expect.objectContaining({
            title: expect.any(String),
            votes: 101,
            designer: expect.any(String),
            review_id: 1,
            created_at: expect.any(String),
            review_img_url: expect.any(String),
            category: expect.any(String),
            review_body: expect.any(String),
          })
        );
      });
  });
  test("200: returns updated review if patch succesful (decrease votes)", () => {
    const voteUpdate = { inc_votes: -100 };
    return request(app)
      .patch("/api/reviews/1")
      .send(voteUpdate)
      .expect(200)
      .then(({ body: { review } }) => {
        expect(review).toEqual(
          expect.objectContaining({
            title: expect.any(String),
            votes: -99,
            designer: expect.any(String),
            review_id: 1,
            created_at: expect.any(String),
            review_img_url: expect.any(String),
            category: expect.any(String),
            review_body: expect.any(String),
          })
        );
      });
  });
  test("200: returns updated review if patch succesful (alter review body)", () => {
    const voteUpdate = { review_body: "new body who dis?" };
    return request(app)
      .patch("/api/reviews/1")
      .send(voteUpdate)
      .expect(200)
      .then(({ body: { review } }) => {
        expect(review).toEqual(
          expect.objectContaining({
            title: expect.any(String),
            votes: 1,
            designer: expect.any(String),
            review_id: 1,
            created_at: expect.any(String),
            review_img_url: expect.any(String),
            category: expect.any(String),
            review_body: "new body who dis?",
          })
        );
      });
  });
  test("200: returns updated review if patch succesful (alter review img url)", () => {
    const voteUpdate = { review_img_url: "new url who dis?" };
    return request(app)
      .patch("/api/reviews/1")
      .send(voteUpdate)
      .expect(200)
      .then(({ body: { review } }) => {
        expect(review).toEqual(
          expect.objectContaining({
            title: expect.any(String),
            votes: 1,
            designer: expect.any(String),
            review_id: 1,
            created_at: expect.any(String),
            review_img_url: "new url who dis?",
            category: expect.any(String),
            review_body: expect.any(String),
          })
        );
      });
  });
  test("200: returns updated review if patch succesful (multiple properites)", () => {
    const voteUpdate = {
      inc_votes: 100,
      review_body: "new body who dis?",
      review_img_url: "new url who dis?",
    };
    return request(app)
      .patch("/api/reviews/1")
      .send(voteUpdate)
      .expect(200)
      .then(({ body: { review } }) => {
        expect(review).toEqual(
          expect.objectContaining({
            title: expect.any(String),
            votes: 101,
            designer: expect.any(String),
            review_id: 1,
            created_at: expect.any(String),
            review_img_url: "new url who dis?",
            category: expect.any(String),
            review_body: "new body who dis?",
          })
        );
      });
  });
  test("200: returns original review if inc_votes is missing from the body", () => {
    const voteUpdate = {};
    return request(app)
      .patch("/api/reviews/1")
      .send(voteUpdate)
      .expect(200)
      .then(({ body: { review } }) => {
        expect(review).toEqual(
          expect.objectContaining({
            title: expect.any(String),
            votes: 1,
            designer: expect.any(String),
            review_id: 1,
            created_at: expect.any(String),
            review_img_url: expect.any(String),
            category: expect.any(String),
            review_body: expect.any(String),
          })
        );
      });
  });
  test("400: bad request if inc_votes is wrong data type", () => {
    const voteUpdate = { inc_votes: "pineapple" };
    return request(app)
      .patch("/api/reviews/1")
      .send(voteUpdate)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });

  test("400: bad request if review_id is wrong data type", () => {
    const voteUpdate = { inc_votes: -100 };
    return request(app)
      .patch("/api/reviews/pineapple")
      .send(voteUpdate)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });
  test("404: not found review_id does not exist in reviews table", () => {
    const voteUpdate = { inc_votes: -100 };
    return request(app)
      .patch("/api/reviews/1000")
      .send(voteUpdate)
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("not found");
      });
  });
});

describe("POST /api/reviews", () => {
  test("201: responds with created review object if succesful", () => {
    const newReview = {
      owner: "mallionaire",
      title: "this is a title",
      review_body: "this is a review body",
      designer: "this is a designer",
      category: "euro game",
    };
    return request(app)
      .post("/api/reviews")
      .send(newReview)
      .expect(201)
      .then(({ body: { review } }) => {
        expect(review).toEqual(
          expect.objectContaining({
            owner: "mallionaire",
            review_id: expect.any(Number),
            created_at: expect.any(String),
            title: "this is a title",
            review_body: "this is a review body",
            designer: "this is a designer",
            category: "euro game",
            comment_count: 0,
            votes: 0,
          })
        );
      });
  });
  test("400: bad request if missing required fields / wrong keys on object", () => {
    const newReview = { wrongKeyOne: "dav3rid", wrongKeyTwo: "life changing" };
    return request(app)
      .post("/api/reviews")
      .send(newReview)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });
  test("404: not found if username does not exist on users table", () => {
    const newReview = {
      owner: "this is a fake name",
      title: "this is a title",
      review_body: "this is a review body",
      designer: "this is a designer",
      category: "euro game",
    };
    return request(app)
      .post("/api/reviews")
      .send(newReview)
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("not found");
      });
  });
  test("404: not found if category does not exist on categories table", () => {
    const newReview = {
      owner: "mallionaire",
      title: "this is a title",
      review_body: "this is a review body",
      designer: "this is a designer",
      category: "this is a fake category",
    };
    return request(app)
      .post("/api/reviews")
      .send(newReview)
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("not found");
      });
  });
});

describe("GET /api/reviews Pagination", () => {
  test("200: responds with an array of objects up to the length specified by limit parameter", () => {
    return request(app)
      .get("/api/reviews?limit=3")
      .expect(200)
      .then(({ body: { reviews } }) => {
        expect(reviews.length).toBe(3);
      });
  });
  test("200: responds with an array of objects offset by the page * limit", () => {
    return request(app)
      .get("/api/reviews?sort_by=review_id&limit=3&p=2&order=asc")
      .expect(200)
      .then(({ body: { reviews } }) => {
        expect(reviews[0].review_id).toBe(4);
      });
  });
  test("200: responds with a property of total_count that is total number of results that match criteria, disregarding limit", () => {
    return request(app)
      .get("/api/reviews?limit=3")
      .expect(200)
      .then(({ body: { total_count } }) => {
        expect(total_count).toBe(13);
      });
  });
  test("200: responds with an empty array if limit is 0", () => {
    return request(app)
      .get("/api/reviews?limit=0")
      .expect(200)
      .then(({ body: { reviews } }) => {
        expect(reviews).toEqual([]);
      });
  });
  test("400: bad request if p is negative", () => {
    return request(app)
      .get("/api/reviews?p=-1")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });
  test("400: bad request if limit is negative", () => {
    return request(app)
      .get("/api/reviews?limit=-1")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });
  test("400: bad request if limit is wrong data type", () => {
    return request(app)
      .get("/api/reviews?limit=sadjnasdjk")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });
  test("limit defaults to 10", () => {
    return Promise.all([
      request(app).get("/api/reviews?p=1"),
      request(app).get("/api/reviews?limit=10000&p=1"),
    ]).then(
      ([
        {
          body: { reviews: defaultLimit },
        },
        {
          body: { reviews: unlimited },
        },
      ]) => {
        expect(unlimited.length).toBeGreaterThan(defaultLimit.length);
        expect(defaultLimit.length).toBe(10);
      }
    );
  });
  test("p defaults to 1", () => {
    return request(app)
      .get("/api/reviews?sort_by=review_id&order=asc")
      .then(({ body: { reviews } }) => {
        expect(reviews[0].review_id).toBe(1);
      });
  });
});

describe("DELETE /api/reviews/:review_id", () => {
  test("204: returns nothing when deletion succesful", () => {
    return request(app)
      .delete("/api/reviews/1")
      .expect(204)
      .then(({ body }) => {
        expect(body).toEqual({});
      });
  });
  test("404: not found when review_id does not exist in reviews table", () => {
    return request(app)
      .delete("/api/reviews/1002")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("not found");
      });
  });
  test("400: bad request when review_id is wrong data-type", () => {
    return request(app)
      .delete("/api/reviews/pineapple")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });
});
