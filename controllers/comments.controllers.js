const { checkColExists } = require("../db/seeds/utils");
const { selectCommentsByReviewId } = require("../models/comments.models");

exports.getCommentsByReviewId = (req, res, next) => {
  Promise.all([selectCommentsByReviewId(req.params.review_id), checkColExists('reviews', 'review_id', req.params.review_id)
  ])
  
    .then(([comments]) => {
      res.status(200).send({ comments });
    })
    .catch(next);
};
