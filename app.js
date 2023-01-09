const express = require("express");
const cors = require("cors")

const {
  handle500,
  handle404,
  handleCustom,
  handle400,
} = require("./errors/handlers");
const apiRouter = require("./routes/api-router");

const app = express();

app.use(cors())

app.use(express.json());

app.use("/api", apiRouter);

app.all("*", handle404);

app.use(handleCustom);
app.use(handle400);
app.use(handle500);

module.exports = app;
