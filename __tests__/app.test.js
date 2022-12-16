const app = require("../app.js");
const seed = require("../db/seeds/seed.js");
const request = require("supertest");
const db = require("../db/connection.js");
const testData = require("../db/data/test-data/index.js");
const fs = require("fs/promises");

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
      .get("/api/reviews?category=social_deduction&sort_by=votes&order=ASC&limit=100")
      .expect(200)
      .then(({ body: { reviews } }) => {
        expect(reviews.length).toBe(11);
        expect(reviews).toBeSortedBy("votes", { descending: false });
        reviews.forEach((review) => {
          expect(review.category).toBe("social deduction");
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

describe("GET /api/users", () => {
  test("200: should respond with an array of user objects, each with keys of (username, name, avatar_url)", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body: { users } }) => {
        expect(users.length).toBe(4);
        users.forEach((user) => {
          expect(user).toEqual(
            expect.objectContaining({
              username: expect.any(String),
              name: expect.any(String),
              avatar_url: expect.any(String),
            })
          );
        });
      });
  });
});

describe("PATCH /api/reviews/:review_id", () => {
  test("200: returns updated comment if patch succesful (increase votes)", () => {
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
  test("200: returns updated comment if patch succesful (decrease votes)", () => {
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
  test("400: bad request if inc_votes is missing from body", () => {
    const voteUpdate = {};
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

describe("GET /api", () => {
  test("200: should respond with a JSON object of available endpoints", () => {
    return Promise.all([
      fs.readFile(`${__dirname}/../endpoints.json`, "utf8"),
      request(app).get("/api").expect(200),
    ]).then(
      ([
        jsonFile,
        {
          body: { API },
        },
      ]) => {
        expect(API).toEqual(JSON.parse(jsonFile));
      }
    );
  });
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

describe("PATCH /api/comments/:comment_id", () => {
  test("200: should increment the vote count on a comment and return the updated comment", () => {
    return request(app)
      .patch("/api/comments/1")
      .send({inc_votes: 50})
      .expect(200)
      .then(({body: {comment}}) => {
        expect(comment).toEqual(expect.objectContaining({
          votes: 66,
          comment_id: 1,
          body: 'I loved this game too!',
          author: 'bainesface',
          review_id: 2,
          created_at: "2017-11-22T12:43:33.389Z",
        }))
      })
  })
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
  test("400: bad request if inc_votes is missing from body", () => {
    const voteUpdate = {};
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
})

describe('GET /api/users/:username', () => {
  test("200: should respond with a user object matching username parameter", () => {
    return request(app)
      .get("/api/users/mallionaire")
      .expect(200)
      .then(({body : {user}}) => {
        expect(user).toEqual(expect.objectContaining({
          name: 'haz',
          username: 'mallionaire',
          avatar_url: 'https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg'
        }))
      })
  })
  test("404: not found when username does not exist in users table", () => {
    return request(app)
      .get("/api/users/fakename")
      .expect(404)
      .then(({body: {msg}}) => {
        expect(msg).toBe("not found")
      })
  })
  test("400: bad request when username is attempted SQL injection", () => {
    return request(app)
      .get("/api/users/%;DROP TABLE users")
      .expect(400)
      .then(({body: {msg}}) => {
        expect(msg).toBe("bad request")
      })
  })
});

describe('POST /api/reviews', () => {
  test('201: responds with created review object if succesful', () => {
    const newReview = {
      owner: "mallionaire",
      title: "this is a title",
      review_body: "this is a review body",
      designer: "this is a designer",
      category: "euro game"
    }
    return request(app)
    .post("/api/reviews")
    .send(newReview)
    .expect(201)
    .then(({body :{review}}) => {
      expect(review).toEqual(expect.objectContaining
      ({
        owner: "mallionaire",
        review_id: expect.any(Number),
        created_at: expect.any(String),
        title: "this is a title",
        review_body: "this is a review body",
        designer: "this is a designer",
        category: "euro game",
        comment_count: 0,
        votes: 0
      }))
    })
  })
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
      category: "euro game"
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
      category: "this is a fake category"
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

describe('GET /api/reviews Pagination', () => {
  test("200: responds with an array of objects up to the length specified by limit parameter", () => {
    return request(app)
      .get("/api/reviews?limit=3")
      .expect(200)
      .then(({body : {reviews}}) => {
        expect(reviews.length).toBe(3)
      })
  })
  test("200: responds with an array of objects offset by the page * limit", () => {
    return request(app)
      .get("/api/reviews?sort_by=review_id&limit=3&p=2&order=asc")
      .expect(200)
      .then(({body : {reviews}}) => {
        expect(reviews[0].review_id).toBe(4)
      })
  })
  test("200: responds with a property of total_count that is total number of results that match criteria, disregarding limit", () => {
    return request(app)
      .get("/api/reviews?limit=3")
      .expect(200)
      .then(({body : {total_count}}) => {
        expect(total_count).toBe(13)
      })
  })
  test("200: responds with an empty array if limit is 0", () => {
    return request(app)
      .get("/api/reviews?limit=0")
      .expect(200)
      .then(({body : {reviews}}) => {
        expect(reviews).toEqual([])
      })
  })
  test("400: bad request if p is negative", () => {
    return request(app)
      .get("/api/reviews?p=-1")
      .expect(400)
      .then(({body : {msg}}) => {
        expect(msg).toBe("bad request")
      })
  })
  test("400: bad request if limit is negative", () => {
    return request(app)
      .get("/api/reviews?limit=-1")
      .expect(400)
      .then(({body : {msg}}) => {
        expect(msg).toBe("bad request")
      })
  })
  test("400: bad request if limit is wrong data type", () => {
    return request(app)
      .get("/api/reviews?limit=sadjnasdjk")
      .expect(400)
      .then(({body : {msg}}) => {
        expect(msg).toBe("bad request")
      })
  })
  test("limit defaults to 10", () => {
    return Promise.all([request(app).get("/api/reviews?p=1"), request(app).get("/api/reviews?limit=10000&p=1")])
     .then(([{body: {reviews: defaultLimit}}, {body: {reviews: unlimited}}]) => {
        expect(unlimited.length).toBeGreaterThan(defaultLimit.length)
        expect(defaultLimit.length).toBe(10)
      })
  })
  test("p defaults to 1", () => {
    return request(app).get("/api/reviews?sort_by=review_id&order=asc")
     .then(({body: {reviews}}) => {
        expect(reviews[0].review_id).toBe(1)
      })
  })
});

describe('GET /api/reviews/:review_id/comments - pagination', () => {
  test("200: responds with an array of objects up to the length specified by limit parameter", () => {
    return request(app)
      .get("/api/reviews/2/comments?limit=1")
      .expect(200)
      .then(({body : {comments}}) => {
        expect(comments.length).toBe(1)
      })
  })
  test("200: responds with a property of total_count that is total number of results that match criteria, disregarding limit", () => {
    return request(app)
      .get("/api/reviews/2/comments?limit=1")
      .expect(200)
      .then(({body : {total_count}}) => {
        expect(total_count).toBe(3)
      })
  })
  test("200: responds with an empty array if limit is 0", () => {
    return request(app)
      .get("/api/reviews/2/comments?limit=0")
      .expect(200)
      .then(({body : {comments}}) => {
        expect(comments).toEqual([])
      })
  })
  test("400: bad request if p is negative", () => {
    return request(app)
      .get("/api/reviews/2/comments?p=-1")
      .expect(400)
      .then(({body : {msg}}) => {
        expect(msg).toBe("bad request")
      })
  })
  test("400: bad request if limit is negative", () => {
    return request(app)
      .get("/api/reviews/2/comments?limit=-1")
      .expect(400)
      .then(({body : {msg}}) => {
        expect(msg).toBe("bad request")
      })
  })
  test("400: bad request if limit is wrong data type", () => {
    return request(app)
      .get("/api/reviews/2/comments?limit=sadjnasdjk")
      .expect(400)
      .then(({body : {msg}}) => {
        expect(msg).toBe("bad request")
      })
  })
});