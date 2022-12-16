const app = require("../app.js");
const seed = require("../db/seeds/seed.js");
const request = require("supertest");
const db = require("../db/connection.js");
const testData = require("../db/data/test-data/index.js");
const fs = require("fs/promises");

afterAll(() => db.end());

beforeEach(() => seed(testData));

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
