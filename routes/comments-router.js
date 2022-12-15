const express = require('express')
const { getCommentsByReviewId, postCommentByReviewId, deleteComment } = require('../controllers/comments.controllers')
const commmentsRouter =  express.Router()

commmentsRouter
    .route('/')
    .get(getCommentsByReviewId)
    .post(postCommentByReviewId)

commmentsRouter
    .route('/:comment_id')
    .delete(deleteComment)

module.exports = commmentsRouter