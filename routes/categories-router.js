const express = require("express");
const { getCategories, postCategory } = require("../controllers/categories.controllers");
const categoriesRouter = express.Router();

categoriesRouter.route("/").get(getCategories)
.post(postCategory);

module.exports = categoriesRouter;
