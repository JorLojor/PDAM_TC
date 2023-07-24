
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Controller = require('../controllers/materi');

router.get('/',auth.user ,Controller.getAllMateri);
router.get('/:id',auth.user ,Controller.getOneMateri);
router.post('/', auth.instruktur,Controller.createMateri);
router.put('/:id', auth.instruktur,Controller.updateMateri);
router.delete('/:id', auth.instruktur,Controller.deleteMateri);


module.exports = router;
    