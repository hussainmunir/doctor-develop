const express = require('express');
const checkAuth = require('../middleware/check-auth')

const { 
    registerNurse,
    loginNurse,
    getNurse,
    updateNurse,
    combineWaitingList,
    getPatientLabs,
    getPatientLabsCompany,
    addRoomProblem,
    addRoomFollowUp,
    addRoomOperation
} = require('../controllers/nurse.controllers');


const router = express.Router();

router.post('/register', registerNurse);
router.post('/login', loginNurse);
router.get('/getNurse', checkAuth, getNurse);
router.put('/updateNurse', checkAuth, updateNurse);
router.get('/getCombineWaitingList/:doctorId', checkAuth, combineWaitingList);
router.get('/getPatientLabs/:doctorId', checkAuth, getPatientLabs);
router.get('/getPatientLabsCompany/:companyName', checkAuth, getPatientLabsCompany);
router.put('/addPatientRoomProblem/:pID', checkAuth, addRoomProblem);
router.put('/addPatientRoomFollowUp/:pID', checkAuth, addRoomFollowUp);
router.put('/addPatientRoomOperation/:pID', checkAuth, addRoomOperation);
module.exports = router;