const express = require('express');
const checkAuth = require('../middleware/check-auth')

const { 
    registerNurse,
    loginNurse,
    combineWaitingList,
    getPatientLabs,
    getPatientLabsCompany
} = require('../controllers/nurse.controllers');


const router = express.Router();

router.post('/register', registerNurse);
router.post('/login', loginNurse);
router.get('/getCombineWaitingList/:doctorId', checkAuth, combineWaitingList);
router.get('/getPatientLabs/:doctorId', checkAuth, getPatientLabs);
router.get('/getPatientLabsCompany/:companyName', checkAuth, getPatientLabsCompany);
module.exports = router;