
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const userController = require('../controllers/user');

router.get('/', auth.admin ,userController.getAllUser);
router.get('/:id', auth.admin ,userController.getSingleUser);
router.post('/register', userController.register);
router.post('/login', userController.login);
router.put('/:id',auth.admin , userController.updateUser);
router.delete('/:id',auth.admin , userController.deleteUser);


module.exports = router;
