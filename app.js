const express = require("express")
const { getCategories } = require("./controllers/categories.controllers")
const { getReviews, getReviewById } = require("./controllers/reviews.controllers")
const { handle500, handle404, handleCustom, handle400 } = require("./errors/handlers")

const app = express()

app.get("/api/categories", getCategories)
app.get("/api/reviews", getReviews)
app.get("/api/reviews/:review_id", getReviewById)

app.all("*", handle404)

app.use(handleCustom)
app.use(handle400)
app.use(handle500)

module.exports = app