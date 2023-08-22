const mongoose = require('mongoose');
const { Schema } = mongoose;
const itemsMateriSchema = require('./itemsMateri');

const materiSchema = new Schema({
  kodeMateri: { type: String, required: true },
  test: {
    pre: { type: mongoose.Schema.Types.ObjectId, ref: 'Test' }, 
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Test' }, 
  },
  slug: { type: String, required: true },
  section: { type: String, required: true }, // Judul
  description: { type: String, required: true },
  items: [itemsMateriSchema],
  instruktur: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Materi', materiSchema);
