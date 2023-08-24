const Rating = require('../models/rating');

module.exports = {
    rate: async (req, res) => {
        try {
            const { user, rating, comment } = req.body
            let rate = new Rating({
                user, rating, comment
            })
            rate.save()
            response(200, {}, 'Rating berhasil dimasukan', res);
        } catch (error) {
            response(500, error, error.message, res);
        }
    }
}