
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const userController = require('../controllers/user');

//router.get('/all' ,userController.getAllUser);// note
router.get('/all' ,userController.getAllUser);
router.get('/:id', auth.admin ,userController.getSingleUser);

router.get('/',userController.getStatusPendingUser); // get status pending userå

router.post('/create', auth.admin ,userController.createUser);
router.post('/register', userController.register);
router.post('/login', userController.login);
router.put('/:id',auth.admin , userController.updateUser);
router.put('/status/:id', userController.updateStatusUser);
router.delete('/:id',auth.admin , userController.deleteUser);



module.exports = router;
