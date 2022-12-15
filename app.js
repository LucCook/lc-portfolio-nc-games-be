const express = require("express");
const { getCategories } = require("./controllers/categories.controllers");
const {
  getCommentsByReviewId,
  postCommentByReviewId,
  deleteComment,
} = require("./controllers/comments.controllers");
const {
  getReviews,
  getReviewById,
  patchReview,
} = require("./controllers/reviews.controllers");
const { getUsers, getUserByUsername } = require("./controllers/users.controllers");
const { getApiEndpoints } = require("./controllers/utility.controllers");
const {
  handle500,
  handle404,
  handleCustom,
  handle400,
} = require("./errors/handlers");

const app = express();

app.use(express.json());
app.get("/api", getApiEndpoints)
app.get("/api/users", getUsers);
app.get("/api/users/:username", getUserByUsername)
app.get("/api/categories", getCategories);
app.get("/api/reviews", getReviews);
app.get("/api/reviews/:review_id", getReviewById);
app.get("/api/reviews/:review_id/comments", getCommentsByReviewId);
app.post("/api/reviews/:review_id/comments", postCommentByReviewId);
app.patch("/api/reviews/:review_id", patchReview)
app.delete("/api/comments/:comment_id", deleteComment)

app.all("*", handle404);

app.use(handleCustom);
app.use(handle400);
app.use(handle500);

module.exports = app;
