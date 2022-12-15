const fs = require("fs/promises");

exports.getApiEndpoints = (req, res, next) => {
  fs.readFile(`${__dirname}/../endpoints.json`).then((endpoints) => {
    res.status(200).send({endpoints});
  }).catch(next)
};
