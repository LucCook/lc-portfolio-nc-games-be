exports.handle500 = (err, req, res, next) => {
    console.log(err)
    res.status(500).send("apologies for my wonky code")
}

exports.handle404 = (req, res) => {
    res.status(404).send({msg : "not found"})
}

