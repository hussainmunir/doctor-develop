const bcrypt = require('bcryptjs');
const jsonwebtoken = require('jsonwebtoken');
const Nurse = require('../models/Nurse')
const Technician = require('../models/Technician') 
const Doctor = require('../models/Doctor')
const Patient = require('../models/Patient')
const Problem = require('../models/Problem')
const Operation = require('../models/Operation')
const FollowUpModal = require('../models/FollowUp.js');
const ErrorResponse = require('../utils/errorResponse')


exports.registerTechnician = async (req, res, next) => {
    try {
      const check = await Technician.findOne({ 'email': req.body.email })
      if (check) {
        next(new ErrorResponse("Email has already signed up", 401))
      } else {
        // there must be a password in body
        // we follow these 2 steps
        var salt = bcrypt.genSaltSync(10);
        var hash = bcrypt.hashSync(req.body.password, salt);
  
        req.body.password = hash;
        const technician = new Technician(req.body);
  
        await technician.save();
  
        res.send({
          success: true,
          message: 'Technician Signup successful'
        });
      }
    } catch (err) {
      next(new ErrorResponse(err.message, 500))
    }
  };


  exports.loginTechnician = async (req, res, next) => {
    try {
      const email = req.body.email;
  
      // lets check if email exists
      const result = await Technician.findOne({ "email": email });
      if (!result) {
        // this means result is null
        next(new ErrorResponse('Credentials incorrect, Please try again.', 401))
      } else {
  
        if (bcrypt.compareSync(req.body.password, result.password)) {
          // great, allow this user access
          result.password = undefined;
           const companyName = result.companyName;
          const token = jsonwebtoken.sign({
            data: [result.email, result._id],
            role: 'Technician'
          }, process.env.JWT_SECRET, { expiresIn: '7d' });
  
          res.status(200).json({ success: true, token: token, companyName: companyName });
        }
        else {
          next(new ErrorResponse("Credentials incorrect, Please try again.", 401))
        }
      }
    } catch (err) {
      next(new ErrorResponse(err.message, 500))
    }
  };


  exports.getTechnician = async (req, res, next) => {
    try {
     console.log(req.user.data[1])
      const technician = await Technician.findById(req.user.data[1]);
  
      // we are returning because if record isnt present by id it will show two errors. by returning, it will only return the first one.
      //the catch statement will be executed if the format of the id is incorrect
      //if statement is executed when the format is correct but id is not present into the database
      if (!technician) {
        return next(new ErrorResponse(`Technician not found with id of ${req.user.data[1]}`, 404));
      }
  
      res.status(200).json({
        success: true, data: technician
      })
  
    } catch (err) {
      next(new ErrorResponse(err.message, 500));
  
    }
  }


  exports.updateTechnician = async (req, res, next) => {

    const resTechnician = await Technician.findById(req.user.data[1]);
    console.log(resTechnician.password)

    if (req.body.password != undefined) {
    if (req.body.password == resTechnician.password) {
      // great, allow this user access
      console.log('password matched!');
    }
  
    else {
      console.log('password doesnot match');
  
      let salt = bcrypt.genSaltSync(10);
      let hash = bcrypt.hashSync(req.body.password, salt);
  
      req.body.password = hash;
    }
  }

    // if (req.body.password) {
    //   let salt = bcrypt.genSaltSync(10);
    //   let hash = bcrypt.hashSync(req.body.password, salt);
  
    //   req.body.password = hash;
    // }
  
    try {
      const technician = await Technician.findByIdAndUpdate(req.user.data[1], req.body, {
        new: true,
        runValidators: true, // this is mongoose validators
      });
  
      if (!technician) {
        res.status(400).json({
          success: false,
          message: "Technician not found!"
        })
      }
  
  
      res.status(200).json({
        success: true,
        message: "Technician updated successfully!"
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



exports.updatePatientLabProgress = async (req, res, next) => {
 
  
  try {
    let {progress, patientID} = req.body;
    const patient = await Patient.find( { '_id': patientID }).lean()

    const tempLab = patient[0].labs
console.log("before",tempLab)
    for(i=0; i<tempLab.length; i++){
      if(tempLab[i]._id == req.params.labId){
        tempLab[i].progress=progress; 
        console.log("id", tempLab[i]._id)
      }
    }

    console.log("after",tempLab)

    const lab = await Patient.findByIdAndUpdate(
      
      { '_id': patientID },
      {$set: {'labs':tempLab}},
      {
        new: true,
        runValidators: true,
      });
      console.log("req.body",req.body)
    if (!lab) {
      return next(new ErrorResponse('lab does not exist', 400))
    }
    console.log("lab",lab) 
    res.status(200).json({
      success: true,
      data: lab
    })

  } catch (err) {
    return next(new ErrorResponse(err.message, 500))
  }
}



exports.updatePatientLabs = async (req, res, next) => {
  console.log("in update labs")
  console.log(req.body)
  console.log(req.files)
  try {
    const p = await Patient.findOne({ _id: req.body.patientId })
    const tempLab = p[0].labs
    if (!p) {
      return res.status(404).json({
        "message": "Patient not found"
      })
    }
    else {

      var toBeAdded = {
        patientId: req.body.patientId,
        doctorId: req.body.doctorId,
        name: req.body.name,
        date: req.body.date,
        description: req.body.description,
        patientName: req.body.patientName,
        progress: req.body.progress,
        companyName: req.body.companyName,
        byDesignation: req.body.byDesignation,
        photos: [],
        pdf: []
      }
      if (req.files) {
        if (req.files.photos) {
          if (Array.isArray(req.files.photos)) {
            for (i = 0; i < req.files.photos.length; i++) {
              console.log("checking for photos")
              const urlId = await uploadImage(req.files.photos[i], next)
              console.log(urlId)
              var setPhotos = {
                "url": urlId.url,
                "public_id": urlId.public_id
              }
              toBeAdded.photos[i] = setPhotos
            }
          }
          else {
            const urlId = await uploadImage(req.files.photos, next)
            var setPhotos = {
              "url": urlId.url,
              "public_id": urlId.public_id
            }
            toBeAdded.photos = setPhotos
          }
        }
        if (req.files.pdf) {
          if (Array.isArray(req.files.pdf)) {
            for (i = 0; i < req.files.pdf.length; i++) {
              console.log("checking for pdfs")
              const urlId = await uploadPdf(req.files.pdf[i], next)
              console.log(urlId)
              var setPdf = {
                "url": urlId.url,
                "public_id": urlId.public_id
              }
              toBeAdded.pdf[i] = setPdf
            }
          }
          else {
            const urlId = await uploadPdf(req.files.pdf, next)
            var setPdf = {
              "url": urlId.url,
              "public_id": urlId.public_id
            }
            toBeAdded.pdf = setPdf
          }
        }
     
      }
      for(i=0; i<tempLab.length; i++){
        if(tempLab[i]._id == req.params.labId){
          tempLab[i]=toBeAdded; 
          console.log("id", tempLab[i]._id)
        }
      }
  
      const updatedPatient = await Patient.findOneAndUpdate({ _id: req.body.patientId }, { $set: { labs: tempLab } }, { new: true, })
      if (!updatedPatient) {
        return res.status(400).json({
          success: false,
          data: null
        })
      }
      else {
        return res.status(200).json({
          success: true,
          data: updatedPatient
        })
      }
    }

  }

  catch (err) {
    next(new ErrorResponse(err.message, 500))
  }
}
