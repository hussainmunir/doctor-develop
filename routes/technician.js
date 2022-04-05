const express = require('express');
const checkAuth = require('../middleware/check-auth')

const { 
    registerTechnician,
    loginTechnician,
    getTechnician,
    getPatientLabs,
    getPatientLabsCompany,
    updatePatientLabProgress
} = require('../controllers/technician.controllers');


const router = express.Router();

router.post('/register', registerTechnician);
router.post('/login', loginTechnician);
router.get('/getTechnician', checkAuth, getTechnician);
router.get('/getPatientLabs/:doctorId', checkAuth, getPatientLabs);
router.get('/getPatientLabsCompany/:companyName', checkAuth, getPatientLabsCompany);
router.put('/updatePatientLabProgress/:labId', checkAuth, updatePatientLabProgress);

module.exports = router;