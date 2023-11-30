const express = require("express");
const router = express.Router();
const axios = require("axios")

router.post('/verify', async (req, res) => {
    const { captchaValue } = request.body;
    const { data } = await axios.post(
        `https://www.google.com/recaptcha/api/siteverify?secret=6LekAx8pAAAAAD56RNNRRGN7WMj_JMRBWqrD5Kgy&response=${captchaValue}`,{},{
            headers: {
              "Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
            },
          },
    );
    res.send(data); 
})

module.exports = router;
