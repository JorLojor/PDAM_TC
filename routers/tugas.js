const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Controller = require('../controllers/tugas');

router.get('/',Controller.getTugas);
// router.get('/',auth.user ,Controller.getTugas);
router.post('/',auth.instruktur ,Controller.creteTugasSecond);
router.post('/test',Controller.createTugasThird);
router.put('/:id',auth.instruktur ,Controller.updateTugas);
router.delete('/:id',auth.instruktur ,Controller.deleteTugas);

router.put('/pengumpulan/:id',auth.user,Controller.pengumpulanTugas);//test pengumpulan tugas
router.put('/penilaiantugas/:id',auth.instruktur,Controller.penilaianPrimary);//test penilaian tugas
module.exports = router;
