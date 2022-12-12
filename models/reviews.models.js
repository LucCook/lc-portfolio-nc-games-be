const db = require("../db/connection.js");

exports.selectReviews = () => {
  return db
    .query(
      "SELECT owner, title, reviews.review_id, category, review_img_url, reviews.created_at, reviews.votes, designer, COUNT(comments.comment_id)::INT AS comment_count FROM reviews LEFT JOIN comments ON reviews.review_id = comments.review_id GROUP BY reviews.review_id ORDER BY reviews.created_at DESC"
    )
    .then(({ rows: reviews }) => {
      return reviews;
    });
};

exports.selectReviewById = (reviewId) => {
  return db
    .query("SELECT * FROM reviews WHERE review_id = $1", [reviewId])
    .then(({ rows: [review] }) => {
      if (review === undefined) {
        return Promise.reject({ status: 404, msg: "not found" });
      } else return review;
    });
};
