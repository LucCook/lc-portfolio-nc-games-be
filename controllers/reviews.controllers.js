const {
  selectReviews,
  selectReviewById,
  updateReview,
} = require("../models/reviews.models");
const { checkValueExists } = require("../models/utility.models");

exports.getReviews = (req, res, next) => {
    selectReviews(req.query).then((reviews) => {
        res.status(200).send({reviews})
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
