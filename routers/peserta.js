
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Controller = require('../controllers/peserta');

router.get('/', Controller.getAllPeserta);
router.get('/:id', Controller.getOnePeserta);
router.post('/register', Controller.createPeserta);
router.put('/:id', Controller.updatePeserta);
router.delete('/:id', Controller.deletePeserta);


module.exports = router;
