const Problem = require('../models/Problem');
const Patient = require('../models/Patient');
const ErrorResponse = require('../utils/errorResponse');
const { getPatientNames } = require('../helpers/helpers')

exports.getAllProblems = async (req, res, next) => {
    try {
        const problems = await Problem.find();
        if (problems.length === 0) {
            res.status(200).json({
                success: true,
                data: "no previous problems found"
            });
        } else {
            res.status(200).json({
                success: true, data: problems
            });
        }
    } catch (err) {
        res.status(201).json({ success: false, message: err.message })
    }
}

exports.getDocProblems = async (req, res, next) => {
    try {
        console.log("getting doctor specific problems")
        const userIds = await Problem.find({ 'doctorId': req.user.data[1] }).distinct('patientID');

        if (userIds.length === 0) {
            res.status(200).json({
                success: true,
                data: "no previous problems found"
            });
        } else {
            const resProblems = []
            for (i = 0; i < userIds.length; i++) {
                const NAMEpatient = await getPatientNames(userIds)
                resProblems.push({
                    doctorId: req.user.data[1],
                    patientId: userIds[i],
                    patientName: NAMEpatient
                }
                )
            }
            res.status(200).json({
                success: true, data: resProblems
            });
        }
    } catch (err) {
        res.status(201).json({ success: false, message: err.message })
    }
}

exports.getProblems = async (req, res, next) => {

    try {
        const problems = await Problem.find({ 'patientID': req.user.data[1] });
        if (problems.length === 0) {
            res.status(200).json({
                success: true,
                data: "no previous problems found"
            });
        } else {
            res.status(200).json({
                success: true, count: problems.length, data: problems
            });
        }
    } catch (err) {
        res.status(201).json({ success: false, message: err.message })
    }

}

exports.updatePatientSignature = async (req, res, next) => {
    console.log("in update signature")
    console.log(req.body)
    console.log(req.files)
    try {
      const p = await Problem.findOne({ _id: req.body.problemId })
      if (!p) {
        return res.status(404).json({
          "message": "Problem not found"
        })
      }
      else {
        
        if (req.files) {
          if (req.files.photo) { 
              const urlId = await uploadImage(req.files.photo, next)
    
              var toBeAdded = {
                IsSignature: true,
                eSignaturePhoto:urlId.url,
                publicId:urlId.public_id
              }
            
          }
           
        }
    }
    const updateSignature = await Problem.findOneAndUpdate({ _id: req.body.problemId }, { $push: { signature: toBeAdded } }, { new: true, })
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



exports.setProblems = async (req, res, next) => {
    console.log("i am here")
    console.log(req.body)
    console.log("teste" , req.body.isRaditate);
    try {
        const problem = new Problem({
            patientID: req.user.data[1],
            doctorId: req.body.doctorId,
            fullBodyCoordinates: req.body.fullBodyCoordinates,
            symptoms: req.body.symptoms,
            symptomsStarted: req.body.symptomsStarted,
            symptomsDevelop: req.body.symptomsDevelop,
            "injury.isInjury": req.body.isInjury,
            "injury.Details": req.body.injuryDetails,
            symptomsDuration: req.body.symptomsDuration,
            symptomsAtBest: req.body.symptomsAtBest,
            symptomsAtWorst: req.body.symptomsAtWorst,
            "symptomsRadiation.isRadiate": req.body.isRaditate,
            "symptomsRadiation.radiateAt": req.body.radiateAt,
            "symptomsRadiation.radiateDetails": req.body.radiateDetails,
            radiationDistribution: req.body.radiationDistribution,
            aggravatingFactors: req.body.aggravatingFactors,
            alleviatingFactors: req.body.alleviatingFactors,
            "previousTreatment.isPreviousTreatment": req.body.isPreviousTreatment,
            "previousTreatment.previousTreatmentInclude": req.body.previousTreatmentInclude,
            "previousTreatment.otherTreatments": req.body.otherTreatments,
            "signature.publicId":req.body.signature.publicId,
            "signature.eSignaturePhoto":req.body.signature.eSignaturePhoto,
            "signature.isSignature":req.body.signature.isSignature,
            currentMedications: req.body.currentMedications,
            createdAt: req.body.createdAt,
            isChecked: false,
        });
        const p = await Patient.findOne({ '_id': req.user.data[1] });
        problem.patientName = `${p.fname} ${p.lname}`;
        const result = await problem.save();
        return res.status(200).json({
            success: true,
            message: 'problem added successfully'
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message })
    }
}