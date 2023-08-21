const Test = require('../models/test')

module.exports = {
    store: async (req, res) => {
        return res.status(200).json({
            requestBody: req.body,
            requestFiles: req.files
        })
    }
}