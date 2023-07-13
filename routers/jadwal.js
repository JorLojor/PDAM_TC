const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Controller = require('../controllers/jadwal');

router.get('/',Controller.getJadwal);
router.post('/', Controller.createJadwal);
router.put('/:id', Controller.updateJadwal);
router.delete('/:id', Controller.deleteJadwal);


module.exports = router;
