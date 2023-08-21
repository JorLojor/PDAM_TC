import Test from "../models/test";

export const store = async (req, res) => {
    return res.status(200).json({
        requestBody: req.body,
        requestFiles: req.files
    })
}