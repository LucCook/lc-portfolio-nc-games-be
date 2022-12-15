const fs = require("fs/promises");

exports.getApiEndpoints = (req, res, next) => {
  fs.readFile(`${__dirname}/../endpoints.json`).then((endpoints) => {
    const API = JSON.parse(endpoints)
    res.status(200).send({endpoints});
  }).catch(next)
};
