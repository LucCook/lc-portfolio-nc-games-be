const express = require("express");
const { deleteComment, patchComment } = require("../controllers/comments.controllers");
const commmentsRouter = express.Router();

commmentsRouter.route("/:comment_id")
.patch(patchComment)
.delete(deleteComment)

module.exports = commmentsRouter;
