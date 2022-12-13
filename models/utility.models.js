const db = require("../db/connection.js");
const format = require("pg-format");

exports.checkColExists = (table, column, value) => {
    const sqlString = format(
      "SELECT * FROM %I WHERE %I = %L",
      table,
      column,
      value
    );
    return db.query(sqlString).then(({ rows: values }) => {
      if (!values.length) {
        return Promise.reject({ status: 404, msg: "not found" });
      }
    });
  };