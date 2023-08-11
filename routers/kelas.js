const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Controller = require('../controllers/kelas');

const fs = require('fs')
const path = require('path')
const multer = require('multer')

const today = new Date().toISOString().slice(0,10)

const storage = multer.diskStorage({
    destination: path.join(__dirname, '..', 'upload', 'kelas-featured-image',today),
    filename: (req, file, cb) => {
        // const [name,type] = file.originalname.split('.')
      cb(null, file.originalname);
    },
  });

const upload = multer({ storage })

router.get('/',auth.user ,Controller.getAllKelas);
router.get('/',Controller.getAllKelas);//testing
router.get('/:id',auth.user ,Controller.getOneKelas);
router.get('/slug/:slug',auth.user ,Controller.getOneKelasBySlug);
router.post('/nd/',auth.server ,Controller.getOneKelasByND);
router.get('/materi/:slug',auth.user ,Controller.getMateriKelas);
router.post('/peserta/:slug',auth.user,Controller.getPesertaKelas);
router.post('/filtered',auth.user ,Controller.getWithFilter);
router.post('/', auth.admin,Controller.createKelas);
router.put('/admin/:id', auth.admin,Controller.updateKelasAdminSide);
router.put('/adminSlug/:slug', auth.admin,Controller.updateKelasAdminSlug);
router.put('/status/nd',auth.server,Controller.updateKelasWithND);
router.put('/approval/:slug/:iduser',auth.admin,Controller.approvePeserta)
router.get('/instruktur/:instruktur',auth.instruktur,Controller.getKelasByInstruktur)
router.put('/instruktur/:id', auth.instruktur,Controller.updateKelasInstrukturSide);
router.put('/enroll/:slug', auth.student,Controller.enrolKelas)
router.put('/assign/:slug', auth.user,Controller.assignPesertaKelas)
router.put('/test/:id',auth.user,Controller.enrolKelas) //testing
router.put('/kick',auth.admin,Controller.kickPeserta) //testing
router.post('/test',auth.admin,upload.single('featured_image'),Controller.createKelasTest); // testing

router.delete('/:id', auth.admin,Controller.deleteKelas);
router.put('/deactivate/:id', auth.admin,Controller.deactivatedKelas);// deactive kelas
router.put('/activate/:id', auth.admin,Controller.activateKelas);// deactive kelas


module.exports = router;
