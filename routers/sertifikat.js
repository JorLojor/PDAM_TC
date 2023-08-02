
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Controller = require('../controllers/sertfikat');

router.get('/',Controller.getSertifikat);
router.get('/:id',Controller.getSinglesertifikat);
router.post('/',Controller.createSeritifikat);
router.put('/:id',Controller.updateSertifikat);
router.delete('/:id',Controller.deleteSertifikat);


module.exports = router;
