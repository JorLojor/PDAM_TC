const mongoose = require('mongoose');
const {Schema} = mongoose;

const RatingSchema =  new Schema({
    user : {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User'},
    rating : {type: Number, required: true},
    comment : {type: String, required: true}
},{ timestamps: true })

module.exports = mongoose.model('Rating', RatingSchema)

