const db = require("../db/connection.js")

exports.selectCategories = () => {
    return db.query("SELECT slug, description FROM categories")
    .then(({rows}) => {
        return rows
    })
}