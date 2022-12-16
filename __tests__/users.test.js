const app = require("../app.js");
const seed = require("../db/seeds/seed.js");
const request = require("supertest");
const db = require("../db/connection.js");
const testData = require("../db/data/test-data/index.js");
const fs = require("fs/promises");

afterAll(() => db.end());

beforeEach(() => seed(testData));

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

describe("GET /api/users/:username", () => {
  test("200: should respond with a user object matching username parameter", () => {
    return request(app)
      .get("/api/users/mallionaire")
      .expect(200)
      .then(({ body: { user } }) => {
        expect(user).toEqual(
          expect.objectContaining({
            name: "haz",
            username: "mallionaire",
            avatar_url:
              "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg",
          })
        );
      });
  });
  test("404: not found when username does not exist in users table", () => {
    return request(app)
      .get("/api/users/fakename")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("not found");
      });
  });
  test("400: bad request when username is attempted SQL injection", () => {
    return request(app)
      .get("/api/users/%;DROP TABLE users")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });
});
