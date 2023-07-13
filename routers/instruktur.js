const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Controller = require('../controllers/instruktur');

router.get('/', Controller.getAllInstruktur);
router.get('/:id', Controller.getSingleInstruktur);
router.post('/register', Controller.createInstruktur);
router.put('/:id', Controller.updateInstruktur);
router.delete('/:id', Controller.deleteInstruktur);


module.exports = router;
