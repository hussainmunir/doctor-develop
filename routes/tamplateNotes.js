const express = require('express');
const checkAuth = require('../middleware/check-auth');
const {
    setTamplate,
 
} = require('../controllers/tamplateNotes.controller');

const router = express.Router();

// router.get('/', checkAuth, getProblems);
router.post('/', checkAuth, setTamplate);

module.exports = router;