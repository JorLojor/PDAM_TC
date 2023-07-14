const mongoose = require('mongoose');
const {Schema} = mongoose;

const instruktur = new Schema({
    user : {type: Schema.Types.ObjectId, ref: 'user'},
    spesialis: {type: String, required: true},// spesialis, req false
},{ timestamps: true,_id:false });

module.exports = instruktur;

// Path: models/instruktur.js
// Compare this snippet from controllers/kelas.js:
