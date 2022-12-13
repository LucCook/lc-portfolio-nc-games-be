const db = require("../db/connection.js");

exports.selectCommentsByReviewId = (reviewId) => {
  return db
    .query(
      "SELECT comment_id, votes, created_at, author, body, review_id FROM comments WHERE review_id = $1 ORDER BY created_at DESC",
      [reviewId]
    )
    .then(({ rows: comments }) => {
      return comments;
    });
};
