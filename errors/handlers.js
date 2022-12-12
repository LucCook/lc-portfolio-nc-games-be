exports.handle500 = (err, req, res, next) => {
  console.log(err);
  res.status(500).send({ msg: "apologies for my wonky code" });
};

exports.handle404 = (req, res) => {
  res.status(404).send({ msg: "not found" });
};

exports.handleCustom = (error, req, res, next) => {
  if (error.status && error.msg) {
    res.status(error.status).send({ msg: error.msg });
  } else next(error);
};

exports.handle400 = (error, req, res, next) => {
    if (error.code === "22P02") {
        res.status(400).send({msg: "bad request"})
    }
}
