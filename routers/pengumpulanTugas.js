const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Controller = require('../controllers/pengumpulanTugas');

router.get('/', Controller.getPengumpulanTugas);
router.post('/:id/:user', Controller.uploadPengumpulanTugas);//id = idTugas
router.put('/:id', Controller.updatePengumpulanTugas);//id = id PengumpulanTugas
router.delete('/:id', Controller.deleteTugas);

module.exports = router;
