const mongoose = require('mongoose');

const muscularStrength = new mongoose.Schema({
    strengthName: {
        type: String

    },
    left: {
        type: String,
    },
    right: {
        type: String,
    }
})

const reflexesSchema = new mongoose.Schema({
    reflexName: {
        type: String

    },
    left: {
        type: String,
    },
    right: {
        type: String,
    }
})
const treatmentSchema = new mongoose.Schema({
    treatmentName : {
        type: String

    },
    treatmentDetail: {
        type: String,
    },
   
})

const ddschema = new mongoose.Schema({
    code: {
        type: String,

    },
    desc: {
        type: String,

    }
})

const diagnosticSchema = new mongoose.Schema({
    labName: {
        type: String

    },
    labResult: {
        type: String,
    },
    labId: {
        type: String,
    }
})
const surgicalHistorySchema = new mongoose.Schema({
    name: {
        type: String
    },
    code: {
        type: String
    },
    problemId:String,
    recommendByDoctor:{
        type:Boolean,
    },
    surgicalId:String,
})

const surgicalSchema = new mongoose.Schema({
    name: {
        type: String
    },
    code: {
        type: String
    },
    problemId:String,
    recommendByDoctor:{
        type:Boolean,
    },
    surgicalId:String,
})

const operationSchema = new mongoose.Schema({
    patientName:String,
    patientId: String,
    doctorId: String,
    problemId: String,
    isChecked: Boolean,
    patientAdmits: [String],
    isPain: Boolean,
    companyName:String,
    painScale:String,
    painCondition:String,
    painDetail:String,
    patientAmbulating:{
        ambulating:Boolean,
        assistiveDevice:[String]
    },
    surgicalSiteExam:[String],
    rangeOfMotion: [String],
    muscularStrengthTesting: [muscularStrength],
    reflexes: [reflexesSchema],
    diagnosticStudies: [diagnosticSchema],
    cPTCode:[surgicalSchema],
    surgeryRecommendedByDoctor: [surgicalSchema],
    treatmentPlan:[treatmentSchema],
    medicalEquipment: [String],
    suggestedFollowup: String,
    surgicalHistory: [surgicalHistorySchema],
    differentialDignosis: [ddschema],
    fullBodyCoordinates: [String],
    isChecked:{ 
        type:Boolean,
        default:false
    },
    signature: {
        eSignaturePhotoUrl: String,
        public_id: String,
        date: String,
        isSignature:Boolean,
    },
});



module.exports = mongoose.model('Operation', operationSchema);