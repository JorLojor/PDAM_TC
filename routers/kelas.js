const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Controller = require('../controllers/kelas');

router.get('/', Controller.getAllKelas);
router.get('/:id', Controller.getOneKelas);
router.post('/', auth.admin,Controller.createKelas);
router.put('/:id', auth.admin,Controller.updateKelas);
router.delete('/:id', auth.admin,Controller.deleteKelas);


module.exports = router;
