const express = require('express');
const checkAuth = require('../middleware/check-auth');
const {
    getProblems,
    setProblems,
    getAllProblems,
    getDocProblems,
    updatePatientSignature,
    getProblem
} = require('../controllers/problem.controller');

const router = express.Router();

router.get('/', checkAuth, getProblems);
router.post('/', checkAuth, setProblems);
router.get('/all', getAllProblems);
router.get('/getProblemById/:problemId', getProblem)
router.get('/docpatients', checkAuth, getDocProblems)
router.post('/updateSignature',updatePatientSignature )

module.exports = router;