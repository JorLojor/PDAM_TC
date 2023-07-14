const moongose = require('mongoose');
const {Schema} = moongose;

const kelas = require('./kelas');

// pekhususan untuk kelas ofline livestraming
const jadwalSchema = new Schema({
<<<<<<< HEAD
    kelas: [{ type: Schema.Types.ObjectId, ref: 'Kelas', required: true }],
    jamMulai: { type: Date, required: false },
    jamSelesai: { type: Date, required: false },
    tanggal: { type: Date, required: false }
}, { timestamps: true });


module.exports = moongose.model('Jadwal', jadwalSchema);
=======
    kelas:{type: Schema.Types.ObjectId, ref: 'kelas', required: false},
    jamMulai:{type: Date, required: false},
    jamSelesai:{type: Date, required: false},
    taggal:{type: Date, required: false}
},{ timestamps: true,_id:false });

module.exports = jadwalSchema;

>>>>>>> 4a35976 (latest/feat : fixing models)
// yang bisa ngisi instruktur doang
