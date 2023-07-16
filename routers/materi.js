
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Controller = require('../controllers/materi');

router.get('/', Controller.getAllMateri);
router.get('/:id', Controller.getOneMateri);
router.post('/', Controller.createMateri);
router.put('/:id', Controller.updateMateri);
router.delete('/:id', Controller.deleteMateri);


module.exports = router;
