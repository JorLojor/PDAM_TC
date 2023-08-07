
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Controller = require('../controllers/kategori');

const fs = require('fs')
const path = require('path')
const multer = require('multer')

const today = new Date().toISOString().slice(0,10)

const storage = multer.diskStorage({
    destination: path.join(__dirname, '..', 'upload', 'kategori-icons',today),
    filename: (req, file, cb) => {
        // const [name,type] = file.originalname.split('.')
      cb(null, file.originalname);
    },
  });

const upload = multer({ storage })

router.get('/',auth.user,Controller.getKategori);
router.get('/:id',Controller.getSingleKategori);
router.post('/',auth.admin,upload.array('kategoris'),Controller.createKategori);
router.put('/:id',auth.admin,upload.array('kategoris'),Controller.updateKategori);
router.delete('/:id',auth.admin,Controller.deleteKategori);


module.exports = router;
