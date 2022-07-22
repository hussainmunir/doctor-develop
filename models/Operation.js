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
    medicationRequired:Boolean,
    companyName:String,
    painScale:String,
    painCondition:String,
    painDetail:String,
    patientAmbulating:{
        ambulating:Boolean,
        assistiveDevice:[String]
    },
    vitals: {
        height: {
            type: String,
        },
        weight: {
            type: String,

        },
        BP: {
            type: String,

        },
        heartrate: {
            type: String,

        },
        BMI: {
            type: String,

        },
        respiratory: {
            type: String,

        },
        cardiovascular: {
            type: String,
        },
        pulmonary: {
            type: String,
        },
        temperature: {
            type: String,
        },
    },
    surgicalSiteExam: [
        {
            surgicalSiteName: String,
            surgicalSitePhotos: [{
                url: String,
                public_id: String
            }]
        }
    ],
    generalExam: {
        patientIs: [String],
        whoAppears: [String],
        has: [String],
        andIs: [String],
        gaitIs: [String],
        other: String

    },
    vascularExam: [ 
        {
            partName: String,
            pulseLabel: String,
            left: String,
            right: String,
        }
        ],
        sensationExam: [ 
            {
                sensationValue: String,
                nerveDistribution: String,
            }
            ],
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
    workDutyType : String,
    workDutyIncludes : [String],
    toThe: String,
    toTheInclude : [String],
    greaterThan : String,
    nextVisit: String,
    isChecked:{ 
        type:Boolean,
        default:false
    },
    roomNumber: String,
    // castNumber: String,
    signature: {
        eSignaturePhotoUrl: String,
        public_id: String,
        date: String,
        isSignature:Boolean,
    },
    operationDate:String,
    updatedAt:String,
    createdAt: String,
});



module.exports = mongoose.model('Operation', operationSchema);