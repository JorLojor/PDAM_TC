const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Controller = require('../controllers/jadwal');

router.get('/',auth.user ,Controller.getJadwal);
router.post('/', auth.instruktur,auth.instruktur,Controller.createJadwal);
router.put('/:id', auth.instruktur,Controller.updateJadwal);
router.delete('/:id', auth.instruktur,Controller.deleteJadwal);


module.exports = router;
