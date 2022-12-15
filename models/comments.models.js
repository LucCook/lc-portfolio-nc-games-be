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

exports.insertCommentByReviewId = (newComment, reviewId) => {
  const newCommentData = [newComment.username, newComment.body, reviewId];
  return db
    .query(
      "INSERT INTO comments (author, body, review_id) VALUES ($1, $2, $3) RETURNING *",
      newCommentData
    )
    .then(({ rows: [comment] }) => {
      return comment;
    });
};

exports.removeComment = (commentId) => {
  return db
    .query("DELETE FROM comments WHERE comment_id = $1 RETURNING *", [
      commentId,
    ])
    .then(({ rows: [deletedComment] }) => {
      if (!deletedComment) {
        return Promise.reject({ status: 404, msg: "not found" });
      }
    });
};

exports.updateComment = (patchData, commentId) => {
  return db
    .query(
      "UPDATE comments SET votes = votes + $1 WHERE comment_id = $2 RETURNING *",
      [patchData.inc_votes, commentId]
    )
    .then(({ rows: [comment] }) => {
      if (!comment) {
        return Promise.reject({ status: 404, msg: "not found" });
      } else {
        return comment;
      }
    });
};
