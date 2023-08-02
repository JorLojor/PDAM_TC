
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Controller = require('../controllers/kategori');

router.get('/',Controller.getKategori);
router.get('/:id',Controller.getSingleKategori);
router.post('/',Controller.createKategori);
router.put('/:id',Controller.updateKategori);
router.delete('/:id',Controller.deleteKategori);


module.exports = router;
