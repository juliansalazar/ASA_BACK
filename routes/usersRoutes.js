const express = require('express')
const router = express.Router()
const { login, register, data, resetPassword, updatePassword } = require('../controllers/usersController.js')
const { protect } = require('../middlewares/authMiddleware')

router.post('/login', login)
router.post('/register', register)
router.post('/reset-password', resetPassword);
router.post('/update-password', updatePassword);
router.get('/data', protect, data)

module.exports = router