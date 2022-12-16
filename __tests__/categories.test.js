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

describe("POST /api/categories", () => {
  test("201: should respond with the created category if successful", () => {
    const newCategory = {
      slug: "strategy game",
      description: "you know, risk and stuff",
    };
    return request(app)
      .post("/api/categories")
      .send(newCategory)
      .expect(201)
      .then(({ body: { category } }) => {
        expect(category).toEqual(
          expect.objectContaining({
            slug: "strategy game",
            description: "you know, risk and stuff",
          })
        );
      });
  });
  test("400: bad request if missing required fields / wrong keys on object", () => {
    const newCategory = {
      wrongKeyOne: "dav3rid",
      wrongKeyTwo: "life changing",
    };
    return request(app)
      .post("/api/categories")
      .send(newCategory)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });
  test("400: bad request if slug already exists in categories table", () => {
    const newCategory = {
      slug: "social deduction",
      description: "Players attempt to uncover each other's hidden role",
    };
    return request(app)
      .post("/api/categories")
      .send(newCategory)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });
});
