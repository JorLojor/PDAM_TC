
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const userController = require('../controllers/user');

// router.get('/',auth.adminAdnInstruktur, userController.getAllUser);
// router.get('/:id',auth.adminAdnInstruktur, userController.getSingleUser);
// router.post('/register', userController.register);
// router.post('/login', userController.login);
// router.put('/:id',auth.userAndAdmin, userController.updateUser);
// router.delete('/:id',auth.admin, userController.deleteUser);

router.get('/', userController.getAllUser);
router.get('/:id', userController.getSingleUser);
router.post('/register', userController.register);
router.post('/login', userController.login);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);


module.exports = router;
