const express = require('express');
const checkAuth = require('../middleware/check-auth');
const {
    getProblems,
    setProblems,
    getAllProblems,
    getDocProblems,
    updatePatientSignature
} = require('../controllers/problem.controller');

const router = express.Router();

router.get('/', checkAuth, getProblems);
router.post('/', checkAuth, setProblems);
router.get('/all', getAllProblems)
router.get('/docpatients', checkAuth, getDocProblems)
router.post('/updateSignature',updatePatientSignature )

module.exports = router;