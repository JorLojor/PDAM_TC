
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const userController = require('../controllers/user');

const fs = require('fs')
const path = require('path')
const multer = require('multer')

const today = new Date().toISOString().slice(0,10)

const storage = multer.diskStorage({
    destination: path.join(__dirname, '..', 'upload', 'profile-image',today),
    filename: (req, file, cb) => {
        // const [name,type] = file.originalname.split('.')
      cb(null, file.originalname);
    },
  });

const upload = multer({ storage })

//router.get('/all' ,userController.getAllUser);// note
router.get('/all' ,userController.getAllUser);
router.post('/my' ,userController.getSingleUser);

router.get('/',auth.admin,userController.getStatusPendingUser); // get status pending userå
router.get('/role/:role',auth.admin,userController.getByRole); // get status pending userå
router.get('/role-react-select/:role',auth.admin,userController.getByRoleReactSelect); // get status pending userå
router.post('/filtered',auth.admin,userController.getWithFilter); // get with filter
router.get('/classes/:id',auth.student,userController.getUserClass); // get only user's class

router.post('/create', auth.admin ,userController.createUser);
router.post(`/creation/${process.env.key_for_grant_access}`,userController.createUser);
router.post('/register', userController.register);
router.post('/login', userController.login);
router.put('/:id',auth.user,upload.single('userImage'), userController.updateUser);
router.put('/status/:id', auth.admin,userController.updateStatusUser);
router.put('/password/:id', auth.user,userController.updatePassword);
router.delete('/:id',auth.admin , userController.deleteUser);
router.put('/forgot/pass' , userController.forgotPassword);
router.get('/reset-password/:code' , userController.checkUserResetPassword);
router.put('/reset/:id/:code', userController.resetPassword);



module.exports = router;
