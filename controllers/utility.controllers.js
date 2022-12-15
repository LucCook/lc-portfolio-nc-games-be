const fs = require("fs/promises");

exports.getApiEndpoints = (req, res, next) => {
  fs.readFile(`${__dirname}/../endpoints.json`, 'utf8').then((endpoints) => {
    const API = {'API' : JSON.parse(endpoints)} 
    res.status(200).send(API);
  }).catch(next)
};
