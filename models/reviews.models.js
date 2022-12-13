const db = require("../db/connection.js");
const format = require("pg-format")

exports.selectReviews = (queries) => {
  
  let categorySearch = queries.category || "%"
  const orderBy = queries.sort_by || 'created_at'
  const order = queries.order || 'DESC'
  
  if (order.toUpperCase() !== 'DESC' && order.toUpperCase() !== 'ASC') {
    return Promise.reject({status: 400, msg: 'bad request'})
  }

  const sqlString = format("SELECT owner, title, reviews.review_id, category, review_img_url, reviews.created_at, reviews.votes, designer, COUNT(comments.comment_id)::INT AS comment_count FROM reviews LEFT JOIN comments ON reviews.review_id = comments.review_id WHERE category ILIKE %L GROUP BY reviews.review_id ORDER BY reviews.%I %s", categorySearch, orderBy, order)
  return db
    .query(
      sqlString
    )
    .then(({ rows: reviews }) => {
      return reviews;
    });
};

exports.selectReviewById = (reviewId) => {
  return db
    .query("SELECT reviews.*, COUNT(comments.comment_id)::INT AS comment_count FROM reviews LEFT JOIN comments ON reviews.review_id = comments.review_id WHERE reviews.review_id = $1 GROUP BY reviews.review_id", [reviewId])
    .then(({ rows: [review] }) => {
      if (review === undefined) {
        return Promise.reject({ status: 404, msg: "not found" });
      } else return review;
    });
};

exports.updateReview = (patchData, reviewId) => {
  const { inc_votes } = patchData;
  return db
    .query(
      "UPDATE reviews SET votes = votes + $1 WHERE review_id = $2 RETURNING *",
      [inc_votes, reviewId]
    )
    .then(({ rows: [review] }) => {
      if (review === undefined) {
        return Promise.reject({ status: 404, msg: "not found" });
      } else return review;
    });
};
