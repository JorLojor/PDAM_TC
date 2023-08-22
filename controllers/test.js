const Test = require('../models/test')
const response = require("../respons/response");

module.exports = {
    store: async (req, res) => {
        let { data } = req.body;
        data = data.replaceAll("'", '"')
        const dataPertanyaan = JSON.parse(data)
        const post = {}
        return response(200, dataPertanyaan, "Username atau email sudah terdaftar", res);
    }
}