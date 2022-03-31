const bcrypt = require('bcryptjs');
const jsonwebtoken = require('jsonwebtoken');
const Nurse = require('../models/Nurse')
const Doctor = require('../models/Doctor')
const Patient = require('../models/Patient')
const Problem = require('../models/Problem')
const Operation = require('../models/Operation')
const FollowUpModal = require('../models/FollowUp.js');
const ErrorResponse = require('../utils/errorResponse')


exports.registerNurse = async (req, res, next) => {
    try {
      const check = await Nurse.findOne({ 'email': req.body.email })
      if (check) {
        next(new ErrorResponse("Email has already signed up", 401))
      } else {
        // there must be a password in body
        // we follow these 2 steps
        var salt = bcrypt.genSaltSync(10);
        var hash = bcrypt.hashSync(req.body.password, salt);
  
        req.body.password = hash;
        const doctor = new Nurse(req.body);
  
        await doctor.save();
  
        res.send({
          success: true,
          message: 'Nurse Signup successful'
        });
      }
    } catch (err) {
      next(new ErrorResponse(err.message, 500))
    }
  };


  exports.loginNurse = async (req, res, next) => {
    try {
      const email = req.body.email;
  
      // lets check if email exists
      const result = await Nurse.findOne({ "email": email });
      if (!result) {
        // this means result is null
        next(new ErrorResponse('Credentials incorrect, Please try again.', 401))
      } else {
  
        if (bcrypt.compareSync(req.body.password, result.password)) {
          // great, allow this user access
          result.password = undefined;
           const doctorId = result.doctorId;
          const token = jsonwebtoken.sign({
            data: [result.email, result._id],
            role: 'Nurse'
          }, process.env.JWT_SECRET, { expiresIn: '7d' });
  
          res.status(200).json({ success: true, token: token, doctorId: doctorId });
        }
        else {
          next(new ErrorResponse("Credentials incorrect, Please try again.", 401))
        }
      }
    } catch (err) {
      next(new ErrorResponse(err.message, 500))
    }
  };


  exports.combineWaitingList = async (req, res, next) => {
    try {
      const problem = await Problem.find({ 'isChecked': false, "doctorId": req.params.doctorId }).lean();
      const operation = await Operation.find({ 'isChecked': false, "doctorId": req.params.doctorId }).lean();
      const followUpModal = await FollowUpModal.find({ 'isChecked': false, "doctorId": req.params.doctorId }).lean();
    
     for(i=0; i<problem.length; i++){
      const patient = await Patient.findOne({ _id: problem[i].patientID}).lean();
     
      problem.forEach((wait) => {wait.currentPatientMedication=patient.currentMedications})
      
  
     }
     
     for(i=0; i<operation.length; i++){
      const patient = await Patient.findOne({ _id: operation[i].patientId}).lean();
     
      operation.forEach((wait) => {wait.currentPatientMedication=patient.currentMedications})
      
     }
     for(i=0; i<followUpModal.length; i++){
      const patient = await Patient.findOne({ _id: followUpModal[i].patientId}).lean();
     
      followUpModal.forEach((wait) => {wait.currentPatientMedication=patient.currentMedications})
      
     }
     
  
      if (!problem && !operation && !followUpModal) {
        res.status(200).json({
          data: "No thing in waiting list",
  
        })
      }
      var followUpArray = [];
     for(i=0; i<followUpModal.length; i++){
       let obj = {}
       obj.waitingListType="followUp";
       obj.problem={};
       obj.followUp=followUpModal[i];
       obj.postOp={};
       followUpArray.push(obj)
     }
     var problemArray = [];
     for(i=0; i<problem.length; i++){
       let obj = {}
       obj.waitingListType="problem";
       obj.followUp={};
       obj.problem=problem[i];
       obj.postOp={};
       problemArray.push(obj)
     }
     var operationArray = [];
     for(i=0; i<operation.length; i++){
       let obj = {}
       obj.waitingListType="operation";
       obj.problem={};
       obj.followUp={};
       obj.postOp=operation[i];
       operationArray.push(obj)
     }
     const waitingList = followUpArray.concat(problemArray,operationArray)
      res.status(200).json({
        success: true,
        data: waitingList
      })
    } catch (err) {
      next(new ErrorResponse(err.message, 500))
    }
  }

  
exports.getPatientLabs = async (req, res) => {
  try {
    const p = await Patient.find()
    const patientWithLabs = await Patient.find({ 'labs.doctorId': req.params.doctorId })
    if (patientWithLabs.length <= 0) {
      return res.status(200).json({
        success: true,
        data: "No Labs Found"
      })
    }
    
    
     for(i=0; i<patientWithLabs.length; i++){
      var filteredLabs = [];
      for(j=0; j<patientWithLabs[i].labs.length; j++){
        
       
        if(patientWithLabs[i].labs[j].progress != "completed" && patientWithLabs[i].labs[j].name == "X-Ray" && patientWithLabs[i].labs[j].doctorId == req.params.doctorId){
      let test = patientWithLabs[i].labs[j]
    
      filteredLabs.push(test);
  
          }
      }
    
     }
     console.log("filteredLabs",filteredLabs)
     return res.status(200).json({
      success: true,
      data: filteredLabs
    })
  }
  catch (e) {
    return res.status(400).json({
      success: false,
      error: e
    })
  }
}



  
exports.getPatientLabsCompany = async (req, res) => {
  try {
    const p = await Patient.find()
    const patientWithLabs = await Patient.find({ 'labs.companyName': req.params.companyName })
    if (patientWithLabs.length <= 0) {
      return res.status(200).json({
        success: true,
        data: "No Labs Found"
      })
    }
    
    
     for(i=0; i<patientWithLabs.length; i++){
      var filteredLabs = [];
      for(j=0; j<patientWithLabs[i].labs.length; j++){
        
       
        if(patientWithLabs[i].labs[j].progress != "completed" && patientWithLabs[i].labs[j].name == "X-Ray" && patientWithLabs[i].labs[j].companyName == req.params.companyName){
      let test = patientWithLabs[i].labs[j]
    
      filteredLabs.push(test);
  
          }
      }
    
     }
     console.log("filteredLabs",filteredLabs)
     return res.status(200).json({
      success: true,
      data: filteredLabs
    })
  }
  catch (e) {
    return res.status(400).json({
      success: false,
      error: e
    })
  }
}

