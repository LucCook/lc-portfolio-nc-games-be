const db = require("../db/connection.js");

exports.selectCommentsByReviewId = (reviewId) => {
  return db
    .query(
      "SELECT comment_id, votes, created_at, author, body, review_id FROM comments WHERE review_id = $1",
      [reviewId]
    )
    .then(({ rows: comments }) => {
      console.log(comments.length);
      if (!comments.length) {
        return Promise.reject({ status: 404, msg: "not found" });
      } else return comments;
    });
};
