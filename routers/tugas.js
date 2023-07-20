const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Controller = require('../controllers/tugas');

router.get('/',auth.user ,Controller.getTugas);
router.post('/',auth.instruktur ,Controller.createTugas);
router.put('/:id',auth.instruktur ,Controller.updateTugas);
router.delete('/:id',auth.instruktur ,Controller.deleteTugas);

module.exports = router;
