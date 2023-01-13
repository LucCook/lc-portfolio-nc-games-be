const {
  selectReviews,
  selectReviewById,
  updateReview,
  insertReview,
  removeReview
} = require("../models/reviews.models");
const { checkValueExists } = require("../models/utility.models");

exports.getReviews = (req, res, next) => {
    
    const promises = [selectReviews(req.query)]
    if (req.query.author) {
      promises.push(checkValueExists('users', 'username', req.query.author))
    }
    if (req.query.category) {
      promises.push(checkValueExists('categories', 'slug', req.query.category))
    }
    Promise.all(promises).then(([[reviews, total_count]]) => {
        res.status(200).send({total_count, reviews})
    }).catch(next)
}

exports.getReviewById = (req, res, next) => {
  selectReviewById(req.params.review_id)
    .then((review) => {
      res.status(200).send({ review });
    })
    .catch(next);
};

exports.patchReview = (req, res, next) => {
  updateReview(req.body, req.params.review_id)
    .then((review) => {
      res.status(200).send({ review });
    })
    .catch(next);
};

exports.postReview = (req, res, next) => {
  insertReview(req.body)
  .then((review) => {
    res.status(201).send({review})
  }).catch(next)
}

exports.deleteReview = (req, res, next) => {
  removeReview(req.params.review_id).then(() => {
    res.status(204).send({})
  }).catch(next)
}
