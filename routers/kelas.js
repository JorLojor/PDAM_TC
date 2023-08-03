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
router.post('/', auth.admin,Controller.createKelas);
router.put('/admin/:id', auth.admin,Controller.updateKelasAdminSide);
router.put('/instruktur/:id', auth.instruktur,Controller.updateKelasInstrukturSide);
router.put('/:id', auth.student,Controller.enrolKelas)
router.put('/test/:id',auth.user,Controller.enrolKelas) //testing
router.post('/test',auth.admin,upload.single('featured_image'),Controller.createKelasTest); // testing

router.delete('/:id', auth.admin,Controller.deleteKelas);
router.put('/:id', auth.admin,Controller.deactivatedKelas);// deactive kelas


module.exports = router;
