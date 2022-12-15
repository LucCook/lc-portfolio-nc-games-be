const express = require("express");

const {
  getCommentsByReviewId,
  postCommentByReviewId,
  deleteComment,
} = require("./controllers/comments.controllers");

const {
  handle500,
  handle404,
  handleCustom,
  handle400,
} = require("./errors/handlers");
const apiRouter = require("./routes/api-router");

const app = express();


app.use(express.json());

app.use('/api', apiRouter)
// app.get("/api/reviews/:review_id/comments", getCommentsByReviewId);
// app.post("/api/reviews/:review_id/comments", postCommentByReviewId);

// app.delete("/api/comments/:comment_id", deleteComment)

app.all("*", handle404);

app.use(handleCustom);
app.use(handle400);
app.use(handle500);

module.exports = app;
