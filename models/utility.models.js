const db = require("../db/connection.js");
const format = require("pg-format");

exports.checkValueExists = (table, column, value) => {
  let sqlString
  if (typeof value === 'number') {

    sqlString = format(
      "SELECT * FROM %I WHERE %I = %L",
      table,
      column,
      value
    )
  } else if (typeof value === 'string') {
    sqlString = format(
      "SELECT * FROM %I WHERE %I ILIKE %L",
      table,
      column,
      value
    )
  }
    return db.query(sqlString).then(({ rows: values }) => {
      if (!values.length) {
        return Promise.reject({ status: 404, msg: "not found" });
      }
    });
  };