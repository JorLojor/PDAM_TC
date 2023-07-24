const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Controller = require('../controllers/kelas');

router.get('/',auth.user ,Controller.getAllKelas);
router.get('/',Controller.getAllKelas);//testing
router.get('/:id',auth.user ,Controller.getOneKelas);
router.post('/', auth.admin,Controller.createKelas);
router.put('/admin/:id', auth.admin,Controller.updateKelasAdminSide);
// router.put('/instruktur/:id', auth.instruktur,Controller.updateKelasInstrukturSide);
router.put('/instruktur/:id',Controller.updateKelasInstrukturSide);
router.put('/:id', auth.student,Controller.enrolKelas)
router.put('/test/:id',auth.user,Controller.enrolKelas) //testing
router.post('/test',Controller.createKelasTest); // testing
router.delete('/:id', auth.admin,Controller.deleteKelas);

router.put('/penilaian/:id',Controller.nilaiPerKelas);//test penilaian kelas

module.exports = router;
