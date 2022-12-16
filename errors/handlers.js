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
  
    if (error.status === 400
    || error.code === '2201W'
    || error.code === "2201X" 
    || error.code === "22P02"
    || error.code === "23502"
    || error.code === "42703"
    || error.code === "23505") {
      
        res.status(400).send({msg: "bad request"})
    } else if (error.code === "23503") {
      res.status(404).send({msg : "not found"})
    } else next(error)
}
