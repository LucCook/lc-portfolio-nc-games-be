const {
  selectCommentsByReviewId,
  insertCommentByReviewId,
  removeComment,
} = require("../models/comments.models");
const { checkValueExists } = require("../models/utility.models");

exports.getCommentsByReviewId = (req, res, next) => {
  Promise.all([
    selectCommentsByReviewId(req.params.review_id),
    checkValueExists("reviews", "review_id", parseInt(req.params.review_id)),
  ])

    .then(([comments]) => {
      res.status(200).send({ comments });
    })
    .catch(next);
};

exports.postCommentByReviewId = (req, res, next) => {
  insertCommentByReviewId(req.body, req.params.review_id)
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch(next);
};

exports.deleteComment = (req, res, next) => {
  removeComment(req.params.comment_id)
    .then(() => {
      res.status(204).send({});
    })
    .catch(next);
};
