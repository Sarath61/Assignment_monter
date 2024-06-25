const express = require('express')
const { route } = require('../app')
const authController = require('../Controllers/authController')
const router = express.Router()

router.post('/signup',authController.signup)
router.post('/login',)

router.get('/mydata',)

