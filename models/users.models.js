const db = require("../db/connection.js");

exports.selectUsers = () => {
  return db
    .query("SELECT username, name, avatar_url FROM users")
    .then(({ rows: users }) => {
      return users;
    });
};

exports.selectUserByUsername = (username) => {
  return db
    .query("SELECT username, name, avatar_url FROM users WHERE username = $1", [username])
    .then(({ rows : [user]}) => {
      if (!user) {
        return Promise.reject({status: 404, msg: 'not found'})
      } else
      return user
    })
}