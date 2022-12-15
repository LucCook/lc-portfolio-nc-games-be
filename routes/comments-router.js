const express = require("express");
const { deleteComment } = require("../controllers/comments.controllers");
const commmentsRouter = express.Router();

commmentsRouter.route("/:comment_id").delete(deleteComment);

module.exports = commmentsRouter;
