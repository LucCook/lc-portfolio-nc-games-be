const db = require("../connection.js");
const format = require("pg-format");

exports.convertTimestampToDate = ({ created_at, ...otherProperties }) => {
  if (!created_at) return { ...otherProperties };
  return { created_at: new Date(created_at), ...otherProperties };
};

exports.createRef = (arr, key, value) => {
  return arr.reduce((ref, element) => {
    ref[element[key]] = element[value];
    return ref;
  }, {});
};

exports.formatComments = (comments, idLookup) => {
  return comments.map(({ created_by, belongs_to, ...restOfComment }) => {
    const article_id = idLookup[belongs_to];
    return {
      article_id,
      author: created_by,
      ...this.convertTimestampToDate(restOfComment),
    };
  });
};

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
