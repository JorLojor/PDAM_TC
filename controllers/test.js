const Test = require('../models/test')
const response = require("../respons/response");

module.exports = {
    store: async (req, res) => {
        return response(200, {body: req.body, files: req.files}, "Username atau email sudah terdaftar", res);
    }
}