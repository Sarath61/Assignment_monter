const express = require("express");
const authController = require("../Controllers/authController");
const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login',)

// router.get('/mydata',)


module.exports = router