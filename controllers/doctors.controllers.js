const Doctor = require('../models/Doctor')
const Operation = require('../models/Operation')
const FollowUpModal = require('../models/FollowUp.js');
const ICD = require('../models/ICDcodes')
const Problem = require('../models/Problem')
const Patient = require('../models/Patient')

const SpecialTests = require('../models/SpecialTests')

const CptCodes = require('../models/CptCodes.js');
const ErrorResponse = require('../utils/errorResponse')
const { destroyImage, uploadImage, uploadPdf,uploadToCloudinary } = require('../helpers/helpers')
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jsonwebtoken = require('jsonwebtoken');
const pdf = require('pdf-creator-node')
const moment = require('moment')
var count = 0;



const appendAndToArray = (arr) => {
// function appendAndToArray(arr){
  var tempArr = []
  tempArr = arr
  if(tempArr.length > 1){
    tempArr.splice(tempArr.length-1,0,"and")
    }
  // let str = arr.toString()
  var str = tempArr.join([separator = ', '])
  if (tempArr.length > 1){
    str =  str.replace(/,([^,]*)$/, '$1')
  }
  if (tempArr.length == 1){
    str = str.replace(/,(?=[^,]*$)/, ' and')
  }
  str = str.replace(", and"," and")
  str = str.replace("and,","and")
  str = str.replace(" Rest, ice, compression elevation"," Rest, ice, compression and elevation")
  str = str.replace(" and Rest, ice, compression and elevation",", Rest, ice, compression and elevation")
  // let removeLastComma =  str.replace(/,([^,]*)$/, '$1')
    console.log("str",str)
    console.log("temp arr length", tempArr.length)
    tempArr = tempArr.filter(e => e !== 'and'); 
    tempArr.splice(arr.indexOf('and'), 1);
    return str;
}

// const appendAndToArray = async (arr) => {
//   var tempArr = []
//   tempArr = arr
//   if(tempArr.length > 1){
//     tempArr.splice(tempArr.length-1,0,"and")
//     }
//   // let str = arr.toString()
//   let str = tempArr.join([separator = ', '])
//   let removeLastComma =  str.replace(/,([^,]*)$/, '$1')
//     console.log("str",removeLastComma)

//     return removeLastComma;
 
// }

/** 
// ! @dec Get doctor by id in params
// ! @route GET /api/v1/doctors/:id
// ! @access Public (no need to get autheticated)
*/
exports.getDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.find({ '_id': req.params.id });

    if (!doctor) { next(new ErrorResponse('Doctor not found', 404)) }
    res.status(200).json({
      success: true, data: doctor
    });

  } catch (err) {
    next(new ErrorResponse(err.message, 500))
  }

}


/**
* !@dec Get a single doctor from jwt token
* !@route GET /api/v1/doctors
* !@access Public (no need to get autheticated) 
*/
exports.getDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.user.data[1]);

    // we are returning because if record isnt present by id it will show two errors. by returning, it will only return the first one.
    //the catch statement will be executed if the format of the id is incorrect
    //if statement is executed when the format is correct but id is not present into the database
    if (!doctor) {
      return next(new ErrorResponse(`Doctor not found with id of ${req.user.data[1]}`, 404));
    }

    res.status(200).json({
      success: true, data: doctor
    })

  } catch (err) {
    next(new ErrorResponse(err.message, 500));

  }
}

exports.getAllDoctors = async (req, res, next) => {
  try {
    const doctors = await Doctor.find();

    if (!doctors) { next(new ErrorResponse('Doctors not found', 404)) }
    res.status(200).json({
      success: true, count: doctors.length, data: doctors
    });

  } catch (err) {
    next(new ErrorResponse(err.message, 500))
  }
}

exports.getAllCompanies = async (req, res, next) => {
  try {
    const doctors = await Doctor.find();

   const companyName= doctors.map((doctor) => doctor.companyName)
   uniqueArray = companyName.filter(function(item, pos) {
    return companyName.indexOf(item) == pos;
})

    if (!doctors) { next(new ErrorResponse('Doctors not found', 404)) }
    res.status(200).json({
      success: true, data: uniqueArray
    });

  } catch (err) {
    next(new ErrorResponse(err.message, 500))
  }
}
exports.companiesAllDoctors = async (req, res, next) => {
  try {
    const doctor = await Doctor.find({ 'companyName': req.params.companyName });

    if (!doctor) { next(new ErrorResponse('Doctor not found', 404)) }
    res.status(200).json({
      success: true, data: doctor
    });

  } catch (err) {
    next(new ErrorResponse(err.message, 500))
  }
}


/**
* !@dec Update  doctor
* !@route PUT /api/v1/doctors/
* !@access Private
 */
exports.updateDoctor = async (req, res, next) => {
 
  const resDoctor = await Doctor.findById(req.user.data[1]);
  console.log(resDoctor.password)
  if (req.body.password != undefined) {
  if (req.body.password == resDoctor.password) {
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
    const doctor = await Doctor.findByIdAndUpdate(req.user.data[1], req.body, {
      new: true,
      runValidators: true, // this is mongoose validators
    });

    if (!doctor) {
      res.status(400).json({
        success: false,
        message: "Doctor not found!"
      })
    }


    res.status(200).json({
      success: true,
      message: "Doctor updated successfully!"
    })

  } catch (err) {
    next(new ErrorResponse(err.message, 500))
  }
}

/**
* !@dec Delete  doctor
* !@route DELETE /api/v1/doctors/:id
* !@access Private 
*/
exports.deleteDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.user.data[1]);

    if (!doctor) {
      res.status(400).json({ success: false, message: "Doctor not found" });
    }
    res.status(200).json({ success: true, message: "Doctor deleted successfully" })

  } catch (err) {
    res.status(400).json({ success: false, message: err })

  }
  res
    .status(200)
    .json({ success: "true", msg: `Delete Doctor ${req.user.data[1]}` })
}

exports.loginDoctor = async (req, res, next) => {
  try {
    const email = req.body.email;

    // lets check if email exists
    const result = await Doctor.findOne({ "email": email });
    if (!result) {
      // this means result is null
      next(new ErrorResponse('Credentials incorrect, Please try again.', 401))
    } else {

      if (bcrypt.compareSync(req.body.password, result.password)) {
        // great, allow this user access
        result.password = undefined;

        const token = jsonwebtoken.sign({
          data: [result.email, result._id],
          role: 'Doctor'
        }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(200).json({ success: true, token: token });
      }
      else {
        next(new ErrorResponse("Credentials incorrect, Please try again.", 401))
      }
    }
  } catch (err) {
    next(new ErrorResponse(err.message, 500))
  }
};


exports.registerDoctor = async (req, res, next) => {
  try {
    const check = await Doctor.findOne({ 'email': req.body.email })
    if (check) {
      next(new ErrorResponse("Email has already signed up", 401))
    } else {
      // there must be a password in body
      // we follow these 2 steps
      var salt = bcrypt.genSaltSync(10);
      var hash = bcrypt.hashSync(req.body.password, salt);

      req.body.password = hash;
      const doctor = new Doctor(req.body);

      await doctor.save();

      res.send({
        success: true,
        message: 'Doctor Signup successful'
      });
    }
  } catch (err) {
    next(new ErrorResponse(err.message, 500))
  }
};


exports.searchCode = async (req, res, next) => {
  try {
    const searched = req.query.tbv;
    const data = await ICD.find({ 'Description': { $regex: searched, $options: '$i' } });
    res.send(data)
  } catch (err) {
    next(new ErrorResponse(err.message, 500));
  }
}


exports.UploadSkinPictureNewProblem = async (req, res, next) => {
  console.log(req.body)
  console.log(req.files)
  try {
    const p = await Problem.findOne({ _id: req.body.problemId })
    // console.log(p)
    if (!p) {
      return res.status(404).json({
        "message": "Problem not found"
      })
    }
    else {
      var toBeAdded = {
        size: req.body.size,
        description: req.body.description,
        location: req.body.location,
        name: req.body.name,
        skinPhotos: [],
      }
      if (req.files) {
        // if (req.files.photos) {

          if (Array.isArray(req.files.photos)) {
            for (i = 0; i < req.files.photos.length; i++) {
              console.log("checking for photos")
              const urlId = await uploadImage(req.files.photos[i], next)
              console.log(urlId)
              var setPhotos = {
                "url": urlId.url,
                "public_id": urlId.public_id
              }
              toBeAdded.skinPhotos[i] = setPhotos
              console.log(setPhotos)
            }
          }
          else {
            const urlId = await uploadImage(req.files.photos, next)
            console.log("checking for photo")
            var setPhotos = {
              "url": urlId.url,
              "public_id": urlId.public_id
            }
            toBeAdded.skinPhotos[0] = setPhotos
            console.log(setPhotos)
          }
        
        // }

      }
      // var setPhotos = {
      //   "url": "https://res.cloudinary.com/macro-soar-technologies/image/upload/v1653324532/qfgv9k3wtnkhwkihl3l9.jpg",
      //   "public_id": "qfgv9k3wtnkhwkihl3l9"
      // }
      // for (i = 0; i < 1; i++) {
        // toBeAdded.skinPhotos[0] = setPhotos
      // }
      
      console.log(toBeAdded)
      const updatedDiagnosisSkin = await Problem.findOneAndUpdate({ _id: req.body.problemId }, { $push: { "dignosis.skin": toBeAdded } })
      // console.log(updatedDiagnosisSkin.diagnosis.skin)
      if (!updatedDiagnosisSkin) {
        return res.status(400).json({
          success: false,
          data: null
        })
      }
      else {
        return res.status(200).json({
          success: true,
          data: toBeAdded
        })
      }

    }
  }

  catch (err) {
    next(new ErrorResponse(err.message, 500))
  }

}

exports.UploadSkinPictureFollowUp = async (req, res, next) => {
  console.log(req.body)
  console.log(req.files)
  try {
    const followUp = await FollowUpModal.findOne({ _id: req.body.problemId })
    // console.log(p)
    if (!followUp) {
      return res.status(404).json({
        "message": "Problem not found"
      })
    }
    else {
      var toBeAdded = {
        size: req.body.size,
        description: req.body.description,
        location: req.body.location,
        name: req.body.name,
        skinPhotos: [],
      }
      if (req.files) {
        // if (req.files.photos) {

          if (Array.isArray(req.files.photos)) {
            for (i = 0; i < req.files.photos.length; i++) {
              console.log("checking for photos")
              const urlId = await uploadImage(req.files.photos[i], next)
              console.log(urlId)
              var setPhotos = {
                "url": urlId.url,
                "public_id": urlId.public_id
              }
              toBeAdded.skinPhotos[i] = setPhotos
              console.log(setPhotos)
            }
          }
          else {
            const urlId = await uploadImage(req.files.photos, next)
            console.log("checking for photo")
            var setPhotos = {
              "url": urlId.url,
              "public_id": urlId.public_id
            }
            toBeAdded.skinPhotos[0] = setPhotos
            console.log(setPhotos)
          }
        
        // }

      }
      // var setPhotos = {
      //   "url": "https://res.cloudinary.com/macro-soar-technologies/image/upload/v1653324532/qfgv9k3wtnkhwkihl3l9.jpg",
      //   "public_id": "qfgv9k3wtnkhwkihl3l9"
      // }
      // for (i = 0; i < 1; i++) {
        // toBeAdded.skinPhotos[0] = setPhotos
      // }
      
      console.log(toBeAdded)
      const updatedFollowUpSkin = await FollowUpModal.findOneAndUpdate({ _id: req.body.problemId }, { $push: { "followUpVisit.skin": toBeAdded } })
      // console.log(updatedDiagnosisSkin.diagnosis.skin)
      if (!updatedFollowUpSkin) {
        return res.status(400).json({
          success: false,
          data: null
        })
      }
      else {
        return res.status(200).json({
          success: true,
          data: toBeAdded
        })
      }

    }
  }

  catch (err) {
    next(new ErrorResponse(err.message, 500))
  }

}

exports.diagnosis = async (req, res, next) => {
 
  if(req.body.dignosis.date){
    req.body.dignosis.date=new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })
  }
  
  console.log("req.body",req.body)
  try {
    const prb = await Problem.findOneAndUpdate(
      { '_id': req.params.pID },
      req.body,
      {
        new: true,
        runValidators: true,
      });

    if (!prb) {
      return next(new ErrorResponse('problem does not exist', 400))
    }

    console.log("prb",prb)
    if(prb.dignosis.surgeryRecommendedByDoctor.name !== "") {
      const patient = await Patient.find( { '_id': prb.patientID }).lean()
      const updatePatient = patient
        
      const result = updatePatient[0].surgicalHistory.concat(prb.dignosis.surgeryRecommendedByDoctor);

      
      const update = await Patient.findOneAndUpdate({ '_id': prb.patientID },{"surgicalHistory":result});
    } 
    if (req.files) {
      if (req.files.photos.length != 0) {
        if (Array.isArray(req.files.photos)) {
          
          for (i = 0; i < req.files.photos.length; i++) {
            console.log("checking for photos")
            const urlId = await uploadImage(req.files.photos[i], next)
            console.log(urlId)
            var setPhotos = {
              "url": urlId.url,
              "public_id": urlId.public_id
            }
            prb.dignosis.skin.photos[i] = setPhotos
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
     
    }

    await Problem.findOneAndUpdate(
      { '_id': req.params.pID },
      { 'isChecked': true }
    )
  
    res.status(200).json({
      success: true,
      data: prb
    })

  } catch (err) {
    return next(new ErrorResponse(err.message, 500))
  }
}

exports.addRoom = async (req, res, next) => {
 
  
  try {
    let {roomNumber,castNumber,vitals} = req.body;
    console.log("vitals",vitals)
    const prb = await Problem.findOneAndUpdate(
      
      { '_id': req.params.pID },
      {'roomNumber':roomNumber,'castNumber':castNumber},
      {
        new: true,
        runValidators: true,
      });
      const updateVitals = await Problem.findByIdAndUpdate(
      
        { '_id': req.params.pID},
        {$set: {'dignosis.vitals':vitals}},
        {
          new: true,
          runValidators: true,
        });
        console.log("updateVitals",updateVitals.dignosis.vitals)
     
    if (!prb) {
      return next(new ErrorResponse('problem does not exist', 400))
    }
 
    res.status(200).json({
      success: true,
      data: prb
    })

  } catch (err) {
    return next(new ErrorResponse(err.message, 500))
  }
}
//create template in the doctor profile
exports.createTemplate = async (req, res, next) => {
  
  console.log("req.body",req.body)
  try {
    const doct = await Doctor.findOne({ _id: req.params.doctorId }).lean();
    

    const doctor = await Doctor.findOneAndUpdate(
      { '_id': req.params.doctorId },
      {"templateNotes":[...doct.templateNotes,...req.body.templateNotes]},
      {
        new: true,
        runValidators: true,
      });

    if (!doct) {
      return next(new ErrorResponse('problem does not exist', 400))
    }

  

  
    res.status(200).json({
      success: true,
      data: doctor
    })

  } catch (err) {
    return next(new ErrorResponse(err.message, 500))
  }
}


exports.getTemplates = async (req, res, next) => {
  
  console.log("req.body",req.body)
  try {
    const doct = await Doctor.findOne({ _id: req.params.doctorId }).lean();
    

  

    if (!doct) {
      return next(new ErrorResponse('problem does not exist', 400))
    }

  let templateNotes = doct.templateNotes ? doct.templateNotes : [];

  
    res.status(200).json({
      success: true,
      data: templateNotes,
    })

  } catch (err) {
    return next(new ErrorResponse(err.message, 500))
  }
}

exports.getTemplate = async (req, res, next) => {
  
  console.log("req.body",req.body)
  try {
    const doct = await Doctor.findOne({ _id: req.user.data[1]}).lean();
    

  

    if (!doct) {
      return next(new ErrorResponse('problem does not exist', 400))
    }

    const template = doct.templateNotes.filter(obj => obj.treatmentPlan == req.params.treatmentPlan);

  
    res.status(200).json({
      success: true,
      data: template,
    })

  } catch (err) {
    return next(new ErrorResponse(err.message, 500))
  }
}
//update template in the doctor profile

exports.updateTemplate = async (req, res, next) => {
  console.log("req.user",req.user.data[1])
  // console.log("req.body",req.body)
  try {
    const doct = await Doctor.find({ '_id': req.user.data[1] }).lean();

    const tempNoteTemplate = doct[0].templateNotes;

    console.log("req body",req.body.templateNotes.doctorId);

    if (!doct) {
      return next(new ErrorResponse('doctor does not exist', 400))
    }

    for (i=0; i<tempNoteTemplate.length; i++){
      // console.log(tempNoteTemplate[i])
      if (tempNoteTemplate[i]._id == req.params.templateId) {
        console.log("matched obj");
        let {templateName,treatmentPlan,treatmentDetail, doctorId} = req.body.templateNotes;
       
        tempNoteTemplate[i].doctorId = doctorId
        tempNoteTemplate[i].templateName = templateName
        tempNoteTemplate[i].treatmentPlan = treatmentPlan
        tempNoteTemplate[i].treatmentDetail = treatmentDetail

        console.log("updated obj",tempNoteTemplate[i]);
      }
    }
    console.log("Doct note update",tempNoteTemplate);

// const newArr = doct.templateNotes.map(obj => {
 
//   if (obj._id == req.params.templateId) {
//     // console.log("matched obj",obj);
//     let {templateName,treatmentPlan,treatmentDetail} = req.body.templateNotes[0];

//     return {...obj,templateName,treatmentPlan,treatmentDetail};
//   }

//   return obj;
// });

// console.log("newArr",newArr)
//     const doctor = await Doctor.findOneAndUpdate(
//       { '_id': req.user.data[1] },
//       {"templateNotes":newArr},
//       {
//         new: true,
//         runValidators: true,
//       });



    const doctor = await Doctor.findByIdAndUpdate(
      
      { '_id': req.user.data[1] },
      {$set: {'templateNotes':tempNoteTemplate}},
      {
        new: true,
        runValidators: true,
      });


      if (!doctor) {
        return next(new ErrorResponse('template note does not exist', 400))
      }

    res.status(200).json({
      success: true,
      data: tempNoteTemplate
    })

  } catch (err) {
    return next(new ErrorResponse(err.message, 500))
  }
}

exports.deleteTemplate = async (req, res, next) => {
  console.log("req.user",req.user)
  console.log("req.body",req.body)
  try {
    const doct = await Doctor.findOne({ _id: req.user.data[1] }).lean();

    if (!doct) {
      return next(new ErrorResponse('doctor does not exist', 400))
    }
console.log("doct",doct)
  
const newArr = doct.templateNotes.filter(obj => obj._id != req.params.templateId);
console.log("newArr",newArr)
    const doctor = await Doctor.findOneAndUpdate(
      { '_id': req.user.data[1] },
      {"templateNotes":newArr},
      {
        new: true,
        runValidators: true,
      });

  
    res.status(200).json({
      success: true,
      message:"successfully deleted"
    })

  } catch (err) {
    return next(new ErrorResponse(err.message, 500))
  }
}
//helper functions for generation of report
const getAge = (dob) => {
  let month_diff = Date.now() - dob.getTime();
  let age_dt = new Date(month_diff);

  let year = age_dt.getUTCFullYear();

  let age = Math.abs(year - 1970);

  return age
}
const getPassST = (st) => {
  let newArr = [];
  st.forEach(specialTest => {
    let bodypart =specialTest.bodyPart;
    specialTest.test.forEach(s => {
      if (s.isLeftPass =="true") {
        newArr.push(`${s.testName} on the Left ${bodypart}`)
      }
      if (s.isRightPass =="true") {
        newArr.push(`${s.testName} on the Right ${bodypart}`)
      }
    });
  })
  return newArr;
}
const getFailST = (st) => {
  let newArr = [];
  st.forEach(specialTest => {
    let bodypart =specialTest.bodyPart;
    specialTest.test.forEach(s => {
      if (s.isLeftPass =="false")  {

        newArr.push(`${s.testName} on the Left ${bodypart}`)
      }
      if (s.isRightPass =="false") {
        newArr.push(`${s.testName} on the Right ${bodypart}`)
      }
    });
  });
  return newArr;
}


const getPositiveTenderAnatomical = (tenderAnatomical) => {
  let newArr = [];
  tenderAnatomical.forEach(tenderAnatomicalObj => {
    let bodypart = tenderAnatomicalObj.name;

      if (tenderAnatomicalObj.values[0] =="positive to the right")  {

        newArr.push(`Right ${bodypart} ${tenderAnatomicalObj.jointname}`)
      }
      if (tenderAnatomicalObj.values[0] =="positive to the left") {
        newArr.push(`Left ${bodypart} ${tenderAnatomicalObj.jointname}`)
      }
      else {
        if ((tenderAnatomicalObj.name === "left hand" || tenderAnatomicalObj.name === "right hand" || tenderAnatomicalObj.name === "left foot" || tenderAnatomicalObj.name === "right foot")) {
        if (tenderAnatomicalObj.jointname != undefined){
          newArr.push(`${getFinger(tenderAnatomicalObj.values)} ${tenderAnatomicalObj.name? tenderAnatomicalObj.name : ""} ${tenderAnatomicalObj.jointname? tenderAnatomicalObj.jointname : ""}`)
          }
        }
      }
  });
  return newArr;
}


const getNegativeTenderAnatomical = (tenderAnatomical) => {
  let newArr = [];
  tenderAnatomical.forEach(tenderAnatomicalObj => {
    let bodypart = tenderAnatomicalObj.name;

      if (tenderAnatomicalObj.values[0] =="negative to the right")  {

        newArr.push(`Right ${bodypart} ${tenderAnatomicalObj.jointname}`)
      }
      if (tenderAnatomicalObj.values[0] =="negative to the left") {
        newArr.push(`Left ${bodypart} ${tenderAnatomicalObj.jointname}`)
      }
  });
  return newArr;
}

const getPositiveTenderAnatomicalFollowUp = (tenderAnatomical) => {
  let newArr = [];
  tenderAnatomical.forEach(tenderAnatomicalObj => {
    let bodypart = tenderAnatomicalObj.name;

      if (tenderAnatomicalObj.values[0] =="positive to the right")  {

        newArr.push(`Right ${bodypart} ${tenderAnatomicalObj.jointName}`)
      }
      if (tenderAnatomicalObj.values[0] =="positive to the left") {
        newArr.push(`Left ${bodypart} ${tenderAnatomicalObj.jointName}`)
      }
      else {
        if ((tenderAnatomicalObj.name === "left hand" || tenderAnatomicalObj.name === "right hand" || tenderAnatomicalObj.name === "left foot" || tenderAnatomicalObj.name === "right foot")) {
        if (tenderAnatomicalObj.jointName != undefined){
          newArr.push(`${getFinger(tenderAnatomicalObj.values)} ${tenderAnatomicalObj.name? tenderAnatomicalObj.name : ""} ${tenderAnatomicalObj.jointName? tenderAnatomicalObj.jointName : ""}`)
          }
        }
      }
  });
  return newArr;
}


const getNegativeTenderAnatomicalFollowUp = (tenderAnatomical) => {
  let newArr = [];
  tenderAnatomical.forEach(tenderAnatomicalObj => {
    let bodypart = tenderAnatomicalObj.name;

      if (tenderAnatomicalObj.values[0] =="negative to the right")  {

        newArr.push(`Right ${bodypart} ${tenderAnatomicalObj.jointName}`)
      }
      if (tenderAnatomicalObj.values[0] =="negative to the left") {
        newArr.push(`Left ${bodypart} ${tenderAnatomicalObj.jointName}`)
      }
  });
  return newArr;
}

const getVascularExam = (vascularExam) => {
  let newVascularArr = [];

  vascularExam.forEach(vascularObj => {
    let rightVal= ""
    let leftVal= ""

    if (vascularObj.right != undefined){
      if (vascularObj.right != ""){
        rightVal = ` right: ${vascularObj.right}`
      }
    }
    if (vascularObj.left != undefined){
      if (vascularObj.left != ""){
        leftVal = ` left: ${vascularObj.left}`
      }
    }
    
    newVascularArr.push(`${vascularObj.pulseLabel}${rightVal}${leftVal}`)

  });
console.log(newVascularArr)
return newVascularArr;
}

const getSensationExam = (sensationExam) => {
  let newsensationExamArr = [];

  sensationExam.forEach(sensationExamObj => {

    if (sensationExamObj.sensationValue == "normal"){
    newsensationExamArr.push(`${"Normal sensation distally"}` )
    }
    if (sensationExamObj.sensationValue == "diminished"){
      if (sensationExamObj.nerveDistribution == "" ){
        newsensationExamArr.push(`${"Diminished sensation"}`)
      }
      else {
        newsensationExamArr.push(`${"Diminished sensation"} - ${sensationExamObj.nerveDistribution}`)
      }
      
      }
      if (sensationExamObj.sensationValue == "absent"){
        if (sensationExamObj.nerveDistribution == "" ){
          newsensationExamArr.push(`${"Absent sensation"}`)
        }
          else{
          newsensationExamArr.push(`${"Absent sensation"} - ${sensationExamObj.nerveDistribution}`)
          }
        }
  });
console.log(newsensationExamArr)
return newsensationExamArr;
}

const getTreatmentPlan = (treatmentPlan) => {
var treatmentArr = []
treatmentPlan.map((item)=>{
  if (item.treatmentDetail != undefined){

    if (item.treatmentDetail.replace("-","").trim() != "") {
      treatmentArr.push(`${item.treatmentName} - ${item.treatmentDetail}`.replace("-  -","-"))
    }
    else {
      treatmentArr.push(item.treatmentName.replace("-",""))
    }

  }
  else {
    if (item.treatmentName != undefined){
      treatmentArr.push(item.treatmentNamee.replace("-",""))
    }
  }

  
})


return treatmentArr;
}


const getSocial = (sH) => {
  let checked = {
    doesSmoke: "No",
    doesDrink: "No"
  }

  if (sH.smoke.isSmoke) {
    checked.doesSmoke = `yes - ${sH.smoke.numberOfPacks} pack/daily`
  }
  if (sH.drink.isDrink) {
    checked.doesDrink = `yes - ${sH.drink.perSitting} per sitting/${sH.drink.howOften}`
  }
  return checked
}


const getRadiateStr = (condition,Radiate,radiateDetails, pr) => {
 let result =  appendAndToArray(Radiate)
 let comma = radiateDetails.length >=1?",":"";
//  let at = result.length>=1?"at":""
  if (condition) {
    return `${pr} admits to the radiation of symptoms ${result.toLowerCase()} ${comma} ${radiateDetails}.`
  } else {
    return `${pr} denies any radiating symptoms.`
  }
}
const getPreviousTreatments = (sPT) => {
  let str = ""
  if (sPT.isPreviousTreatment) {
   if(sPT.physicalTherapy == undefined){
     sPT.physicalTherapy = {
      whenBegin:"",
       numberOfSession:""
  }
   }
   if( sPT.physicalTherapy.whenBegin != ""  && sPT.previousTreatmentInclude.length >= 1){
    
    return str=`has received previous treatment including ${sPT.previousTreatmentInclude.map((item)=>` ${item}`)} and physical therapy which started on ${sPT.physicalTherapy.whenBegin} and has completed ${sPT.physicalTherapy.numberOfSession} sessions`
    
    }
    if(sPT.physicalTherapy.whenBegin != ""  && sPT.previousTreatmentInclude.length == 0){
      return str=`has received previous treatment including physical therapy which started on ${sPT.physicalTherapy.whenBegin} and has completed ${sPT.physicalTherapy.numberOfSession} sessions`
    }
    if(sPT.physicalTherapy.whenBegin === ""  && sPT.previousTreatmentInclude.length == 0){
      return str=`has received previous treatment`
    }
    if(sPT.physicalTherapy.whenBegin == ""){
      if(sPT.previousTreatmentInclude.length > 1){
        sPT.previousTreatmentInclude.splice(sPT.previousTreatmentInclude.length-1,0,"and")
      }
      const removeComma = sPT.previousTreatmentInclude.join(" ");
     return str=`has received previous treatment including ${removeComma}`
      
    }
 
  } else {
    str = `has not received treatment for this issue in the past`
    return str
  }

}

const getDDStr = (dd) => {
  let arr = [];
  dd.forEach(item => {
    arr.push(`${item.desc} (${item.code})`);
  });
  return arr;
}

const getSurgeryPerformed = (sp) => {
  let arr = [];
  sp.forEach(item => {
    arr.push(`${item.name} (${item.code})`);
  });
  return arr;
}

const getCurrMed = (med) => {
  let meds = [];
  let str = "";
  med.forEach(item => {
    var freqAsNeeded = ""
    var freq = ""
    if (item.frequencyasneeded != ""){
      freqAsNeeded = "PRN"
    }
    if (item.frequency === "2x Daily"){
      freq = "BID"
    }
    if (item.frequency === "3x Daily"){
      freq = "TID"
    }
    if (item.frequency === "4x Daily"){
      freq = "QID"
    }
    if (item.frequency === "1x Daily"){
      freq = "QD"
    }
    if (item.frequency === "At Bedtime"){
      freq = "Q Bedtime"
    }
    else {
      freq = item.frequency
    }
    str = ` ${item.name}  ${item.dose} ${freq} ${freqAsNeeded}`
    meds.push(str);
  });

  return meds;
}
const getStrength = (array) => {
  var spain =[]
  var strength=[]
  for(i=0; i<array.length;i++){
    if(array[i].strengthName.trim() ==="Cervical Spine Flexion" || array[i].strengthName.trim() ==="Cervical Spine Extension" || array[i].strengthName.trim() ==="Thoracic/Lumbar Flexion" ||array[i].strengthName.trim() ==="Thoracic/Lumbar Extension"){
  spain.push(array[i])
  
  }else{
   strength.push(array[i])
  }
 
 var wrapper=[spain,strength]; 
}
return wrapper;
}
const getPhysicalExam = (physicalExam) => {
  var handFootArray = []
  var otherBodyPartArray = []
  var finalHandFootArray = []
  var finalOtherBodyPartArray = []
  for (s = 0; s < physicalExam.length; s++) {
    if ((physicalExam[s].name === "left hand" || physicalExam[s].name === "right hand" || physicalExam[s].name === "left foot" || physicalExam[s].name === "right foot")) {

      handFootArray.push(physicalExam[s])
    }
    else {
      otherBodyPartArray.push(physicalExam[s])
    }
  }
  finalHandFootArray = handFootArray.map((item) => {
    // return `${item.jointname? item.jointname : ""} ${item.name? item.name : ""} at ${getFinger(item.values)}`
    return `${getFinger(item.values)} ${item.name? item.name : ""} ${item.jointname? item.jointname : ""}`
  })
  finalOtherBodyPartArray = otherBodyPartArray.map((item) => {
    if (item.jointname != undefined){
    // return `${item.jointname? item.jointname : ""}  ${item.name? item.name : ""} ${getFinger(item.values)}`
    return `${getFinger(item.values)} ${item.name? item.name : ""} ${item.jointname? item.jointname : ""}`
    }
    else {
      // return `${item.jointName? item.jointName : ""}  ${item.name? item.name : ""} ${getFinger(item.values)}`
      return `${getFinger(item.values)} ${item.name? item.name : ""} ${item.jointname? item.jointname : ""}`
    }
  })

  console.log([finalOtherBodyPartArray, finalHandFootArray])
  return [finalOtherBodyPartArray, finalHandFootArray]

}

const getFinger = (fingersArray) => {
  var fingers = ''

  if (fingersArray.length > 1) {
    for (k = fingersArray.length - 1; k >= 0; k--) {
      if (k <= 0) {
        fingers = fingers + ` and ${fingersArray[k]}`
      }
      else {
        fingers = fingers + `${fingersArray[k]}, `
      }
    }
  }
  else {
    fingers = fingers + `${fingersArray[0]}`
  }
  return capitalizeFirstLetter(fingers);
}

const getDiagnosisAssessment = (assessmentArray) => {
  var assessment = ''

  if (assessmentArray.length > 1) {
    for (k = assessmentArray.length - 1; k >= 0; k--) {
      if (k <= 0) {
        assessment = assessment + ` and ${assessmentArray[k].assessment} ${assessmentArray[k].diagnosisName}`
      }
      else {
        assessment = assessment + `${assessmentArray[k].assessment} ${assessmentArray[k].diagnosisName}, `
      }
    }
  }
  else {
    assessment = assessment + `${assessmentArray[0].assessment} ${assessmentArray[0].diagnosisName}`
  }
  return assessment;
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// const getProblems = (symptoms) => {
//   var problems = ''

//   if (symptoms.length > 1) {
//     for (w = 0; w <= symptoms.length - 1; w++) {
//       if (w >= symptoms.length - 1) {
//         if (symptoms[w] === 'Achy' || symptoms[w] === 'Sharp' || symptoms[w] === 'Dull'
//           || symptoms[w] === 'Sore' || symptoms[w] === 'Tender'
//           || symptoms[w] === 'Burning' || symptoms[w] === 'Stabbing'
//           || symptoms[w] === 'Deep' || symptoms[w] === 'Superficial'
//           || symptoms[w] === 'Bruising' || symptoms[w] === 'achy' || symptoms[w] === 'sharp' || symptoms[w] === 'dull'
//           || symptoms[w] === 'Sore' || symptoms[w] === 'Tender'
//           || symptoms[w] === 'burning' || symptoms[w] === 'stabbing'
//           || symptoms[w] === 'deep' || symptoms[w] === 'superficial'
//           || symptoms[w] === 'bruising') {
//           problems = problems + ` and ${symptoms[w]} pain`
//         }
//         else {
//           problems = problems + ` and ${symptoms[w]}`
//         }
//       }
//       else {
//         if (symptoms[w] === 'Achy' || symptoms[w] === 'Sharp' || symptoms[w] === 'Dull' || symptoms[w] === 'Sore' || symptoms[w] === 'Tender'
//           || symptoms[w] === 'Burning' || symptoms[w] === 'Stabbing' || symptoms[w] === 'Deep' || symptoms[w] === 'Superficial' || symptoms[w] === 'Bruising' ||
//           symptoms[w] === 'achy' || symptoms[w] === 'sharp' || symptoms[w] === 'dull' || symptoms[w] === 'sore' || symptoms[w] === 'tender'
//           || symptoms[w] === 'burning' || symptoms[w] === 'stabbing' || symptoms[w] === 'deep' || symptoms[w] === 'superficial' || symptoms[w] === 'bruising') {
//           problems = problems + `${symptoms[w]} pain, `
//         }
//         else {
//           problems = problems + `${symptoms[w]}, `
//         }
//       }
//     }
//   }
//   else {
//     if (symptoms[w] === 'Achy' || symptoms[w] === 'Sharp' || symptoms[w] === 'Dull' || symptoms[w] === 'Sore' || symptoms[w] === 'Tender'
//       || symptoms[w] === 'Burning' || symptoms[w] === 'Stabbing' || symptoms[w] === 'Deep' || symptoms[w] === 'Superficial' || symptoms[w] === 'Bruising' ||
//       symptoms[w] === 'achy' || symptoms[w] === 'sharp' || symptoms[w] === 'dull' || symptoms[w] === 'sore' || symptoms[w] === 'tender'
//       || symptoms[w] === 'burning' || symptoms[w] === 'stabbing' || symptoms[w] === 'deep' || symptoms[w] === 'superficial' || symptoms[w] === 'bruising') {
//       problems = problems + `${symptoms[0]} pain`
//     }
//     else {
//       problems = problems + `${symptoms[0]}`
//     }
//   }

//   if (problems == "undefined") {
//     return false
//   }
//   else {
//     return problems;
//   }
// }

const getProblems= (symptoms) => {
  var pain = [];
  var painless = []
 for(i=0; i<symptoms.length; i++){
   if(symptoms[i] === 'Achy' || symptoms[i] === 'Sharp' || symptoms[i] === 'Dull' || 
    symptoms[i] === 'Sore' || symptoms[i] === 'Tender'|| symptoms[i] === 'Burning' ||
     symptoms[i] === 'Stabbing' || symptoms[i] === 'Deep' || symptoms[i] === 'Superficial' || symptoms[i] === 'Bruising' || symptoms[i] === 'achy' || symptoms[i] === 'sharp' || symptoms[i] === 'dull' || 
     symptoms[i] === 'sore' || symptoms[i] === 'tender'|| symptoms[i] === 'burning' ||
      symptoms[i] === 'stabbing' || symptoms[i] === 'deep' || symptoms[i] === 'superficial' || symptoms[i] === 'bruising')
     {
     pain.push(` ${symptoms[i]}`)
   }
  }
  
  for(i=0; i<symptoms.length; i++){
    if(symptoms[i] === 'Numbness' || symptoms[i] === 'Weakness' || symptoms[i] === 'Buckling' || 
   symptoms[i] === 'Catching' || symptoms[i] === 'Swelling'|| symptoms[i] === 'Grinding' ||
    symptoms[i] === 'Tingling' || symptoms[i] === 'numbness' || symptoms[i] === 'weakness' || symptoms[i] === 'buckling' || 
    symptoms[i] === 'catching' || symptoms[i] === 'swelling'|| symptoms[i] === 'grinding' ||
     symptoms[i] === 'tingling' || symptoms[i] === 'locking' || symptoms[i] === 'Locking'){
     painless.push(` ${symptoms[i]}`);
     
   }
}
if(pain.length == 0){
painless.splice(painless.length-1,0,"and")
console.log("Painless arr after and logic",painless)
}
if(pain.length >= 1){
  pain.splice(pain.length+1,0," pain")
  }

// if(painless.length == 0){
//   let arr= [painless,pain];
//   let concatenatedArray = arr.join('')
//   // return concatenatedArray ;
// }
let painStr = pain.toString();
let removeCommaPain =painStr.replace(/,([^,]*)$/, '$1');
let painlessStr = painless.toString();
// let removeCommaPainless =painlessStr.replace(/,([^,]*)$/, '$1');
// removeCommaPainless = removeCommaPainless.replace(", and"," and")
let concatenatedArray = []

if (pain.length != 0){
  concatenatedArray = [painlessStr,removeCommaPain]
concatenatedArray.splice(concatenatedArray.length-1,0," and ")
}
else{
  concatenatedArray = [painlessStr]
}
console.log("After first splice arr",concatenatedArray)
let removeCommaConcatenatedArray = concatenatedArray.join(',')

removeCommaConcatenatedArray = removeCommaConcatenatedArray.replace(", and"," and")
if (pain.length == 0){
// removeCommaConcatenatedArray = removeCommaConcatenatedArray.replace(", and"," and")
removeCommaConcatenatedArray = removeCommaConcatenatedArray.replace("and ,"," and")
}
if (pain.length != 0){
  // removeCommaConcatenatedArray = removeCommaConcatenatedArray.replace(", and"," and")
  removeCommaConcatenatedArray = removeCommaConcatenatedArray.replace("and ,","and")
}
else {
  removeCommaConcatenatedArray = removeCommaConcatenatedArray.replace(",and"," and")
  removeCommaConcatenatedArray = removeCommaConcatenatedArray.replace("and,"," and")
}
console.log("symptoms string arr",removeCommaConcatenatedArray)
return removeCommaConcatenatedArray ;
}

const getMedicalHistory = (medicalConditions) => {
  if (medicalConditions) {
    finalMedicalConditions = []
    for (e = 0; e < medicalConditions.length; e++) {
      if (medicalConditions[e].condition.toLowerCase() === 'cancer') {
        finalMedicalConditions.push(`Cancer with type (${capitalizeFirstLetter(medicalConditions[e].value)})`)
      }
      else if (medicalConditions[e].condition.toLowerCase() === 'diabetes') {
        finalMedicalConditions.push(`Diabetes with AIC (${capitalizeFirstLetter(medicalConditions[e].value)})`)
      }
      else {
        finalMedicalConditions.push(`${capitalizeFirstLetter(medicalConditions[e].condition)}`)
      }
    }
    return finalMedicalConditions
  }
  else {
    return
  }
}

const getTreatments = (fullBodyCoordinates) => {
  var bodyCoordinates = ''

  if (fullBodyCoordinates.length > 1) {
    for (p = 0; p <= fullBodyCoordinates.length - 1; p++) {
      if (p >= fullBodyCoordinates.length - 1) {
        bodyCoordinates = bodyCoordinates + ` and ${fullBodyCoordinates[p]}`
      }
      else {
        bodyCoordinates = bodyCoordinates + `${fullBodyCoordinates[p]}, `
      }
    }
  }
  else {
    bodyCoordinates = bodyCoordinates + `${fullBodyCoordinates[0]}`
  }

  if (bodyCoordinates == "undefined") {
    return false
  }
  else {
    let lower =bodyCoordinates.toLowerCase();
    lower =  lower.replace(",  and"," and")
    lower = lower.replace(", and"," and")
console.log("alliviating factors",lower)
    return lower;
  }
}

const getGeneralExam = (generalExam) => {
  // if (generalExam.whoAppears.length <= 0 || generalExam.has.length <= 0 || generalExam.andIs <= 0 || generalExam.patientIs <= 0 || generalExam.gaitIs <= 0) {
  //   return false
  // }
 var tempWhoAppears = "" 
  if (generalExam.whoAppears != undefined) {
    if (generalExam.whoAppears.length > 0){
    if (generalExam.whoAppears[0].trim() != ""){
      tempWhoAppears = ` appears ${generalExam.whoAppears[0].toLowerCase()}.`
    }    
  }
  }

  var tempHas = "" 
  if (generalExam.has != undefined) {
    if (generalExam.has.length > 0){
    if (generalExam.has[0].trim() != ""){
      tempHas = `${generalExam.has[0].toLowerCase()}.`
    }    
  }
  }

  var tempAndIs = "" 
  if (generalExam.andIs != undefined) {
    if (generalExam.andIs.length > 0){
    if (generalExam.andIs[0].trim() != ""){
      tempAndIs = `${generalExam.andIs[0].toLowerCase()}.`
    }    
  }
  }

  var tempPatientIs = "" 
  if (generalExam.patientIs != undefined) {
    if (generalExam.patientIs.length > 0){
    if (generalExam.patientIs[0].trim() != ""){
      tempPatientIs = `${generalExam.patientIs[0].toLowerCase()}.`
    }    
  }
  }
  
  var tempGaitIs = "" 
  if (generalExam.gaitIs != undefined) {
    if (generalExam.gaitIs.length > 0){
    if (generalExam.gaitIs[0].trim() != ""){
      tempGaitIs = `${generalExam.gaitIs[0].toLowerCase()}`
    }    
  }
  }

  const finalGeneralExam = {
    "whoAppears": tempWhoAppears,
    "has": tempHas,
    "andIs": tempAndIs,
    "gaitIs": tempGaitIs 
  }
  if (tempPatientIs != "") {
  if (generalExam.patientIs[0][0].toUpperCase() === 'A' || generalExam.patientIs[0][0].toUpperCase() === 'E' || generalExam.patientIs[0][0].toUpperCase() === 'I'
    || generalExam.patientIs[0][0].toUpperCase() === 'O' || generalExam.patientIs[0][0].toUpperCase() === 'U') {
    finalGeneralExam.patientIs = `an ${getTreatments(generalExam.patientIs)}`
  }
  else {
    finalGeneralExam.patientIs = `a ${getTreatments(generalExam.patientIs)}`
  }
}
  return finalGeneralExam
}


const getProbAreasChiefCom = (areas) => {
  let str = "";

  for (q = 0; q < areas.length; q++) {
    if (areas.length >= 1) {
      str += `${areas[q]}, `
    }
    else {
      str += "(not added by the patient)"
    }
  }
  return str;
}

const getSurgicalHistory = (surgery) => {
   let doctroRecSergury = []
   console.log("surgery",surgery)
   for(i=0; i < surgery.length; i++) {
    if(surgery[i] != null){
      if(surgery[i].recommendByDoctor == false) {
        doctroRecSergury.push(surgery[i])
      }
    }
   
   }
   return doctroRecSergury;

}

const getFollowUp = (surgery) => {
  let followUp= "";
  for(i=0; i<surgery.length; i++) {
    if (surgery[i].treatmentName == "surgery" || surgery[i].treatmentName == "Surgery"){
      followUp = "after surgery"
    }
  }
  return followUp;
}

// const getSkin = (skinArray,fullBodyCoordinates) => {
//   console.log("skinArray",skinArray)
//   console.log("fullBodyCoordinates",fullBodyCoordinates)
//   let skin = [] ;

//   for(i=0; i < skinArray.length; i++){
//     let tempString = []
//            tempString.push(`${skinArray[`${i}`]} to the `)
//     for(k=0; k < fullBodyCoordinates.length; k++) {
//       tempString.push(`${fullBodyCoordinates[`${k}`]}  `)
      
     
//     }
//   console.log("tempString",tempString)
//   if(tempString.length > 2){
//   tempString.splice(tempString.length-1,0,"and ")
//   let str =  tempString.toString()
//   var result = str.replace(/,/g,'') 
//   }
//   let str =  tempString.toString()
//   var result = str.replace(/,/g,'') 
//     skin.push(result)
//   }
//   return skin;

// }


const getSkin = (skinArray) => {
  console.log("skinArray",skinArray)

  let skin = [] ;

  for(i=0; i < skinArray.length; i++){
    var tempString = []
           tempString.push(`${skinArray[`${i}`].name} `);

           if(skinArray[i].location){
            tempString.push(`to the ${skinArray[`${i}`].location} `);
           }

           if(skinArray[i].size){
            tempString.push(`${skinArray[`${i}`].size} in size`)
           }

           if(skinArray[i].description){
            tempString.push(`${skinArray[`${i}`].description} `)
           }
   
      
  let str =  tempString.toString()
  console.log("str",str)
  str.replace("size", "size,")
  var result = str.replace(/,/g,'') 
 const text =  result.replace("size", "size, ")
    skin.push(text)
  
     
    }
  console.log("tempString",tempString)
  

    console.log("skin",skin)
    
  return skin;

}

const getSkin2 = (skinArray) => {
  console.log("skinArray",skinArray)

  let skin = [] ;
  let tempSkinArr = []


  for(i=0; i < skinArray.length; i++){
    var tempString = []
    var tempSkinImagesStyle = ""
    
           tempString.push(`${skinArray[`${i}`].name} `);

           if(skinArray[i].location){
            tempString.push(`to the ${skinArray[`${i}`].location} `);
           }

           if(skinArray[i].size){
            tempString.push(`${skinArray[`${i}`].size} in size`)
           }

           if(skinArray[i].description){
            tempString.push(`${skinArray[`${i}`].description} `)
           }
           if (skinArray[i].skinPhotos){
           if (skinArray[i].skinPhotos.length > 0) {
               tempSkinImagesStyle = ("")
            }
            else {
              tempSkinImagesStyle = ("display:none")
             }
             
           }
           else {
            tempSkinImagesStyle = ("display:none")
           }
   
      
  let str =  tempString.toString()
  console.log("str",str)
  str.replace("size", "size,")
  var result = str.replace(/,/g,'') 
 const text =  result.replace("size", "size, ")
    skin.push(text)

    var skinObj = {
      "skinText": text,
      "skinImg":skinArray[`${i}`].skinPhotos,
      "skinImgStyle":tempSkinImagesStyle
    }
    // console.log(skinObj)

   tempSkinArr.push(skinObj)
     
    }
  console.log("tempSkinArray2",tempSkinArr)
  

  return tempSkinArr;

}

const getSkinPostOp = (skinArray) => {
  console.log("skinArray",skinArray)

  let skin = [] ;
  let tempSkinArr = []


  for(i=0; i < skinArray.length; i++){
    var tempString = []
    var tempSkinImagesStyle = ""
    
           tempString.push(`${skinArray[`${i}`].surgicalSiteName} `);

          
           if (skinArray[i].surgicalSitePhotos){
           if (skinArray[i].surgicalSitePhotos.length > 0) {
               tempSkinImagesStyle = ("")
            }
            else {
              tempSkinImagesStyle = ("display:none")
             }
             
           }
           else {
            tempSkinImagesStyle = ("display:none")
           }
   
      
  let str =  tempString.toString()
  console.log("str",str)
  str.replace("size", "size,")
  var result = str.replace(/,/g,'') 
 const text =  result.replace("size", "size, ")
    skin.push(text)

    var skinObj = {
      "skinText": text,
      "skinImg":skinArray[`${i}`].surgicalSitePhotos,
      "skinImgStyle":tempSkinImagesStyle
    }
    // console.log(skinObj)

   tempSkinArr.push(skinObj)
     
    }
  console.log("tempSkinArray2",tempSkinArr)
  

  return tempSkinArr;

}

// const getProblemConcatenated = (symptoms) => {
//   var problems = ''

//   if (symptoms.length > 1) {
//     for (w = 0; w <= symptoms.length - 1; w++) {
//       if (w >= symptoms.length - 1) {
//         if (symptoms[w] === 'Achy' || symptoms[w] === 'Sharp' || symptoms[w] === 'Dull'
//           || symptoms[w] === 'Sore' || symptoms[w] === 'Tender'
//           || symptoms[w] === 'Burning' || symptoms[w] === 'Stabbing'
//           || symptoms[w] === 'Deep' || symptoms[w] === 'Superficial'
//           || symptoms[w] === 'Bruising') {
//           problems = problems + ` and pain`
//           // problems = "pain,"
//         }
//         else {
//           problems = problems + ` and ${symptoms[w]}`
//         }
//       }
//       else {
//         if (symptoms[w] === 'Achy' || symptoms[w] === 'Sharp' || symptoms[w] === 'Dull' || symptoms[w] === 'Sore' || symptoms[w] === 'Tender'
//           || symptoms[w] === 'Burning' || symptoms[w] === 'Stabbing' || symptoms[w] === 'Deep' || symptoms[w] === 'Superficial' || symptoms[w] === 'Bruising') {
//           problems = problems + `pain, `
//           // problems = "pain,"
//         }
//         else {
//           problems = problems + `${symptoms[w]}, `
//         }
//       }
//     }
//   }
//   else {
//     if (symptoms[w] === 'Achy' || symptoms[w] === 'Sharp' || symptoms[w] === 'Dull' || symptoms[w] === 'Sore' || symptoms[w] === 'Tender'
//       || symptoms[w] === 'Burning' || symptoms[w] === 'Stabbing' || symptoms[w] === 'Deep' || symptoms[w] === 'Superficial' || symptoms[w] === 'Bruising') {
//       problems = problems + `pain`
//       // problems = "pain," 
//     }
//     else {
//       problems = problems + `${symptoms[0]}`
//     }
//   }

//   if (problems == "undefined") {
//     return false
//   }
//   else {
//     return problems;
//   }
// }

const getProblemConcatenated = (symptoms) => {
  var pain = [];
  var painless = []
 for(i=0; i<symptoms.length; i++){
   if(symptoms[i] === 'Achy' || symptoms[i] === 'Sharp' || symptoms[i] === 'Dull' || 
    symptoms[i] === 'Sore' || symptoms[i] === 'Tender'|| symptoms[i] === 'Burning' ||
     symptoms[i] === 'Stabbing' || symptoms[i] === 'Deep' || symptoms[i] === 'Superficial' || symptoms[i] === 'Bruising' || symptoms[i] === 'achy' || symptoms[i] === 'sharp' || symptoms[i] === 'dull' || 
     symptoms[i] === 'sore' || symptoms[i] === 'tender'|| symptoms[i] === 'burning' ||
      symptoms[i] === 'stabbing' || symptoms[i] === 'deep' || symptoms[i] === 'superficial' || symptoms[i] === 'bruising')
     {
     pain[0] = "pain"
   }
  }
  
  for(i=0; i<symptoms.length; i++){
    if(symptoms[i] === 'Numbness' || symptoms[i] === 'Weakness' || symptoms[i] === 'Buckling' || 
   symptoms[i] === 'Catching' || symptoms[i] === 'Swelling'|| symptoms[i] === 'Grinding' ||
    symptoms[i] === 'Tingling' || symptoms[i] === 'numbness' || symptoms[i] === 'weakness' || symptoms[i] === 'buckling' || 
    symptoms[i] === 'catching' || symptoms[i] === 'swelling'|| symptoms[i] === 'grinding' ||
     symptoms[i] === 'tingling' || symptoms[i] === 'locking' || symptoms[i] === 'Locking' ){
     painless.push(` ${symptoms[i]}`);
     
   }
}
if(painless.length > 1){
painless.splice(painless.length-1,0," and ")

}




const  painlessString= painless.toString();
var painlessCopy = painlessString.replace(/,([^,]*)$/, '$1');
painlessCopy = painlessCopy.replace(", and"," and")
let concatenatedArray = [...pain,painlessCopy]
if(painlessCopy.length == 0){
 let commaRemove= concatenatedArray.join("")
 return commaRemove;
}
return concatenatedArray ;
}


// const appendAndBeforTheLastValue = (arr) => {
//   console.log("AAAAA",arr)
//   if(arr.length>1){
//     arr.splice(arr.length-1,0," and")
//     return arr;
//   }
// }




exports.generateReport = async (req, res, next) => {
  try {
    const problem = await Problem.findOne({ _id: req.params.pID }).lean();
    const patient = await Patient.findOne({ _id: problem.patientID }).lean();
   
    if (!problem || !patient || !problem.isChecked) {
      return res.status(400).json({
        success: false,
        data: "Something has gone wrong"
      })
    }
    const getDoctorName = async (id) => {
      const doctor = await Doctor.findOne({ _id: id }).lean()
      return doctor
     
    }

    //HELPER METHOD CALLS
    const doctorName = await getDoctorName(problem.doctorId)
    const result = getProblemConcatenated(problem.symptoms);
    const pAge = getAge(patient.dateOfBirth);
    const pSocial = getSocial(patient.socialHistory)
    // const smokeDrink = getSocial(patient.socialHistory)
    const STA = getPassST(problem.dignosis.specialTests);
    const negativeSTA = getFailST(problem.dignosis.specialTests);
    const pTreatString = getPreviousTreatments(problem.previousTreatment).toLowerCase();
    const patientName = `${patient.fname} ${patient.lname}`;
    let pronoun;
    if (patient.gender === 'male') { pronoun = 'He' }
    else if (patient.gender === 'female') { pronoun = 'She' }
    else { pronoun = 'They' }
    let pronounLowercase;
    if (patient.gender === 'male') { pronounLowercase = 'he' }
    else if (patient.gender === 'female') { pronounLowercase = 'she' }
    else { pronounLowercase = 'they' }
    const pRadiateStr = getRadiateStr(problem.symptomsRadiation.isRadiate,problem.symptomsRadiation.radiateAt,problem.symptomsRadiation.radiateDetails, pronoun);
    // const tret = [...problem.dignosis.treatmentPlan, ...problem.dignosis.medicalEquipment];
    const template = fs.readFileSync('./template/template.html', 'utf-8');
   
    let str_aggFactors = getTreatments(problem.aggravatingFactors);
    if (str_aggFactors) {
      str_aggFactors = str_aggFactors.toLowerCase();
    }
    let str_allFactors = getTreatments(problem.alleviatingFactors);
    if (str_allFactors) {
      str_allFactors = str_allFactors.toLowerCase();
    }

    
  
    let medicationsName = getCurrMed(patient.currentMedications);
    let newMedicationsName = getCurrMed(problem.currentMedications);



    let physicalExam = getPhysicalExam(problem.dignosis.physicalExam)
 

    // str_medications = str_medications.toLowerCase();

    let str_allergies = patient.allergies;

    // --- let str_PMH = patient.medicalConditions.join();

    let str_MMC = getTreatments(patient.familyHistory.motherMConditions);

    let str_FMC = getTreatments(patient.familyHistory.fatherMConditions);
    let str_GPMC = getTreatments(patient.familyHistory.grandparentMConditions);

    let str_SMC = getTreatments(patient.familyHistory.siblingsMConditions);

    let arr_DD = getDDStr(problem.dignosis.differentialDignosis);
    let str_DD = getTreatments(arr_DD);
    let strength= getStrength(problem.dignosis.strength);
    let strWDIncludes = getTreatments(problem.dignosis.workDutyIncludes);
    let strToTheIncludes = getTreatments(problem.dignosis.toTheInclude);

    let problem_areas = getTreatments(problem.fullBodyCoordinates)
    const problem_areasToUpperCase =problem_areas?problem_areas.charAt(0).toUpperCase() + problem_areas.slice(1):"";
    let problem_concatenated = getProblemConcatenated(problem.symptoms)
    let ros_general = getTreatments(patient.reviewSystem.general)
    let ros_neuro = getTreatments(patient.reviewSystem.neurologic)
    let ros_skin = getTreatments(patient.reviewSystem.skin)
    let ros_hemotologic = getTreatments(patient.reviewSystem.hemotologic)
    let ros_musculoskeletal = getTreatments(patient.reviewSystem.musculoskeletal)
    let ros_endocrine = getTreatments(patient.reviewSystem.endocrine)
    let ros_psychiatric = getTreatments(patient.reviewSystem.psychiatric)
    let general_exam = getGeneralExam(problem.dignosis.generalExam)
    let recommendedBydoctorSurgery = getSurgicalHistory(patient.surgicalHistory)
    let followUpText = getFollowUp(problem.dignosis.treatmentPlan)
    let skinFullBodyCoordinate = getSkin (problem.dignosis.skin)
    let skinFullBodyCoordinate2 = getSkin2(problem.dignosis.skin)
    let suggestedFollowup = ""
    if (problem.dignosis.suggestedFollowup !== ""){
      suggestedFollowup = ` in ${problem.dignosis.suggestedFollowup}`
    }
   

    let generalExamPatientIsText = ""
    if (problem.dignosis.generalExam.patientIs != undefined){
      if (problem.dignosis.generalExam.patientIs.length > 0){
        if (problem.dignosis.generalExam.patientIs[0] === "a&o x 3"){
          generalExamPatientIsText = "an awake, alert and oriented"
        } 
        else {
          generalExamPatientIsText = `${problem.dignosis.generalExam.patientIs[0]}`
        }
        
      }
    }
    var generalExamStyle = ""

    if (problem.dignosis.generalExam.patientIs.length < 1 && problem.dignosis.generalExam.whoAppears.length < 1 && problem.dignosis.generalExam.andIs.length < 1 && problem.dignosis.generalExam.gaitIs.length < 1) {
      generalExamStyle = "none"
    }
    // console.log(problem.dignosis.generalExam.patientIs, "patientIs")
    // console.log(problem.dignosis.generalExam.whoAppears, "whoAppears")
    // console.log(problem.dignosis.generalExam.andIs, "andIs")
    // console.log(problem.dignosis.generalExam.gaitIs, "gaitIs")
    
    let pastTreatmentOtherStringDot = problem.previousTreatment.otherTreatments.charAt(problem.previousTreatment.otherTreatments.length - 1) === "." ? " " : ". " 
    // console.log("skinFullBodyCoordinate",skinFullBodyCoordinate)
    // console.log(appendAndToArray(problem.dignosis.medicalEquipment),"medical eqp str")
    // console.log(problem.dignosis.medicalEquipment,"medical eqp Arr")
    var vitalStyle = "none"
    if (problem.dignosis.vitals.BMI === "" && problem.dignosis.vitals.height === "" && problem.dignosis.vitals.weight === "" && problem.dignosis.vitals.heartrate === "" && problem.dignosis.vitals.respiratory === ""&& problem.dignosis.vitals.cardiovascular === ""&& problem.dignosis.vitals.pulmonary === "") { 
      vitalStyle = "none"
    }
    else {
      vitalStyle = ""
    }

    // console.log("Strength ",strength)

    let positiveAnatomicalLandmarks = getPositiveTenderAnatomical(problem.dignosis.physicalExam)
    let negativeAnatomicalLandmarks = getNegativeTenderAnatomical(problem.dignosis.physicalExam)

    console.log("positive anatomical landmarks",getPositiveTenderAnatomical(problem.dignosis.physicalExam))
    console.log("negative anatomical landmarks",getNegativeTenderAnatomical(problem.dignosis.physicalExam))
   

    let vascularExamText = getVascularExam(problem.dignosis.vascularExam)
    let sensationExamText = getSensationExam(problem.dignosis.sensationExam)

    let treatmentPlanArr = getTreatmentPlan(problem.dignosis.treatmentPlan)

    const options = {
      format: 'A4',
      orientation: 'potrait',
      border: '20mm'
    }
    const injuryDetails=problem.injury.Details.toLowerCase();
    const document = {

      html: template,
      data: {
        lN: patient.lname,
        fN: patient.fname,
        DOB: moment(patient.dateOfBirth).format('MMMM Do, YYYY'),
        MRN: patient.insurance.membershipId,
        date: moment(problem.dignosis.date).format('MMMM Do, YYYY'),
        followup:followUpText? ` ${followUpText}.` : `${suggestedFollowup}.`,
        diagnosis: problem.dignosis.assessment,
        treatments: getTreatments(problem.dignosis.treatmentPlan),
        name: `${patient.fname} ${patient.lname}`,
        age: pAge,
        gender: patient.gender,
        problems: getProblems(problem.symptoms),
        symptomsDuration:problem.symptomsDuration,
        symptomsDevelop:problem.symptomsDevelop,
        problem_concatenated: problem_concatenated,
        pronoun,
        pronounLowercase,
        toHasortoHer:pronoun == "He"? "to his" : "to her",
        onset: moment(problem.symptomsStarted).format('MMMM Do, YYYY'),
        intensity: `${problem.symptomsAtBest} to ${problem.symptomsAtWorst}`,
        injury: problem.injury.Details ? `admits to injury: "${injuryDetails}"` : "denies any injury",
        aggrevatingFactors: str_aggFactors,
        alleviatingFactors: str_allFactors,
        symtompsRadiate: pRadiateStr,
        isPastTreatment: problem.previousTreatment.isPreviousTreatment,
        pastTreatmentText: problem.previousTreatment.isPreviousTreatment? "has received treatment for this issue in the past including": "has not received any treatment for this issue in the past.",
        pastTreatmentString: pTreatString,
        pastTreatmentOtherString: problem.previousTreatment.otherTreatments === "" ? "" : `${problem.previousTreatment.otherTreatments}${pastTreatmentOtherStringDot}`,
        allergies: str_allergies,
        allergiesText:str_allergies.length >= 1? 'Allergies:' : '',
        PMH: getMedicalHistory(patient.medicalConditions),
        pmhText:patient.medicalConditions.length >= 1 ? "Past Medical History:" : '',
        PshStyle: recommendedBydoctorSurgery.length == 0 ? "none" : "",
        PSH: recommendedBydoctorSurgery,
        newMedications: newMedicationsName,//after med changes
        medicationHistory: newMedicationsName.length >= 1 ? "	has	taken	the	following	medications	to	help	with this	condition: " : "has not taken any medications to help with this issue.",
        medications: medicationsName,
        medicationsText:medicationsName.length >=1 ? 'Medications:' : '',
        generalExam: general_exam ? general_exam : "General Exam Not Added",
        generalExamPatientIs: generalExamPatientIsText != "" ? `${patientName} is ${generalExamPatientIsText}` : "",
        generalExamWhoAppears: general_exam.whoAppears != "" ? `. ${pronoun} ${general_exam.whoAppears}` : "",
        generalExamHas : general_exam.has != "" ? `${pronoun} has ${general_exam.has}` : "",
        generalExamAndis: general_exam.andIs != "" ? `${pronoun} is ${general_exam.andIs}` : "",
        generalExamGaitIs: general_exam.gaitIs != "" ? `Gait is ${general_exam.gaitIs}.` : "",
        generalExamSectionStyle: generalExamStyle,
        skin: skinFullBodyCoordinate,
        skin2: skinFullBodyCoordinate2,
        skinText:problem.dignosis.skin.length >= 1 ? "Skin Exam positive for:" : "",
        vascularExam: vascularExamText,
        vascularExamObj: problem.dignosis.vascularExam,
        sensationExam: sensationExamText,
        vascularExamStyle: problem.dignosis.vascularExam.length > 0 ? "":"none",
        sensationExamStyle: problem.dignosis.sensationExam.length > 0 ? "":"none",
        problemAreas: problem_areas ? problem_areas : "none",
        problem_areasToUpperCase,
        rosGeneral: ros_general ? ros_general : "none",
        rosNeuro: ros_neuro ? ros_neuro : "none",
        rosSkin: ros_skin ? ros_skin : "none",
        rosHemotologic: ros_hemotologic ? ros_hemotologic : "none",
        rosMusculoskeletal: ros_musculoskeletal ? ros_musculoskeletal : "none",
        rosEndocrine: ros_endocrine ? ros_endocrine : "none",
        rosPsychiatric: ros_psychiatric ? ros_psychiatric : "none",
        generalBodyParts: physicalExam[0],
        handFootLandMarks: physicalExam[1],
        physicalExamText: problem.dignosis.physicalExam.length >= 1  || problem.dignosis.physicalExamThreeDModal.length >= 1 ? "The Patient has tenderness to palpation at:" : "",
        physicalExamThreeDModal:problem.dignosis.physicalExamThreeDModal,
        physicalExamPositive: positiveAnatomicalLandmarks,
        physicalExamNegative: negativeAnatomicalLandmarks,
        physicalExamPositiveStyle: positiveAnatomicalLandmarks.length > 0 || problem.dignosis.physicalExamThreeDModal.length > 0 ? "":"none",
        physicalExamNegativeStyle: negativeAnatomicalLandmarks.length > 0 ? "":"none",
        DD: str_DD ? str_DD : "none",
        DDarray:arr_DD,
        treatmentPlan: problem.dignosis.treatmentPlan,
        treatmentPlane:treatmentPlanArr,
        medicalEquipmentArr: problem.dignosis.medicalEquipment,
        // medicalEquipment: appendAndToArray(problem.dignosis.medicalEquipment),
        range: problem.dignosis.rangeOfMotion,
        rangeOfMotionStyle: problem.dignosis.rangeOfMotion.length > 0 ? "":"none",
        rangeOFMotion:problem.dignosis.rangeOfMotion.length >=1?"Range of motion:":"",
        strength:strength != undefined?strength[1]:[],
        spain:strength != undefined? `${strength[0].length > 0 ? strength[0]:[]}` :[],
        spainStyle:strength !== undefined? `${strength[0].length === 0 ? "none":""}` : "none",
        // strengthStyle:strength[1].length ==0 ? "none":"",
        strengthStyle:strength !== undefined? `${strength[1].length === 0 ? "none":""}` : "none",

        Reflexes: problem.dignosis.reflexes,
        ReflexesStyles:problem.dignosis.reflexes.length == 0 ?"none" : "",
        ST: STA,
        positiveHeading: STA.length >= 1 ? "The patient has a positive: " : '',
        negativeST: negativeSTA,
        negativeHeading:negativeSTA.length >= 1 ? "The patient has a negative:" : "",
        mMC: str_MMC ? str_MMC : "none",
        fMC: str_FMC ? str_FMC : "none",
        gPMC: str_GPMC ? str_GPMC : "none",
        sMC: str_SMC ? str_SMC : "none",
        maritalStatus: patient.socialHistory.maritalStatus,
        handDominance: patient.socialHistory.handDominance,
        handDominanceText: patient.socialHistory.handDominance==="ambidextrous" ? `${patient.socialHistory.handDominance}` : `${patient.socialHistory.handDominance}-hand dominant`,
        occupation:patient.socialHistory.occupation,
        occupationText: patient.socialHistory.occupation ? ` who works as an ${patient.socialHistory.occupation.toLowerCase()}` : "",
        smokes: getSocial(patient.socialHistory),
        drinks: getSocial(patient.socialHistory),
        workDType: problem.dignosis.workDutyType === "Full Duty" ? "Full duty" : `${problem.dignosis.workDutyType} - ${strWDIncludes}  greater than ${problem.dignosis.greaterThan} to the ${problem.dignosis.toThe} ${strToTheIncludes} until next
        visit in ${problem.dignosis.nextVisit}`, // Array
        workDIncludes: strWDIncludes ? strWDIncludes : '',
        diagnosticSudies:problem.dignosis.diagnosticStudies ? problem.dignosis.diagnosticStudies: " ", // Array
        diagnosticSudiesText:problem.dignosis.diagnosticStudies.length >=1 ? "Diagnostic Studies:" : "",
        diagnosticSudiesTextTwo:problem.dignosis.diagnosticStudies.length >=1 ? ", diagnostic studies," : "",
        toThe: problem.dignosis.toThe,
        toTheInclude: strToTheIncludes ? strToTheIncludes : "none", // Array,
        grtrThan: problem.dignosis.greaterThan ? problem.dignosis.greaterThan : '',
        nextVisit: problem.dignosis.nextVisit,
        vitalStyle,
        Temp:problem.dignosis.vitals.temperature?`Temp:  ${problem.dignosis.vitals.temperature}`:"",
        BMI:problem.dignosis.vitals.BMI?`BMI:  ${problem.dignosis.vitals.BMI}`:"",
        height:problem.dignosis.vitals.height?`Ht:  ${problem.dignosis.vitals.height}`:"",
        weight:problem.dignosis.vitals.weight?`Wt:  ${problem.dignosis.vitals.weight}`:"",
        BP:problem.dignosis.vitals.BP?`BP:  ${problem.dignosis.vitals.BP}`:"",
        heartrate:problem.dignosis.vitals.heartrate?`Pulse:  ${problem.dignosis.vitals.heartrate}`:"",
        respiratory:problem.dignosis.vitals.respiratory?`RR:  ${problem.dignosis.vitals.respiratory}`:"",
        cardiovascular:problem.dignosis.vitals.cardiovascular?`CV:  ${problem.dignosis.vitals.cardiovascular}`:"",
        pulmonary:problem.dignosis.vitals.pulmonary?`Pulm:  ${problem.dignosis.vitals.pulmonary}`:"",
        signatureUrl:problem.signature.eSignaturePhotoUrl,
        signatureDate:problem.signature.date,
        doctorNameStyle:problem.signature.eSignaturePhotoUrl?" ":"none",
        imageStyle:problem.signature.eSignaturePhotoUrl ? "width:136px;height:30px; object-fit: contain;text-align:center" : "display:none",
        doctorName:doctorName.name,
        designations:doctorName.designations,
        RadiationDistribution:problem.dignosis.radiationDistribution,
        RadiationDistributionTxt:problem.dignosis.radiationDistribution.length >=1 ? "Distribution Of Radiation:":'',
      },
      path: `${process.env.REPORT_UPLOAD_PATH}/${problem._id}.${patient._id}.pdf`
    }

    pdf.create(document, options).then(result => res.download(`${process.env.REPORT_UPLOAD_PATH}/${problem._id}.${patient._id}.pdf`))
  } catch (err) {
    return next(new ErrorResponse(err.message + "in main document function", 500))
  }
}

exports.getWaitingList = async (req, res, next) => {
  try {
    const waiting = await Problem.find({ 'isChecked': false, "doctorId": req.user.data[1] }).lean();
  
   for(i=0; i<waiting.length; i++){
    const patient = await Patient.findOne({ _id: waiting[i].patientID}).lean();
   
    waiting.forEach((wait) => {wait.currentPatientMedication=patient.currentMedications})
    
  
   }

    if (!waiting) {
      res.status(200).json({
        data: "No patients in waiting",

      })
    }
   
    res.status(200).json({
      count: waiting.length,
      success: true,
      data: waiting
    })
  } catch (err) {
    next(new ErrorResponse(err.message, 500))
  }
}

exports.combineRelatedProblemsList = async (req, res, next) => {
  try {
    let problemId = req.body.problemId;
    console.log(problemId)
    const problem = await Problem.find({ 'isChecked': true, "_id": problemId }).lean();
    const operation = await Operation.find({ 'isChecked': true, "problemId": problemId }).lean();
    const followUpModal = await FollowUpModal.find({ 'isChecked': true, "problemId": problemId }).lean();
  
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
        data: "No thing in problems list",

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

exports.combineWaitingList = async (req, res, next) => {
  try {
    const problem = await Problem.find({ 'isChecked': false, "doctorId": req.user.data[1] }).lean();
    const operation = await Operation.find({ 'isChecked': false, "doctorId": req.user.data[1] }).lean();
    const followUpModal = await FollowUpModal.find({ 'isChecked': false, "doctorId": req.user.data[1] }).lean();
  
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


exports.combineProblemListForDoctor = async (req, res, next) => {
  try {
    let patientId = req.body.patientId
    const problem = await Problem.find({ 'isChecked': true, "patientID": patientId }).lean();
    const operation = await Operation.find({ 'isChecked': true, "patientId": patientId }).lean();
    const followUpModal = await FollowUpModal.find({ 'isChecked': true, "patientId": patientId }).lean();
  
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

exports.UploadSurgicalSiteOperation = async (req, res, next) => {
  console.log(req.body)
  console.log(req.files)
  try {
    const p = await Operation.findOne({ _id: req.body.problemId })
    // console.log(p)
    if (!p) {
      return res.status(404).json({
        "message": "Operation not found"
      })
    }
    else {
      var toBeAdded = {
        surgicalSiteName: req.body.surgicalSiteName,
        surgicalSitePhotos: [],
      }
      if (req.files) {
        // if (req.files.photos) {

          if (Array.isArray(req.files.photos)) {
            for (i = 0; i < req.files.photos.length; i++) {
              console.log("checking for photos")
              const urlId = await uploadImage(req.files.photos[i], next)
              console.log(urlId)
              var setPhotos = {
                "url": urlId.url,
                "public_id": urlId.public_id
              }
              toBeAdded.surgicalSitePhotos[i] = setPhotos
              console.log(setPhotos)
            }
          }
          else {
            const urlId = await uploadImage(req.files.photos, next)
            console.log("checking for photo")
            var setPhotos = {
              "url": urlId.url,
              "public_id": urlId.public_id
            }
            toBeAdded.surgicalSitePhotos[0] = setPhotos
            console.log(setPhotos)
          }
        
        // }

      }

      //   var setPhotos = {
      //   "url": "https://res.cloudinary.com/macro-soar-technologies/image/upload/v1653324532/qfgv9k3wtnkhwkihl3l9.jpg",
      //   "public_id": "qfgv9k3wtnkhwkihl3l9"
      // }
      // for (i = 0; i < 1; i++) {
        // toBeAdded.surgicalSitePhotos[0] = setPhotos
      // }
      console.log(toBeAdded)
      const updatedOperationSurgicalSite = await Operation.findOneAndUpdate({ _id: req.body.problemId }, { $push: { "surgicalSiteExam": toBeAdded } })
      if (!updatedOperationSurgicalSite) {
        return res.status(400).json({
          success: false,
          data: null
        })
      }
      else {
        return res.status(200).json({
          success: true,
          data: toBeAdded
        })
      }

    }
  }

  catch (err) {
    next(new ErrorResponse(err.message, 500))
  }

}

exports.putOperation = async (req, res, next) => {
  try {
    req.body.date=new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })
      const operation = await Operation.findOneAndUpdate(
        { '_id': req.params.operationId },
        req.body,

        {
          new: true,
          runValidators: true,
        });
        if (!operation) {
          return next(new ErrorResponse('follow up note does not exist', 400))
        }
        if(operation.surgeryRecommendedByDoctor.name !== "") {
          const patient = await Patient.find( { '_id': operation.patientId }).lean()
          const updatePatient = patient
          const result = updatePatient[0].surgicalHistory.concat(operation.surgeryRecommendedByDoctor);
          const update = await Patient.findOneAndUpdate({ '_id': operation.patientId },{"surgicalHistory":result});
        } 
       

        const patient = await Patient.find({_id:req.body.patientId}).lean();
       
        if(patient){
          console.log(patient[0].surgicalHistory)
        }
        await Operation.findOneAndUpdate(
          { '_id': req.params.operationId },
          { 'isChecked': true }
        )
        res.status(200).json({
          success: true,
          message:"Operation note update successfully "
        })
    
    
  } catch (err) {
    next(new ErrorResponse(err.message, 500))
  }
}

//doctor update follow up note 
exports.putDoctorFollowUp = async (req, res, next) => {
  try {
    req.body.patientInWaitingRoom.date=new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })
    console.log(req.body)
    const followUp = await FollowUpModal.findOneAndUpdate(
      { '_id': req.params.followUpID },
      req.body,
      {
        new: true,
        runValidators: true,
      });

    if (!followUp) {
      return next(new ErrorResponse('follow up does not exist', 400))
    }
    if(followUp.followUpVisit.surgeryRecommendedByDoctor.name !== "") {
      const patient = await Patient.find( { '_id': followUp.patientId }).lean()
      const updatePatient = patient
      const result = updatePatient[0].surgicalHistory.concat(followUp.followUpVisit.surgeryRecommendedByDoctor);
      const update = await Patient.findOneAndUpdate({ '_id': followUp.patientId },{"surgicalHistory":result});
    } 

    // const differentialDignosis = req.body.followUpVisit.differentialDignosis
    // console.log(differentialDignosis)

    // if (differentialDignosis.length > 0) {

    // const problem = await Problem.find( { '_id': followUp.problemId }).lean()
    // const updateProblem = problem
    // console.log(updateProblem[0].dignosis.differentialDignosis)
    // const result = updateProblem[0].dignosis.differentialDignosis.concat(differentialDignosis);
    // console.log(result)
    // const update = await Problem.findOneAndUpdate({ '_id': followUp.problemId },{"diagnosis.differentialDiagnosis":result});

    // }



console.log("followUp.patientID",followUp.patientId)
    await FollowUpModal.findOneAndUpdate(
      { '_id': req.params.followUpID },
      { 'isChecked': true }
    )
    res.status(200).json({
      success: true,
      message:"follow up note update successfully "
    })

  } catch (err) {
    return next(new ErrorResponse(err.message, 500))
  }
}

exports.getPreviousAppointments = async (req, res, next) => {
  try {
    const prev = await Problem.find({ 'isChecked': true, "doctorId": req.user.data[1] });
    const getDoctorName = async (id) => {
      const doctor = await Doctor.findOne({ _id: id }).lean()
      return doctor
     
    }
    
    
    var doctorName = await getDoctorName(req.user.data[1])
    prev.forEach((element) => {
      element.dignosedBy=`${doctorName.name}, ${doctorName.designations}`
      element.companyName=doctorName.companyName
    });
    if (!prev) {
      res.status(200).json({
        data: "No patients in previously checked",
      })
    }
    res.status(200).json({
      count: prev.length,
      success: true,
      data: prev,
    })
  } catch (err) {
    next(new ErrorResponse(err.message, 500))
  }
}

exports.combinePreviousVisite = async (req, res, next) => {
  try {
    
    const prev = await Problem.find({ 'isChecked': true, "doctorId": req.user.data[1] });
    const followUp = await FollowUpModal.find({ 'isChecked': true, "doctorId": req.user.data[1] });
    const operation = await Operation.find({ 'isChecked': true, "doctorId": req.user.data[1] });

   
    const getDoctorName = async (id) => {
      const doctor = await Doctor.findOne({ _id: id }).lean()
      return doctor
     
    }
    
    
    var doctorName = await getDoctorName(req.user.data[1])
    prev.forEach((element) => {
      element.dignosedBy=`${doctorName.name}, ${doctorName.designations}`
      element.companyName=doctorName.companyName
    });
    if (!prev) {
      res.status(200).json({
        data: "No patients in previously checked",
      })
    }
    var followUpArray = [];
    for(i=0; i<prev.length; i++){
      let obj = {}
      obj.waitingListType="problem";
      obj.followUp={};
      obj.problem=prev[i];
      obj.postOp={};
      followUpArray.push(obj)
    }
    var problemArray = [];
    for(i=0; i<followUp.length; i++){
      let obj = {}
      obj.waitingListType="followUp";
      obj.problem={};
      obj.followUp=followUp[i];
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
    const count = prev.length+followUp.length+operation.length;
    res.status(200).json({
      count:count ,
      success: true,
      data: waitingList,
    })
  } catch (err) {
    next(new ErrorResponse(err.message, 500))
  }
}

exports.generateFollowUp = async (req, res, next) => {
  
  try {
    
    const followUp = await FollowUpModal.findOne({ _id: req.params.FollowId }).lean();
    const patient = await Patient.findOne({ _id: followUp.patientId }).lean();
    const problem = await Problem.findOne({ _id: followUp.problemId }).lean();

    console.log("follow up id",req.params.FollowId)
    console.log(followUp.patientId,"teess",followUp.problemId)

     if (!followUp || !patient ) {
      return res.status(400).json({
        success: false,
        data: "Something has gone wrong"
      })
    }
    const getDoctorName = async (id) => {
      const doctor = await Doctor.findOne({ _id: id }).lean()
      return doctor
     
    }
    let strength= getStrength(followUp.followUpVisit.strength);
    let physicalExam = getPhysicalExam(followUp.followUpVisit.physicalExam);
    const STA = getPassST(followUp.followUpVisit.specialTests);
    const negativeST = getFailST(followUp.followUpVisit.specialTests);

    console.log("Negative Special Tests", negativeST)
    var combine_arr_DD
    var arrDDnew 
    if (followUp.followUpVisit.differentialDignosis != undefined) {
    combine_arr_DD = followUp.followUpVisit.
    differentialDignosis.length > 0 ? problem.dignosis.differentialDignosis.concat(followUp.followUpVisit.
      differentialDignosis) : problem.dignosis.differentialDignosis
      arrDDnew = followUp.followUpVisit.differentialDignosis.length > 0 ? `and new onset ${getDDStr(followUp.followUpVisit.differentialDignosis)}` : ""
    }
    else {
      combine_arr_DD = problem.dignosis.differentialDignosis
      arrDDnew = ""
    }
    let arr_DD = getDDStr(combine_arr_DD);
    let str_DD = getTreatments(arr_DD);
    let pronoun;
    if (patient.gender === 'male') { pronoun = 'He' }
    else if (patient.gender === 'female') { pronoun = 'She' }
    else { pronoun = 'They' }
    let pronounLowercase;
    if (patient.gender === 'male') { pronounLowercase = 'he' }
    else if (patient.gender === 'female') { pronounLowercase = 'she' }
    else { pronounLowercase = 'they' }
    let medicationsName = getCurrMed(patient.currentMedications);
    let problem_areas = getTreatments(problem.fullBodyCoordinates);
    let problem_areasToUpperCase =problem_areas?problem_areas.charAt(0).toUpperCase() + problem_areas.slice(1):"";
    let problem_concatenated = getProblemConcatenated(problem.symptoms)
    let strWDIncludes = getTreatments(followUp.followUpVisit.workDutyIncludes);
    // let strToTheIncludes = getTreatments(problem.dignosis.toTheInclude);
    let injectionDetailDotOrComma = followUp.patientInWaitingRoom.injectionHelpDetail === "" ? "." : ",";
    let fallsOrTraumaDetailDot = followUp.patientInWaitingRoom.fallsTraumaDetail === "" ? "" : ".";
    var injectionDetail = followUp.patientInWaitingRoom.didInjectionHelp === "yes" ? " The patient reports improvement in symptoms since receiving injection at last visit"+injectionDetailDotOrComma :" The patient reports no improvement in symptoms since receiving injection at last visit"+injectionDetailDotOrComma;
    const doctorName = await getDoctorName(problem.doctorId)
    let assessmentUpdateText = ""
   if (followUp.followUpVisit.assessmentUpdate != undefined){
    if (followUp.followUpVisit.assessmentUpdate.length > 0){
    assessmentUpdateText = getDiagnosisAssessment(followUp.followUpVisit.assessmentUpdate)
    }
   } 
    var vitalStyle = "none"
    if (followUp.followUpVisit.vitals.BMI === "" && followUp.followUpVisit.vitals.height === "" && followUp.followUpVisit.vitals.weight === "" && followUp.followUpVisit.vitals.heartrate === "" && followUp.followUpVisit.vitals.respiratory === ""&& followUp.followUpVisit.vitals.cardiovascular === ""&& followUp.followUpVisit.vitals.pulmonary === "") { 
      vitalStyle = "none"
    }
    else {
      vitalStyle = ""
    }

    var fallsTraumaDetailText = ""
    if (followUp.patientInWaitingRoom.fallsTraumaDetail != undefined) {

      fallsTraumaDetailText = followUp.patientInWaitingRoom.fallsTraumaDetail;
    }

    let strToTheIncludes = getTreatments(followUp.followUpVisit.toTheInclude);

   
    let positiveAnatomicalLandmarks = getPositiveTenderAnatomicalFollowUp(followUp.followUpVisit.physicalExam)
    let negativeAnatomicalLandmarks = getNegativeTenderAnatomicalFollowUp(followUp.followUpVisit.physicalExam)
   

    console.log("positive tenderAnatomical",positiveAnatomicalLandmarks)

    let medicalEqpArr = followUp.followUpVisit.medicalEquipment;

    console.log("Medical Equipments", medicalEqpArr)

    let general_exam = getGeneralExam(followUp.followUpVisit.generalExam)

    let generalExamPatientIsText = ""
    if (followUp.followUpVisit.generalExam.patientIs != undefined){
      if (followUp.followUpVisit.generalExam.patientIs.length > 0){
        if (followUp.followUpVisit.generalExam.patientIs[0] === "a&o x 3"){
          generalExamPatientIsText = "an awake, alert and oriented"
        } 
        else {
          generalExamPatientIsText = `${followUp.followUpVisit.generalExam.patientIs[0]}`
        }
        
      }
    }

    var generalExamStyle = ""

    if (followUp.followUpVisit.generalExam.patientIs.length < 1 && followUp.followUpVisit.generalExam.whoAppears.length < 1 && followUp.followUpVisit.generalExam.andIs.length < 1 && followUp.followUpVisit.generalExam.gaitIs.length < 1) {
      generalExamStyle = "none"
    }
    const patientName = `${patient.fname} ${patient.lname}`;

    let skinFullBodyCoordinate2 = getSkin2(followUp.followUpVisit.skin)




    let vascularExamText = getVascularExam(followUp.followUpVisit.vascularExam)
    let sensationExamText = getSensationExam(followUp.followUpVisit.sensationExam)

    let treatmentPlanArr = getTreatmentPlan(followUp.followUpVisit.treatmentPlan)

    const followUpNote = fs.readFileSync('./template/followUp.html', 'utf-8');
    const options = {
      format: 'A4',
      orientation: 'potrait',
      border: '20mm',
    }
    const document = {

      html: followUpNote,
      data: {
        diagnosticSudies: problem.dignosis.diagnosticStudies,
        patient,
        lN: patient.lname,
        fN: patient.fname,
        dateOfBirth:moment(patient.dateOfBirth).format('MMMM Do, YYYY'),
        date: moment(followUp.patientInWaitingRoom.date).format('MMMM Do, YYYY'),
        Age:getAge(patient.dateOfBirth),
        gender:patient.gender,
        MRN: patient.insurance.membershipId,
        pronoun:patient.gender == "male"? "He" : "she",
        pronounLowercase: patient.gender == "male"? "he" : "she",
        hisORHer:patient.gender == "male"?"his" :"her",
        patientInWaitingRoom:followUp.patientInWaitingRoom,
        // injectionDetail:followUp.patientInWaitingRoom.didInjectionHelp === "yes" ? ` The patient reports improvement in symptoms since receiving injection at last visit${injectionDetailDotOrComma}` : ` The patient reports no improvement in symptoms since receiving injection at last visit${injectionDetailDotOrComma}`,
        injectionDetail:followUp.patientInWaitingRoom.didInjectionHelp === "" ? "": injectionDetail,
        improveDetail:followUp.patientInWaitingRoom.injectionHelpDetail === "" ? "" :` and states that it was helpful for ${followUp.patientInWaitingRoom.injectionHelpDetail}.`,
        fallsOrTrauma:followUp.patientInWaitingRoom.fallsOrTrauma? " trauma":"no trauma",
        strength:strength[1],
        strengthStyle:followUp.followUpVisit.strength.length == 0 ?"none" : "",
        skin2: skinFullBodyCoordinate2,
        skinText:followUp.followUpVisit.skin.length >= 1 ? "Skin Exam positive for:" : "",
        // skin:getTreatments(patient.reviewSystem.skin)?"none":getTreatments(patient.reviewSystem.skin),
        // workDType: problem.dignosis.workDutyType === "Full Duty" ? "Full duty" : `${problem.dignosis.workDutyType} - ${strWDIncludes}  greater than ${problem.dignosis.greaterThan} to the ${problem.dignosis.toThe}${strToTheIncludes} until next`,
        vascularExam: vascularExamText,
        vascularExamObj: followUp.followUpVisit.vascularExam,
        sensationExam: sensationExamText,
        vascularExamStyle: followUp.followUpVisit.vascularExam.length > 0 ? "":"none",
        sensationExamStyle: followUp.followUpVisit.sensationExam.length > 0 ? "":"none",
        workDType: followUp.followUpVisit.workDutyType === "Full Duty" ? "Full duty" : `${followUp.followUpVisit.workDutyType} - ${strWDIncludes}  greater than ${followUp.followUpVisit.greaterThan} to the ${followUp.followUpVisit.toThe} ${strToTheIncludes} until next
        visit in ${followUp.followUpVisit.nextVisit}`,
        followUpVisit:followUp.followUpVisit,
        Reflexes: followUp.followUpVisit.reflexes,
        ReflexesStyles:followUp.followUpVisit.reflexes.length == 0 ?"none" : "",
        generalBodyParts: physicalExam[0],
        handFootLandMarks: physicalExam[1],
        physicalExamText: problem.dignosis.physicalExam.length >= 1  || problem.dignosis.physicalExamThreeDModal.length >= 1 ? "The Patient has tenderness to palpation at:" : "",
        physicalExamThreeDModal: followUp.followUpVisit.physicalExamThreeDModal,
        physicalExamPositive: positiveAnatomicalLandmarks,
        physicalExamNegative: negativeAnatomicalLandmarks,
        physicalExamPositiveStyle: positiveAnatomicalLandmarks.length > 0 || followUp.followUpVisit.physicalExamThreeDModal.length > 0 ? "":"none",
        physicalExamNegativeStyle: negativeAnatomicalLandmarks.length > 0 ? "":"none",
        generalExam: general_exam ? general_exam : "General Exam Not Added",
        generalExamPatientIs: generalExamPatientIsText != "" ? `${patientName} is ${generalExamPatientIsText}` : "",
        generalExamWhoAppears: general_exam.whoAppears != "" ? `. ${pronoun} ${general_exam.whoAppears}` : "",
        generalExamHas : general_exam.has != "" ? `${pronoun} has ${general_exam.has}` : "",
        generalExamAndis: general_exam.andIs != "" ? `${pronoun} is ${general_exam.andIs}` : "",
        generalExamGaitIs: general_exam.gaitIs != "" ? `Gait is ${general_exam.gaitIs}.` : "",
        generalExamSectionStyle: generalExamStyle,
        vitals:problem.dignosis.vitals,
        vitalStyle,
        Temp:followUp.followUpVisit.vitals.temperature?`Temp:  ${followUp.followUpVisit.vitals.temperature}`:"",
        BMI:followUp.followUpVisit.vitals.BMI?`BMI:  ${followUp.followUpVisit.vitals.BMI}`:"",
        height:followUp.followUpVisit.vitals.height?`Ht:  ${followUp.followUpVisit.vitals.height}`:"",
        weight:followUp.followUpVisit.vitals.weight?`Wt:  ${followUp.followUpVisit.vitals.weight}`:"",
        BP:followUp.followUpVisit.vitals.BP?`BP:  ${followUp.followUpVisit.vitals.BP}`:"",
        heartrate:followUp.followUpVisit.vitals.heartrate?`Pulse:  ${followUp.followUpVisit.vitals.heartrate}`:"",
        respiratory:followUp.followUpVisit.vitals.respiratory?`RR:  ${followUp.followUpVisit.vitals.respiratory}`:"",
        cardiovascular:followUp.followUpVisit.vitals.cardiovascular?`CV:  ${followUp.followUpVisit.vitals.cardiovascular}`:"", 
        pulmonary:followUp.followUpVisit.vitals.pulmonary?`Pulm:  ${followUp.followUpVisit.vitals.pulmonary}`:"",
        ST: STA,
        negativeSt: negativeST,
        negativeHeading:negativeST.length >= 1 ? "The patient has a negative:" : "",
        positiveHeading: STA.length >= 1 ? "The patient has a positive: " : '',
        RadiationDistribution:problem.dignosis.radiationDistribution,
        RadiationDistributionTxt:problem.dignosis.radiationDistribution.length >=1 ? "Distribution Of Radiation:":'',
        diagnosticSudies:followUp.followUpVisit.diagnosticStudies ? followUp.followUpVisit.diagnosticStudies: " ", // Array
        diagnosticSudiesText:followUp.followUpVisit.diagnosticStudies.length >=1 ? "Diagnostic Studies:" : "",
        DD: str_DD ? str_DD : "none",
        DDarray:arr_DD,
        DDarrayNew: ` ${arrDDnew}`,
        DDarrayOld:  getTreatments(getDDStr(problem.dignosis.differentialDignosis)),
        // assessmentText: followUp.followUpVisit.assessmentUpdate === "none" ? "" : `${followUp.followUpVisit.assessmentUpdate} `,
        assessmentUpdate: assessmentUpdateText != "" ? ` consistent with ${assessmentUpdateText}.` : ",",
        allergiesText:patient.allergies.length >= 1? 'Allergies:' : '',
        medications: medicationsName,
        medicationsText:medicationsName.length >=1 ? 'Medications:' : '',
        rangeOFMotion:followUp.followUpVisit.rangeOfMotion.length >=1?"Range of motion:":"",
        rangeOfMotionStyle: followUp.followUpVisit.rangeOfMotion.length > 0 ? "":"none",
        suggestedFollowUp:followUp.followUpVisit.suggestedFollowup === "" ? "" : `The patient will follow up in ${followUp.followUpVisit.suggestedFollowup}.`,
        hasBeen:followUp.patientInWaitingRoom.treatmentPlanFollow.length >= 1 ? "has been" : "has not been",
        pTreatmentPlanIncluding: followUp.patientInWaitingRoom.treatmentPlanFollow.length >= 1 ? " including ": "", 
        ptreatmentPlane:appendAndToArray(followUp.patientInWaitingRoom.treatmentPlanFollow).toLowerCase(),
        symptoms : followUp.patientInWaitingRoom.symptoms? `${followUp.patientInWaitingRoom.symptoms.toLowerCase()}` : "",
        treatmentPlanIncludesText: followUp.followUpVisit.treatmentPlan.length >= 1 ? "Treatment plan includes:": "",
        treatmentPlane:treatmentPlanArr,
        thrumaDetail: fallsTraumaDetailText === "" ? "." : `, including "${followUp.patientInWaitingRoom.fallsTraumaDetail}"${fallsOrTraumaDetailDot}`.replace("..","."),
        medicalEquipmentArr: medicalEqpArr,
        medicalEquipmentText: medicalEqpArr > 0 ? "The patient was provided with" :"",
        dot:medicalEqpArr.length > 0 ? "." : "",
        // medicalEquipment: appendAndToArray(medicalEqpArr),
        problem_areasToUpperCase,
        problem_concatenated,
        signatureUrl:followUp.signature.eSignaturePhotoUrl,
        signatureDate:followUp.signature.date,
        doctorNameStyle:followUp.signature.eSignaturePhotoUrl?" ":"none",
        imageStyle:followUp.signature.eSignaturePhotoUrl ? "width:136px;height:30px; object-fit: contain;text-align:center" : "display:none",
        doctorName:doctorName.name,
        designations:doctorName.designations,
      },
      path: `${process.env.REPORT_UPLOAD_PATH}/${followUp._id}.pdf`
    }
    pdf.create(document, options).then(result => res.download(`${process.env.REPORT_UPLOAD_PATH}/${followUp._id}.pdf`))
  } catch (err) {
    return next(new ErrorResponse(err.message + " follow up Id is incorrect in generateFollow up function", 500))
  }
}


exports.generateOpNote = async (req, res, next) => {
  try {
    
    
    const operation = await Operation.findOne({ _id: req.params.opId }).lean();
    const patient = await Patient.findOne({ _id: operation.patientId }).lean();
    const problem = await Problem.findOne({ _id: operation.problemId }).lean();
  
    const getDoctorName = async (id) => {
      const doctor = await Doctor.findOne({ _id: id }).lean()
      return doctor
     
    }
   
    const diagnosedText = (cptCode,fullBodyCoordinates) => {
      let str = "";
      let diagnosedStr = [];
      for(i=0; i<cptCode.length; i++){
        str = `${cptCode[i].name} (${cptCode[i].code})`
        diagnosedStr.push(str)

        
      }
      let result = appendAndToArray(diagnosedStr)
      return result;
    }

    const getCptArr = (cptCode, chiefComplaint) => {
      var tempCptCodeArr = []
      console.log("Chief Complaint", chiefComplaint)
      for(i=0; i<cptCode.length; i++){
        tempCptCodeArr.push(`${chiefComplaint} ${cptCode[i].name}`)
      }
      return tempCptCodeArr;
    }
    // console.log(operation)
    // console.log(patient)
    // console.log(problem)
    const patientName = `${patient.fname} ${patient.lname}`;
    let hisORHer = patient.gender == "male"?"his" :"her";
    let pronoun;
    if (patient.gender === 'male') { pronoun = 'He' }
    else if (patient.gender === 'female') { pronoun = 'She' }
    else { pronoun = 'They' }
    let pronounLowercase;
    if (patient.gender === 'male') { pronounLowercase = 'he' }
    else if (patient.gender === 'female') { pronounLowercase = 'she' }
    else { pronounLowercase = 'they' }
    let strength= getStrength(operation.muscularStrengthTesting);
    let problem_areas = getTreatments(problem.fullBodyCoordinates);
    let problem_areasToUpperCase =problem_areas?problem_areas.charAt(0).toUpperCase() + problem_areas.slice(1):"";
    let problem_concatenated = getProblemConcatenated(problem.symptoms) 
    let strWDIncludes = getTreatments(problem.dignosis.workDutyIncludes);
    let strToTheIncludes = getTreatments(problem.dignosis.toTheInclude);
    let arr_DD = getDDStr(operation.differentialDignosis);
    let str_DD = getTreatments(arr_DD);
    const STA = getPassST(problem.dignosis.specialTests);
    const negativeSTA = getFailST(problem.dignosis.specialTests);
    const doctorName = await getDoctorName(problem.doctorId)
    const skinText =  getTreatments(operation.surgicalSiteExam);
    const skinText2 = getSkinPostOp(operation.surgicalSiteExam);
    let diagnosis = diagnosedText(operation.cPTCode)
    let fullBodyText = appendAndToArray(operation.fullBodyCoordinates)
    let patientAmbulatingWithA = operation.patientAmbulating.assistiveDevice.length > 1 ? "":" a";
    let assistiveDevices = operation.patientAmbulating.assistiveDevice.map(element => {return element.toLowerCase()});
    let patientAdmitsArr = `${appendAndToArray(operation.patientAdmits)}`;
    if (operation.vitals.cardiovascular == undefined){
      operation.vitals.cardiovascular = ""
    }
    if (operation.vitals.pulmonary == undefined){
      operation.vitals.pulmonary = ""
    }

    let newCptCode = getCptArr(operation.cPTCode, fullBodyText)

    
    var vitalStyle = "none"
    if (operation.vitals.BMI.trim() === "" && operation.vitals.height.trim() === "" && operation.vitals.weight.trim() === "" && operation.vitals.heartrate.trim() === "" && operation.vitals.respiratory.trim() === "" && operation.vitals.cardiovascular === "" && operation.vitals.pulmonary === "") {
      vitalStyle = "none"
    }
    else {
      vitalStyle = ""
    }

   let spainStyleTemp
   let strengthTemp
   let spainTemp
   let tempStrengthStyle

   if (strength != undefined){
   if (strength.length > 0) {
    spainStyleTemp = strength[0].length ==0 ? "none":""
    tempStrengthStyle = strength[1].length ==0 ? "none":""
    strengthTemp = strength?strength[1]:[]
    spainTemp = strength?strength[0]:[]
   }
   else {
    spainStyleTemp = "none"
    tempStrengthStyle = "none"
    strengthTemp = []
    spainTemp = []
  }

  }
  else {
    spainStyleTemp = "none"
    tempStrengthStyle = "none"
    strengthTemp = []
    spainTemp = []
  }
  console.log("spain style",spainStyleTemp)
  console.log("strength temp",strengthTemp)
  console.log("spain temp",spainTemp)
  console.log("temp strength style",tempStrengthStyle)

    const operationNote = fs.readFileSync('./template/operation.html', 'utf-8');
    // res.status(200).json({data:Note})
    
    // console.log("New CPT codes",diagnosis)

    let vascularExamText = getVascularExam(operation.vascularExam)
    let sensationExamText = getSensationExam(operation.sensationExam)

    var assistiveDevicesText = ` ${appendAndToArray(assistiveDevices)}`
    if (assistiveDevicesText == " " || assistiveDevicesText == "  "){
      assistiveDevicesText = assistiveDevicesText.replace(" "," without any assistive devices")
    }
   
    let treatmentPlanArr = getTreatmentPlan(operation.treatmentPlan)
    console.log("Treatment Plan array: ",treatmentPlanArr)
    let general_exam = getGeneralExam(operation.generalExam)
    let generalExamPatientIsText = ""
    if (operation.generalExam.patientIs != undefined){
      if (operation.generalExam.patientIs.length > 0){
        if (operation.generalExam.patientIs[0] === "a&o x 3"){
          generalExamPatientIsText = "an awake, alert and oriented"
        } 
        else {
          generalExamPatientIsText = `${operation.generalExam.patientIs[0]}`
        }
        
      }
    }
    var generalExamStyle = ""

    if (operation.generalExam.patientIs.length < 1 && operation.generalExam.whoAppears.length < 1 && operation.generalExam.andIs.length < 1 && operation.generalExam.gaitIs.length < 1) {
      generalExamStyle = "none"
    }


    const options = {
      format: 'A4',
      orientation: 'potrait',
      border: '20mm'
    }
    const document = {

      html: operationNote,
      data: {
        operation,
        patient,
        Age:getAge(patient.dateOfBirth),
        dateOfBirth:moment(patient.dateOfBirth).format('MMMM Do, YYYY'),
        date: moment(operation.date).format('MMMM Do, YYYY'),
        workDType: problem.dignosis.workDutyType === "Full Duty" ? "Full duty" : `${problem.dignosis.workDutyType} - ${strWDIncludes}  greater than ${problem.dignosis.greaterThan} to the ${problem.dignosis.toThe}${strToTheIncludes} until next`,
        problem_areasToUpperCase,
        problem_concatenated,
        gender:patient.gender,
        pronoun:patient.gender == "male"? "He" : "she",
        pronounLowercase: patient.gender == "male"? "he" : "she",
        hisORHer:patient.gender == "male"?"his" :"her",
        MRN: patient.insurance.membershipId,
        suggestedFollowUp:operation.suggestedFollowup,
        SurgeryPerformed: appendAndToArray(getSurgeryPerformed(operation.cPTCode)),
        DD: diagnosis,
        NewCPTArr: newCptCode,
        fullBodyText,
        vitals:problem.dignosis.vitals,
        vitalStyle,
        Temp:operation.vitals.temperature?`Temp:  ${operation.vitals.temperature}`:"",
        BMI:operation.vitals.BMI?`BMI:  ${operation.vitals.BMI}`:"",
        height:operation.vitals.height?`Ht:  ${operation.vitals.height}`:"",
        weight:operation.vitals.weight?`Wt:  ${operation.vitals.weight}`:"",
        BP:operation.vitals.BP?`BP:  ${operation.vitals.BP}`:"",
        heartrate:operation.vitals.heartrate?`Pulse:  ${operation.vitals.heartrate}`:"",
        respiratory:operation.vitals.respiratory?`RR:  ${operation.vitals.respiratory}`:"",
        cardiovascular:operation.vitals.cardiovascular ?`CV:  ${operation.vitals.cardiovascular}`:"",
        pulmonary:operation.vitals.pulmonary?`Pulm:  ${operation.vitals.pulmonary}`:"",
        patientAdmits: operation.patientAdmits.length >= 1 ? ` Since surgery, ${pronounLowercase} admits to ${patientAdmitsArr.toLowerCase()}.` : "",
        generalExam: general_exam ? general_exam : "General Exam Not Added",
        generalExamPatientIs: generalExamPatientIsText != "" ? `${patientName} is ${generalExamPatientIsText}` : "",
        generalExamWhoAppears: general_exam.whoAppears != "" ? `. ${pronoun} ${general_exam.whoAppears}` : "",
        generalExamHas : general_exam.has != "" ? `${pronoun} has ${general_exam.has}` : "",
        generalExamAndis: general_exam.andIs != "" ? `${pronoun} is ${general_exam.andIs}` : "",
        generalExamGaitIs: general_exam.gaitIs != "" ? `Gait is ${general_exam.gaitIs}.` : "",
        generalExamSectionStyle: generalExamStyle,
        skin:skinText,
        skin2: skinText2,
        skinText: operation.surgicalSiteExam.length > 0 ? "Incision:" : "",
        vascularExam: vascularExamText,
        vascularExamObj: operation.vascularExam,
        sensationExam: sensationExamText,
        vascularExamStyle: operation.vascularExam.length > 0 ? "":"none",
        sensationExamStyle: operation.sensationExam.length > 0 ? "":"none",
        rangeOfMotionStyle: operation.rangeOfMotion.length > 0 ? "":"none",
        rangeOFMotion:operation.rangeOfMotion.length >=1?"Range of motion:":"",
        // spainStyle:strength[0].length ==0 ? "none":"",
        // strength:strength?strength[1]:[],
        // spain:strength?strength[0]:[],
        spainStyle:spainStyleTemp,
        strength:strengthTemp,
        spain:spainTemp,
        strengthStyle: tempStrengthStyle,
        ST: STA,
        positiveHeading: STA.length >= 1 ? "The patient has a positive: " : '',
        negativeST: negativeSTA,
        negativeHeading:negativeSTA.length >= 1 ? "The patient has a negative:" : "",
        medicalEquipment:operation.medicalEquipment.length >= 1 ? ` The patient was provided with ${appendAndToArray(operation.medicalEquipment).toLowerCase()}.`:"",
        medicalEquipmentArr:operation.medicalEquipment,
        isPain:operation.isPain? "controlled" : "not controlled",
        patientAmbulating:operation.patientAmbulating.ambulating,
        signatureUrl:operation.signature.eSignaturePhotoUrl,
        signatureDate:operation.signature.date,
        doctorNameStyle:operation.signature.eSignaturePhotoUrl?" ":"none",
        imageStyle:operation.signature.eSignaturePhotoUrl ? "width:136px;height:30px; object-fit: contain;text-align:center" : "display:none",
        doctorName:doctorName.name,
        designations:doctorName.designations,
        painDetail:operation.painDetail === "" ? "" : ` including ${operation.painDetail} `,
        ReflexesStyles:operation.reflexes.length == 0 ?"none" : "",
        patientAmbulating:operation.patientAmbulating.assistiveDevice.length >=1? `is ambulating` : "is ambulating without any assistive devices.",
        assistiveDevice:`${assistiveDevicesText}${operation.patientAmbulating.assistiveDevice.length >=1 ?".":""}`,
        ambulatingStyle:operation.patientAmbulating.ambulating ? "" :"none",
        isNotAmbulating:operation.patientAmbulating.ambulating ? "" : "is not ambulatory.",
        medicationtxt:operation.medicationRequired ? "with medication" : "without medication",
        treatmentPlan:operation.treatmentPlan,
        treatmentPlane:treatmentPlanArr,
        treatmentPlanStr: operation.treatmentPlan.length > 0 ? `Treatment plan includes:` : "",
      },
      path: `${process.env.REPORT_UPLOAD_PATH}/${operation._id}.pdf`
    }
    pdf.create(document, options).then(result => res.download(`${process.env.REPORT_UPLOAD_PATH}/${operation._id}.pdf`))
  } catch (err) {
    return next(new ErrorResponse(err.message + " in generate operation note function", 500))
  }
}

      
    
    exports.getCptCode = async (req, res, next) => {
      
      try {
        // let searchedName = req.params.code;
        // const result = await CptCodes.find({ "Code": { $regex: searchedName, $options: '$i' } });
        const result = await CptCodes.find();
        if (result === null) {
          res.status(200).json({
            success: true,
            data: "No surgery with this code exist"
          })
        } else {
          res.status(200).json({
            success: true,
            data: result
          });
    
        }
      } catch (err) {
        next(new ErrorResponse(err.message, 500))
      }
    }


    exports.postCptCode = async (req, res, next) => {
      try {
        const cptCode = new CptCodes({
          Code:req.body.Code,
          SurgeryName:req.body.SurgeryName
        })
    
        const result = await cptCode.save();
      console.log("result",result)
        res.status(200).json({
          success: true,
          data: result
        });
    
      } catch (err) {
        next(new ErrorResponse(err.message, 500))
      }
    }

    exports.followUpSignature = async (req, res, next) => {
      console.log("red",req.body)
      console.log("files",req.files)
      try {
        const p = await FollowUpModal.findOne({ _id: req.body.problemId })
        console.log("p",p)
        if (!p) {
          return res.status(404).json({
            "message": "Problem not found"
          })
        }
        else {
          
          if (req.files) {
            if (req.files.signaturePhoto) { 
                const urlId = await uploadImage(req.files.signaturePhoto, next)
                console.log("urlId",urlId)
                var toBeAdded = {
                  IsSignature: true,
                  eSignaturePhotoUrl:urlId.url,
                  public_id:urlId.public_id,
                  date: new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })
                }
                
              
            }
             
          }
      }
      const updateSignature = await FollowUpModal.findOneAndUpdate({ _id: req.body.problemId }, { signature: toBeAdded } , { new: true, })
      if (!updateSignature) {
        return res.status(400).json({
          success: false,
          data: null
        })
      }
      else {
        return res.status(200).json({
          success: true,
          data: updateSignature
        })
      }
    }
  
  
  
  catch (err) {
    next(new ErrorResponse(err.message, 500))
  }
  
  
  }
  exports.operationSignature = async (req, res, next) => {
    try {
      console.log(req.body)
      const p = await Operation.findOne({ _id: req.body.problemId })
      if (!p) {
        return res.status(404).json({
          "message": "Problem not found"
        })
      }
      else {
        
        if (req.files) {
          if (req.files.signaturePhoto) { 
              const urlId = await uploadImage(req.files.signaturePhoto, next)
              var toBeAdded = {
                IsSignature: true,
                eSignaturePhotoUrl:urlId.url,
                public_id:urlId.public_id,
                date: new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })
              }
              
            
          }
           
        }
    }
    const updateSignature = await Operation.findOneAndUpdate({ _id: req.body.problemId }, { signature: toBeAdded } , { new: true, })
    if (!updateSignature) {
      return res.status(400).json({
        success: false,
        data: null
      })
    }
    else {
      return res.status(200).json({
        success: true,
        data: updateSignature
      })
    }
  }



catch (err) {
  next(new ErrorResponse(err.message, 500))
}
}

exports.getPostOp = async (req, res, next) => {

  try {
      const postOp = await Operation.findOne({ '_id': req.params.postOpId });
     
      if (postOp.length === 0) {
          res.status(200).json({
              success: true,
              data: "no postOp found"
          });
      } else {
          res.status(200).json({
              success: true,  data: postOp
          });
      }
  } catch (err) {
      res.status(201).json({ success: false, message: err.message })
  }

}

exports.getFollowUp = async (req, res, next) => {

  try {
      const followUp = await FollowUpModal.findOne({ '_id': req.params.followUpId });
     
      if (followUp.length === 0) {
          res.status(200).json({
              success: true,
              data: "no followUp found"
          });
      } else {
          res.status(200).json({
              success: true,  data: followUp
          });
      }
  } catch (err) {
      res.status(201).json({ success: false, message: err.message })
  }

}



exports.uploadImage = async (req, res, next) => {
  try 
  {

    
  //   const img =  req.body.skinPhoto;
  //   console.log(req.files.skinPhoto)
  //    if (!img) {
  //   return res.status(400).json({
  //     success: false,
  //     data: null
  //   })
  //     }
  //   else {
  //     console.log(req.body)
  //       if (req.body.skinPhoto) { 
  //           const urlId = await uploadToCloudinary(req.body.skinPhoto, next)
  //           var toBeAdded = {
  //             IsSignature: true,
  //             eSignaturePhotoUrl:urlId.url,
  //             public_id:urlId.public_id,
  //             date: new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })
  //           }

         
  //       }

  //     return res.status(200).json({
  //     success: true,
  //     data: toBeAdded
  //   })

  // }
    

  //   if (!p) {
  //     return res.status(404).json({
  //       "message": "Problem not found"
  //     })
  //   }
  //   else {
      

            
 
         
  //     }
  // }
  // const updateSignature = await Operation.findOneAndUpdate({ _id: req.body.problemId }, { signature: toBeAdded } , { new: true, })
  // if (!updateSignature) {
  //   return res.status(400).json({
  //     success: false,
  //     data: null
  //   })
  // }
  // else {
  //   return res.status(200).json({
  //     success: true,
  //     data: updateSignature
  //   })
  // }




} catch (err) {
next(new ErrorResponse(err.message, 500))
}
}