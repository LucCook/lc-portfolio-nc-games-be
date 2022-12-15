const express = require('express')
const { getReviews, getReviewById, patchReview } = require('../controllers/reviews.controllers')
const commmentsRouter = require('./comments-router')
const reviewsRouter = express.Router()


reviewsRouter
    .route('/')
    .get(getReviews)

reviewsRouter
    .route('/:review_id')
    .get(getReviewById)
    .patch(patchReview)

reviewsRouter.use('/:review_id/comments', commmentsRouter)

module.exports = reviewsRouter