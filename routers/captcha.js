const express = require("express");
const router = express.Router();
const axios = require("axios")

router.post('/verify', async (req, res) => {
    const { captchaValue } = request.body;
    const { data } = await axios.post(
        `https://www.google.com/recaptcha/api/siteverify?secret=${SITE_SECRET}&response=${captchaValue}`
    );
    response.send(data);
})

module.exports = router;