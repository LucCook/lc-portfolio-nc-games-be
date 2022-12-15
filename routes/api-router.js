const express = require('express')

const { getApiEndpoints } = require('../controllers/utility.controllers')

const apiRouter = express.Router()
const categoriesRouter = require(`${__dirname}/categories-router.js`)
const reviewsRouter = require(`${__dirname}/reviews-router.js`)
const usersRouter = require(`${__dirname}/users-router.js`)
const commmentsRouter = require('./comments-router')

apiRouter.use(express.json())

apiRouter
    .route('/')
    .get(getApiEndpoints)

apiRouter.use('/categories', categoriesRouter)
apiRouter.use('/reviews', reviewsRouter)
apiRouter.use('/users', usersRouter)
apiRouter.use('/comments', commmentsRouter)


module.exports = apiRouter