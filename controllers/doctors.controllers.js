const Doctor = require('../models/Doctor')
const Operation = require('../models/Operation')
const ICD = require('../models/ICDcodes')
const Problem = require('../models/Problem')
const Patient = require('../models/Patient')
const SpecialTests = require('../models/SpecialTests')
const FollowUpModal = require('../models/FollowUp.js');
const CptCodes = require('../models/CptCodes.js');
const ErrorResponse = require('../utils/errorResponse')
const { destroyImage, uploadImage, uploadPdf } = require('../helpers/helpers')
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jsonwebtoken = require('jsonwebtoken');
const pdf = require('pdf-creator-node')
const moment = require('moment')
var count = 0;




function appendAndToArray(arr){
  if(arr.length > 1){
    arr.splice(arr.length-1,0," and ")
    }
    
  let str = arr.toString()
  let removeLastComma =  str.replace(/,([^,]*)$/, '$1')
    console.log("str",removeLastComma)

    return removeLastComma;
}

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
  if (req.body.password) {
    let salt = bcrypt.genSaltSync(10);
    let hash = bcrypt.hashSync(req.body.password, salt);

    req.body.password = hash;
  }

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
  console.log("req.user",req.user)
  console.log("req.body",req.body)
  try {
    const doct = await Doctor.findOne({ _id: req.user.data[1] }).lean();

    if (!doct) {
      return next(new ErrorResponse('problem does not exist', 400))
    }

  
const newArr = doct.templateNotes.map(obj => {
 
  if (obj._id == req.params.templateId) {
    console.log("matched")
    let {templateName,treatmentPlan,treatmentDetail} = req.body.templateNotes;
    return {...obj, templateName,treatmentPlan,treatmentDetail};
  }

  return obj;
});
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
      data: doctor
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
        newArr.push(`${s.testName} on the left ${bodypart}`)
      }
      if (s.isRightPass =="true") {
        newArr.push(`${s.testName} on the right ${bodypart}`)
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

        newArr.push(`${s.testName} on the left ${bodypart}`)
      }
      if (s.isRightPass =="false") {
        newArr.push(`${s.testName} on the right ${bodypart}`)
      }
    });
  });
  return newArr;
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

const getCurrMed = (med) => {
  let meds = [];
  let str = "";
  med.forEach(item => {
    str = ` ${item.name}  ${item.dose} ${item.frequency} ${item.frequencyasneeded}`
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
    return `${item.jointname} ${item.name} at ${getFinger(item.values)}`
  })
  finalOtherBodyPartArray = otherBodyPartArray.map((item) => {
    return `${item.jointname}  ${item.name}`
  })
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
  return fingers;
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
     symptoms[i] === 'tingling' ){
     painless.push(` ${symptoms[i]}`);
     
   }
}
if(painless.length >= 1 && pain.length >=1){
painless.splice(painless.length+1,0," and ")
}
if(pain.length >= 1){
  pain.splice(pain.length+1,0," pain")
  }

if(painless.length == 0){
  let arr= [painless,pain];
  let concatenatedArray = arr.join('')
  // return concatenatedArray ;
}
let painStr = pain.toString();
let removeCommaPain =painStr.replace(/,([^,]*)$/, '$1');
let painlessStr = painless.toString();
let removeCommaPainless =painlessStr.replace(/,([^,]*)$/, '$1');
let concatenatedArray = [removeCommaPainless,removeCommaPain]
let removeCommaConcatenatedArray = concatenatedArray.join('')
return removeCommaConcatenatedArray ;
}

const getMedicalHistory = (medicalConditions) => {
  if (medicalConditions) {
    finalMedicalConditions = []
    for (e = 0; e < medicalConditions.length; e++) {
      if (medicalConditions[e].condition.toLowerCase() === 'cancer') {
        finalMedicalConditions.push(`Cancer with type (${medicalConditions[e].value})`)
      }
      else if (medicalConditions[e].condition.toLowerCase() === 'diabetes') {
        finalMedicalConditions.push(`Diabetes with AIC (${medicalConditions[e].value})`)
      }
      else {
        finalMedicalConditions.push(`${medicalConditions[e].condition}`)
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
    const lower =bodyCoordinates.toLowerCase();
 
    return lower;
  }
}

const getGeneralExam = (generalExam) => {
  if (generalExam.whoAppears.length <= 0 || generalExam.has.length <= 0 || generalExam.andIs <= 0 || generalExam.patientIs <= 0) {
    return false
  }
  const finalGeneralExam = {
    "whoAppears": generalExam.whoAppears[0].toLowerCase(),
    "has": generalExam.has[0].toLowerCase(),
    "andIs": generalExam.andIs[0].toLowerCase()
  }
  if (generalExam.patientIs[0][0].toUpperCase() === 'A' || generalExam.patientIs[0][0].toUpperCase() === 'E' || generalExam.patientIs[0][0].toUpperCase() === 'I'
    || generalExam.patientIs[0][0].toUpperCase() === 'O' || generalExam.patientIs[0][0].toUpperCase() === 'U') {
    finalGeneralExam.patientIs = `an ${getTreatments(generalExam.patientIs)}`
  }
  else {
    finalGeneralExam.patientIs = `a ${getTreatments(generalExam.patientIs)}`
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
   
   for(i=0; i < surgery.length; i++) {
    if(surgery[i].recommendByDoctor == false) {
      doctroRecSergury.push(surgery[i])
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
     symptoms[i] === 'tingling' ){
     painless.push(` ${symptoms[i]}`);
     
   }
}
if(painless.length >= 1){
painless.splice(painless.length-1,0," and ")
}


const  painlessString= painless.toString();
const painlessCopy = painlessString.replace(/,([^,]*)$/, '$1');
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
    let pronoun;
    if (patient.gender === 'male') { pronoun = 'He' }
    else if (patient.gender === 'female') { pronoun = 'She' }
    else { pronoun = 'They' }
    const pRadiateStr = getRadiateStr(problem.symptomsRadiation.isRadiate,problem.symptomsRadiation.radiateAt,problem.symptomsRadiation.radiateDetails, pronoun);
    const tret = [...problem.dignosis.treatmentPlan, ...problem.dignosis.medicalEquipment];
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
    console.log("skinFullBodyCoordinate",skinFullBodyCoordinate)
   
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
        followup:followUpText? followUpText : `in ${problem.dignosis.suggestedFollowup}`,
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
        toHasortoHer:pronoun == "He"? "to his" : "to her",
        onset: moment(problem.symptomsStarted).format('MMMM Do, YYYY'),
        intensity: `${problem.symptomsAtBest} to ${problem.symptomsAtWorst}`,
        injury: problem.injury.Details ? `admits to injury: " ${injuryDetails}"` : "denies any injury",
        aggrevatingFactors: str_aggFactors,
        alleviatingFactors: str_allFactors,
        symtompsRadiate: pRadiateStr,
        isPastTreatment: problem.previousTreatment.isPreviousTreatment,
        pastTreatmentText: problem.previousTreatment.isPreviousTreatment? "has received treatment for this issue in the past including": "has not received any treatment for this issue in the past.",
        pastTreatmentString: pTreatString,
        allergies: str_allergies,
        allergiesText:str_allergies.length >= 1? 'Allergies:' : '',
        PMH: getMedicalHistory(patient.medicalConditions),
        pmhText:patient.medicalConditions.length >= 1 ? "Past Medical History:" : '',
        PSH: recommendedBydoctorSurgery,
        newMedications: newMedicationsName,//after med changes
        medicationHistory: newMedicationsName.length >= 1 ? "	has	taken	the	following	medications	to	help	with this	condition: " : "has not taken any medications to help with this issue.",
        medications: medicationsName,
        medicationsText:medicationsName.length >=1 ? 'Medications:' : '',
        generalExam: general_exam ? general_exam : "General Exam Not Added",
        skin: skinFullBodyCoordinate,
        skinText:problem.dignosis.skin.length >= 1 ? "Skin Exam positive for:" : "",
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
        DD: str_DD ? str_DD : "none",
        DDarray:arr_DD,
        treatmentPlan: problem.dignosis.treatmentPlan,
        medicalEquipment:problem.dignosis.medicalEquipment,
        range: problem.dignosis.rangeOfMotion,
        rangeOFMotion:problem.dignosis.rangeOfMotion.length >=1?"Range of motion:":"",
        strength:strength?strength[1]:[],
        spain:strength?strength[0]:[],
        spainStyle:strength[0].length ==0 ? "none":"",
        strengthStyle:strength[1].length ==0 ? "none":"",
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
        occupation:patient.socialHistory.occupation,
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
        BMI:problem.dignosis.vitals.BMI?`BMI:  ${problem.dignosis.vitals.BMI}`:"",
        height:problem.dignosis.vitals.height?`Ht:  ${problem.dignosis.vitals.height}`:"",
        weight:problem.dignosis.vitals.weight?`Wt:  ${problem.dignosis.vitals.weight}`:"",
        BP:problem.dignosis.vitals.BP?`BP:  ${problem.dignosis.vitals.BP}`:"",
        heartrate:problem.dignosis.vitals.heartrate?`Pulse:  ${problem.dignosis.vitals.heartrate}`:"",
        respiratory:problem.dignosis.vitals.respiratory?`RR:  ${problem.dignosis.vitals.respiratory}`:"",
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
    const followUp = await FollowUpModal.findOneAndUpdate(
      { '_id': req.params.followUpID },
      req.body,
      {
        new: true,
        runValidators: true,
      });

    if (!followUp) {
      return next(new ErrorResponse('follow up note does not exist', 400))
    }
    if(followUp.followUpVisit.surgeryRecommendedByDoctor.name !== "") {
      const patient = await Patient.find( { '_id': followUp.patientId }).lean()
      const updatePatient = patient
      const result = updatePatient[0].surgicalHistory.concat(followUp.followUpVisit.surgeryRecommendedByDoctor);
      const update = await Patient.findOneAndUpdate({ '_id': followUp.patientId },{"surgicalHistory":result});
    } 
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
    let arr_DD = getDDStr(problem.dignosis.differentialDignosis);
    let str_DD = getTreatments(arr_DD);
    let medicationsName = getCurrMed(patient.currentMedications);
    let problem_areas = getTreatments(problem.fullBodyCoordinates);
    let problem_areasToUpperCase =problem_areas?problem_areas.charAt(0).toUpperCase() + problem_areas.slice(1):"";
    let problem_concatenated = getProblemConcatenated(problem.symptoms)
    let strWDIncludes = getTreatments(problem.dignosis.workDutyIncludes);
    let strToTheIncludes = getTreatments(problem.dignosis.toTheInclude);
    const doctorName = await getDoctorName(problem.doctorId)
   
    const followUpNote = fs.readFileSync('./template/followUp.html', 'utf-8');
    const options = {
      format: 'A4',
      orientation: 'potrait',
      border: '20mm',
    }
    const document = {

      html: followUpNote,
      data: {
        diagnosticSudies,
        patient,
        dateOfBirth:moment(patient.dateOfBirth).format('MMMM Do, YYYY'),
        date: moment(followUp.patientInWaitingRoom.date).format('MMMM Do, YYYY'),
        Age:getAge(patient.dateOfBirth),
        gender:patient.gender,
        pronoun:patient.gender == "male"? "He" : "she",
        hisORHer:patient.gender == "male"?"his" :"her",
        patientInWaitingRoom:followUp.patientInWaitingRoom,
        injectionDetail:followUp.patientInWaitingRoom.didInjectionHelp == true?" improvement":" no improvement",
        improveDetail:followUp.patientInWaitingRoom.improveDetail,
        fallsOrTrauma:followUp.patientInWaitingRoom.fallsOrTrauma?" trauma,including ":"no trauma.",
        strength:strength[1],
        skin:!getTreatments(patient.reviewSystem.skin)?"none":getTreatments(patient.reviewSystem.skin),
        workDType: problem.dignosis.workDutyType === "Full Duty" ? "Full duty" : `${problem.dignosis.workDutyType} - ${strWDIncludes}  greater than ${problem.dignosis.greaterThan} to the ${problem.dignosis.toThe}${strToTheIncludes} until next`,
        followUpVisit:followUp.followUpVisit,
        generalBodyParts: physicalExam[0],
        handFootLandMarks: physicalExam[1],
        physicalExamText: problem.dignosis.physicalExam.length >= 1  || problem.dignosis.physicalExamThreeDModal.length >= 1 ? "The Patient has tenderness to palpation at:" : "",
        physicalExamThreeDModal:problem.dignosis.physicalExamThreeDModal,
        vitals:problem.dignosis.vitals,
        ST: STA,
        positiveHeading: STA.length >= 1 ? "The patient has a positive: " : '',
        RadiationDistribution:problem.dignosis.radiationDistribution,
        RadiationDistributionTxt:problem.dignosis.radiationDistribution.length >=1 ? "Distribution Of Radiation:":'',
        diagnosticSudies:followUp.followUpVisit.diagnosticStudies ? followUp.followUpVisit.diagnosticStudies: " ", // Array
        diagnosticSudiesText:followUp.followUpVisit.diagnosticStudies.length >=1 ? "Diagnostic Studies:" : "",
        DD: str_DD ? str_DD : "none",
        DDarray:arr_DD,
        allergiesText:patient.allergies.length >= 1? 'Allergies:' : '',
        medications: medicationsName,
        medicationsText:medicationsName.length >=1 ? 'Medications:' : '',
        rangeOFMotion:followUp.followUpVisit.rangeOfMotion.length >=1?"Range of motion:":"",
        suggestedFollowUp:followUp.followUpVisit.suggestedFollowup,
        hasBeen:followUp.followUpVisit.treatmentPlan.length >= 1 ? "has been" : "has not been",
        ptreatmentPlane:followUp.followUpVisit.treatmentPlan,
        treatmentPlane:followUp.followUpVisit.treatmentPlan,
        thrumaDetail:followUp.patientInWaitingRoom.fallsTraumaDetail,
        medicalEquipment:followUp.followUpVisit.medicalEquipment,
        medicalEquipmentText:followUp.followUpVisit.medicalEquipment.length >= 1 ? "The patient was provided with" :"",
        dot:followUp.followUpVisit.medicalEquipment.length >= 1 ? "." : "",
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
   
    let strength= getStrength(problem.dignosis.strength);
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
    let diagnosis = diagnosedText(operation.cPTCode)
    let fullBodyText =appendAndToArray(operation.fullBodyCoordinates)
   


    const operationNote = fs.readFileSync('./template/operation.html', 'utf-8');
    // res.status(200).json({data:Note})
    
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
        hisORHer:patient.gender == "male"?"his" :"her",
        MRN: patient.insurance.membershipId,
        suggestedFollowUp:operation.suggestedFollowup,
        DD: diagnosis,
        fullBodyText,
        vitals:problem.dignosis.vitals,
        skin:skinText,
        rangeOFMotion:operation.rangeOfMotion.length >=1?"Range of motion:":"",
        strength:strength[1],
        ST: STA,
        positiveHeading: STA.length >= 1 ? "The patient has a positive: " : '',
        negativeST: negativeSTA,
        negativeHeading:negativeSTA.length >= 1 ? "The patient has a negative:" : "",
        medicalEquipment:operation.medicalEquipment,
        isPain:operation.isPain? "controlled" : "not controlled",
        patientAmbulating:operation.patientAmbulating.ambulating,
        signatureUrl:operation.signature.eSignaturePhotoUrl,
        signatureDate:operation.signature.date,
        doctorNameStyle:operation.signature.eSignaturePhotoUrl?" ":"none",
        imageStyle:operation.signature.eSignaturePhotoUrl ? "width:136px;height:30px; object-fit: contain;text-align:center" : "display:none",
        doctorName:doctorName.name,
        designations:doctorName.designations,
        painDetail:operation.medicationRequired? operation.painDetail : "",
        patientAmbulating:operation.patientAmbulating.assistiveDevice.length >=1? "is ambulating with" : "Is ambulating without any assistive devices",
        assistiveDevice:operation.patientAmbulating.assistiveDevice.map(element => {return element.toLowerCase()}),
        ambulatingStyle:operation.patientAmbulating.ambulating ? "" :"none",
        isNotAmbulating:operation.patientAmbulating.ambulating ? "" : "is not ambulatory",
        medicationtxt:operation.medicationRequired ? "with medication including" : "without medication",
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
