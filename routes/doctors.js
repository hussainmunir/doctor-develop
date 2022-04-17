const express = require('express');
const checkAuth = require('../middleware/check-auth')
const { getDoctorById,
    getDoctor,
    updateDoctor,
    deleteDoctor,
    registerDoctor,
    loginDoctor,
    searchCode,
    diagnosis,
    generateReport,
    getAllDoctors,
    getWaitingList,
    getAllCompanies,
    getPreviousAppointments,
    companiesAllDoctors,
    putOperation,
    putDoctorFollowUp,
    generateFollowUp,
    generateOpNote,
    getCptCode,
    postCptCode,
    combineWaitingList,
    followUpSignature,
    operationSignature,
    combinePreviousVisite,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplates,
    getTemplate,
    getPostOp,
    getFollowUp,
    addRoom,
    uploadImage
} = require('../controllers/doctors.controllers');


const router = express.Router();

router.get('/getDr', checkAuth, getDoctor);
router.post('/register', registerDoctor);
router.put('/operation/:operationId', putOperation);
router.post('/login', loginDoctor);
router.get('/doctors',getAllDoctors)
router.get('/companyNames',getAllCompanies)
router.get('/companiesAllDoctors/:companyName',companiesAllDoctors)
router.put('/updateDiagnosis/:pID', checkAuth, diagnosis);
router.put('/addPatientRoom/:pID', checkAuth, addRoom);
router.put('/createTemplate/:doctorId', checkAuth, createTemplate);
router.put('/updateTemplate/:templateId', checkAuth, updateTemplate);
router.delete('/deleteTemplate/:templateId', checkAuth, deleteTemplate);
router.get('/allTemplate/:doctorId', checkAuth, getTemplates)
router.get('/template/:treatmentPlan', checkAuth, getTemplate)
router.get('/followUp/:FollowId', checkAuth, generateFollowUp);
router.get('/operationNote/:opId', checkAuth, generateOpNote);
router.get('/', checkAuth, getAllDoctors)
router.get('/getDr/:id', checkAuth, getDoctorById);
router.get('/report/:pID', generateReport);
router.get('/search', checkAuth, searchCode);
router.put('/updateDr', checkAuth, updateDoctor);
router.put('/updateFollowUp/:followUpID',putDoctorFollowUp)
router.delete('/deleteDr', checkAuth, deleteDoctor);
router.get('/getWaiting', checkAuth, getWaitingList);
router.get('/getCombineWaitingList', checkAuth, combineWaitingList);
router.get('/prev', checkAuth, getPreviousAppointments);
router.get('/combinePreviousVisit', checkAuth, combinePreviousVisite);
router.get('/getcptCode',checkAuth,getCptCode);
router.get('/getFollowUpById/:followUpId', checkAuth, getFollowUp);
router.get('/getPostOpById/:postOpId', checkAuth, getPostOp);
router.get('/getcptCode',checkAuth,getCptCode);
router.post('/postcptCode',postCptCode);
router.post('/followUpSignature',followUpSignature );
router.post('/operationSignature',operationSignature );
router.post('/uploadImage', uploadImage );

module.exports = router;
