const express = require('express');
const router = express.Router();
const { registerUser, loginUser, loginWithGoogle, getGoogleClientId, getProfile, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');


router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', loginWithGoogle);
router.get('/google-client-id', getGoogleClientId);


router.get('/profile', protect, getProfile);
router.put('/update-profile', protect, updateProfile);

module.exports = router;