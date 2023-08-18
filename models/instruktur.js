const mongoose = require('mongoose');
const {Schema} = mongoose;

const instruktur = new Schema({
    user : {type: mongoose.Schema.Types.ObjectId, ref: 'user'},
    spesialis: {type: String, required: false},
},{ timestamps: true,_id:false });

module.exports = instruktur;

// Path: models/instruktur.js
// Compare this snippet from controllers/kelas.js:
