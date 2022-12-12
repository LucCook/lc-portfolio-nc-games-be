const express = require("express")
const { getCategories } = require("./controllers/categories.controllers")
const { getReviews } = require("./controllers/reviews.controllers")
const { handle500, handle404 } = require("./errors/handlers")

const app = express()

app.get("/api/categories", getCategories)
app.get("/api/reviews", getReviews)

app.all("*", handle404)

app.use(handle500)

module.exports = app