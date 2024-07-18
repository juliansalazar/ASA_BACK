const express = require('express')
const router = express.Router()
const { login, register, data } = require('../controllers/usersController.js')
// const { protect } = require('../middlewares/authMiddleware')

router.post('/login', login)
router.post('/register', register)

// router.get('/data', protect, data)

module.exports = router