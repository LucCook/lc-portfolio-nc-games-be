const db = require("../db/connection.js");
const format = require("pg-format")

exports.selectReviews = (queries) => {
  
  let categorySearch = queries.category || "%"
  const orderBy = queries.sort_by || 'created_at'
  const order = queries.order || 'DESC'
  const limit = queries.limit || 10
  const offset = limit * (queries.p - 1)|| 0
  
  if (order.toUpperCase() !== 'DESC' && order.toUpperCase() !== 'ASC') {
    return Promise.reject({status: 400, msg: 'bad request'})
  }

  const sqlStringResults = format("SELECT owner, title, reviews.review_id, category, review_img_url, reviews.created_at, reviews.votes, designer, COUNT(reviews.review_id)::INT AS total_results ,COUNT(comments.comment_id)::INT AS comment_count FROM reviews LEFT JOIN comments ON reviews.review_id = comments.review_id WHERE category ILIKE %L GROUP BY reviews.review_id ORDER BY reviews.%I %s LIMIT %L OFFSET %L", categorySearch, orderBy, order, limit, offset)
  const sqlStringResultCount = format("SELECT COUNT(*)::INT AS total_reviews FROM reviews WHERE category ILIKE %L", categorySearch)

  return Promise.all([db.query(sqlStringResults), db.query(sqlStringResultCount)])
    .then(([{ rows: reviews }, {rows: [{total_reviews}]}]) => {
      return [reviews, total_reviews];
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

exports.insertReview = (newReview) => {
  const newReviewData = [newReview.owner, newReview.title, newReview.review_body, newReview.designer, newReview.category]
  return db.query("INSERT INTO reviews (owner, title, review_body, designer, category) VALUES ($1, $2, $3, $4, $5) RETURNING *, 0 AS comment_count", newReviewData)
  .then(({ rows : [review]}) => {
    return review
  })
}
