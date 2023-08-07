
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Controller = require('../controllers/sertfikat');

const fs = require('fs')
const path = require('path')
const multer = require('multer')

const today = new Date().toISOString().slice(0,10)

const storage = multer.diskStorage({
    destination: path.join(__dirname, '..', 'upload', 'desain-sertifikat',today),
    filename: (req, file, cb) => {
        // const [name,type] = file.originalname.split('.')
      cb(null, file.originalname);
    },
  });

const upload = multer({ storage })

router.get('/',auth.user,Controller.getSertifikat);
router.get('/mode/react-select',auth.user,Controller.getSertifikatReactSelect);
router.get('/:id',auth.user,Controller.getSinglesertifikat);
router.post('/',auth.user,upload.single('desain'),Controller.createSeritifikat);
router.put('/:id',auth.user,Controller.updateSertifikat);
router.delete('/:id',auth.user,Controller.deleteSertifikat);


module.exports = router;
