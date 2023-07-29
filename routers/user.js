
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const userController = require('../controllers/user');

router.get('/' ,userController.getAllUser);
router.get('/:id', auth.admin ,userController.getSingleUser);
router.get('/status/', auth.admin ,userController.getStatusPendingUser);
router.post('/create', auth.admin ,userController.createUser);
router.post('/register', userController.register);
router.post('/login', userController.login);
router.put('/:id',auth.admin , userController.updateUser);
router.put('/status/:id',auth.admin , userController.updateStatusUser);
router.delete('/:id',auth.admin , userController.deleteUser);



module.exports = router;
