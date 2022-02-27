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


// const patientFollowUpSchema = new mongoose.Schema({
//     symptoms: String,
//     painScale: String,
//     treatmentPlanFollow:[String],
//     companyName:String,
//     didInjectionHelp:Boolean,
//     injectionHelpDetail:String,
//     improveWithInjection:Boolean,
//     improveDetail:String,
//     fallsOrTrauma:Boolean
// }
//     );

// const doctorFollowUpSchema = new mongoose.Schema({
//     physicalExamThreeDModal: [String],
//     rangeOfMotion: [String],
//     physicalExam: [
//         {
//             name: String,
//             jointname: String,
//             values: [String]
//         }
//     ],
//     strength: [strengthSchema],
//     specialTests: [specialTestSchema],
//     reflexes: [reflexesSchema],
//     diagnosticStudies: [diagnosticSchema],
//     treatmentPlan: {
//         type: [treatmentSchema],

//     },
// })

const followUpSchema = new mongoose.Schema({
    patientId: String,
    doctorId: String,
    problemId: String,
    isChecked: Boolean,
    patientName:String,

    patientInWaitingRoom:{
        symptoms: String,
        painScale: String,
        treatmentPlanFollow:[String],
        companyName:String,
        didInjectionHelp:String,
        injectionHelpDetail:String,
        fallsOrTrauma:Boolean,
        fallsTraumaDetail:String
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
        treatmentPlan: {
            type: [treatmentSchema],
    
        }
    }
});



module.exports = mongoose.model('FollowUp', followUpSchema);