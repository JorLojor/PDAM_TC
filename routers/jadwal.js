const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Controller = require('../controllers/jadwal');

router.get('/', Controller.getJadwal);
router.post('/', auth.admin,auth.instruktur,Controller.createJadwal);
router.put('/:id', auth.admin,auth.instruktur,Controller.updateJadwal);
router.delete('/:id', auth.admin,Controller.deleteJadwal);


module.exports = router;
