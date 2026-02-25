const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, addAddress, deleteAddress, getAllUsers, toggleBlockUser } = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/address', addAddress);
router.delete('/address/:id', deleteAddress);

router.get('/', adminOnly, getAllUsers);
router.put('/:id/block', adminOnly, toggleBlockUser);

module.exports = router;
