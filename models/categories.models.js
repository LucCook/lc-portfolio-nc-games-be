const db = require("../db/connection.js")

exports.selectCategories = () => {
    return db.query("SELECT slug, description FROM categories")
    .then(({rows : categories}) => {
        return categories
    })
}

exports.insertCategory = (newCategory) => {
    const categoryData = [newCategory.slug, newCategory.description]
    return db.query("INSERT INTO categories (slug, description) VALUES ($1, $2) RETURNING *", categoryData).then(({rows : [insertedCategory]}) => {
        if (!insertedCategory) {
            return Promise.reject({status: 404, msg: "not found"})
        } else {
            return insertedCategory
        }
    })
}