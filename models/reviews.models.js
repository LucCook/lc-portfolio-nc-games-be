const db = require("../db/connection.js");

exports.selectReviews = (queries) => {
  const {
    category,
    sort_by = "created_at",
    order = "DESC",
    limit = 10,
    p = 1,
    review_id,
  } = queries;

  const offset = (p - 1) * limit;
  const validCols = [
    "owner",
    "title",
    "review_id",
    "category",
    "review_img_url",
    "created_at",
    "votes",
    "designer",
    "comment_count",
  ];

  if (!validCols.includes(sort_by)) {
    return Promise.reject({ status: 400, msg: "bad request" });
  }

  if (order.toUpperCase() !== "DESC" && order.toUpperCase() !== "ASC") {
    return Promise.reject({ status: 400, msg: "bad request" });
  }

  // Not using pg-format
  const sqlStringResultsNoFormat = `SELECT owner, title, reviews.review_id, category, review_img_url, reviews.created_at, reviews.votes, designer, COUNT(comments.comment_id)::INT AS comment_count
  FROM reviews
  LEFT JOIN comments ON reviews.review_id = comments.review_id
  WHERE (category ILIKE $1 OR $1 IS NULL)
  AND (reviews.review_id = $2 OR $2 IS NULL)
  GROUP BY reviews.review_id
  ORDER BY reviews.${sort_by} ${order}
  LIMIT $3
  OFFSET $4`;

  const sqlStringResultCountNoFormat = `SELECT COUNT(*)::INT AS total_reviews FROM reviews 
  WHERE (category ILIKE $1 OR $1 IS NULL)
  AND (review_id = $2 OR $2 IS NULL)`;

  return Promise.all([
    db.query(sqlStringResultsNoFormat, [category, review_id, limit, offset]),
    db.query(sqlStringResultCountNoFormat, [category, review_id]),
  ]).then(
    ([
      { rows: reviews },
      {
        rows: [{ total_reviews }],
      },
    ]) => {
      return [reviews, total_reviews];
    }
  );
};

exports.selectReviewById = (reviewId) => {
  return db
    .query(
      "SELECT reviews.*, COUNT(comments.comment_id)::INT AS comment_count FROM reviews LEFT JOIN comments ON reviews.review_id = comments.review_id WHERE reviews.review_id = $1 GROUP BY reviews.review_id",
      [reviewId]
    )
    .then(({ rows: [review] }) => {
      if (review === undefined) {
        return Promise.reject({ status: 404, msg: "not found" });
      } else return review;
    });
};

exports.updateReview = (patchData, reviewId) => {
  const { inc_votes, review_body, review_img_url } = patchData;
  return db
    .query(
      `UPDATE reviews SET 
      votes = votes + COALESCE($1, 0),
      review_body = COALESCE($2, review_body),
      review_img_url = COALESCE($3, review_img_url)
      WHERE review_id = $4 
      RETURNING *`,
      [inc_votes, review_body, review_img_url, reviewId]
    )
    .then(({ rows: [review] }) => {
      if (review === undefined) {
        return Promise.reject({ status: 404, msg: "not found" });
      } else return review;
    });
};

exports.insertReview = (newReview) => {
  const newReviewData = [
    newReview.owner,
    newReview.title,
    newReview.review_body,
    newReview.designer,
    newReview.category,
  ];
  return db
    .query(
      "INSERT INTO reviews (owner, title, review_body, designer, category) VALUES ($1, $2, $3, $4, $5) RETURNING *, 0 AS comment_count",
      newReviewData
    )
    .then(({ rows: [review] }) => {
      return review;
    });
};

exports.removeReview = (reviewId) => {
  return db
    .query("DELETE FROM reviews WHERE review_id = $1 RETURNING *", [reviewId])
    .then(({ rows: [review] }) => {
      if (!review) {
        return Promise.reject({ status: 404, msg: "not found" });
      }
    });
};
