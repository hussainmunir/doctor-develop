const mongoose = require('mongoose');

const specialTestSchema = new mongoose.Schema({
    bodyPart: String,
    test: [{
        testName: String,
        isLeftPass: {
            type: String,

        },
        isRightPass: {
            type: String,

        }
    }]

})

const strengthSchema = new mongoose.Schema({
    strengthName: {
        type: String

    },
    left: {
        type: Number,
        default: 0
    },
    right: {
        type: Number,
        default: 0

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

const followUpSchema = new mongoose.Schema({
    patientId: String,
    doctorId: String,
    problemId: String,
    isChecked: Boolean,
    patientName:String,

    patientInWaitingRoom:{
        createdAt: String,
        symptoms: String,
        painScale: String,
        treatmentPlanFollow:[String],
        companyName:String,
        didInjectionHelp:String,
        injectionHelpDetail:String,
        fullBodyCoordinates: [String],
        fallsOrTrauma:Boolean,
        fallsTraumaDetail:String,
        differentialDignosis: [ddschema],
    },
    followUpVisit:{
        physicalExamThreeDModal: [String],
        rangeOfMotion: [String],
        physicalExam: [
            {
                name: String,
                jointName: String,
                values: [String]
            }
        ],
        strength: [strengthSchema],
        specialTests: [specialTestSchema],
        reflexes: [reflexesSchema],
        diagnosticStudies: [diagnosticSchema],
        surgeryRecommendedByDoctor: [surgicalSchema],
        treatmentPlan: {
            type: [treatmentSchema],
    
        },
        updatedAt:String,
        medicalEquipment: [String],
        suggestedFollowup: String,
      
       
    },
    signature: {
        eSignaturePhotoUrl: String,
        public_id: String,
        date: String,
        isSignature:Boolean,
    },
  
},{ timestamps: true });



module.exports = mongoose.model('FollowUp', followUpSchema);