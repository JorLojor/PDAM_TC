const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Controller = require('../controllers/kelas');

router.get('/', Controller.getAllKelas);
router.get('/:id', Controller.getOneKelas);
router.post('/createKelas', Controller.createKelas);
router.put('/:id', Controller.updateKelas);
router.delete('/:id', Controller.deleteKelas);


module.exports = router;
