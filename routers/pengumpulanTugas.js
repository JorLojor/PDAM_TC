const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Controller = require('../controllers/pengumpulanTugas');

router.get('/', Controller.getTugas);
router.post('/', Controller.createTugas);
router.put('/:id', Controller.updateTugas);
router.delete('/:id', Controller.deleteTugas);

module.exports = router;
