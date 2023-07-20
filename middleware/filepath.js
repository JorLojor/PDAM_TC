const multer = require('multer');
const express = require('express');
const app = express();

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null,'assets');
    },
    filename: (req, file, cb) => {
        const digitpertama = Date.now();
        const digitKedua = file.originalname;
        cb(null,digitpertama+digitKedua)
    }
});

const fileFilter = (req, file, next) => {
    if(
        file.mimetype === 'application/pdf' ||
        file.mimetype === 'application/txt' ||
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.mimetype === 'application/msword'
    ) {
        next(null, true);
    } else {
        next(new Error('File harus bertipe pdf '), false);
    }
  };
  const uploadFile = multer({
    storage: fileStorage,
    fileFilter: fileFilter,
  }).single('fileTugas');
  
  module.exports = uploadFile;
