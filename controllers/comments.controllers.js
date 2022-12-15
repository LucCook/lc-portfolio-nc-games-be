const { selectCommentsByReviewId, insertCommentByReviewId, removeComment } = require("../models/comments.models");
const { checkValueExists } = require("../models/utility.models");


exports.getCommentsByReviewId = (req, res, next) => {
  console.log(Object.keys(req))
  console.log(req.params)
  console.log(req.baseUrl + '<< base url')
  console.log(req.originalUrl + '<< OG url')
  console.log(req.url + '<< url')
  
  
  // console.log(req.baseUrl.split('/')[3])
  
  // Promise.all([selectCommentsByReviewId(req.params.review_id), checkValueExists('reviews', 'review_id', parseInt(req.params.review_id))
  // ])
  Promise.all([selectCommentsByReviewId(req.baseUrl.split('/')[3]), checkValueExists('reviews', 'review_id', parseInt(req.baseUrl.split('/')[3]))
  ])
  
    .then(([comments]) => {
      res.status(200).send({ comments });
    })
    .catch(next);
};

exports.postCommentByReviewId = (req, res, next) => {
    // insertCommentByReviewId(req.body, req.params.review_id)
    insertCommentByReviewId(req.body, req.baseUrl.split('/')[3])
    .then((comment) => {
        res.status(201).send({comment})
    }).catch(next)
}

exports.deleteComment = (req, res, next) => {
  removeComment(req.params.comment_id).then(() => {
    res.status(204).send({})
  }).catch(next)
}