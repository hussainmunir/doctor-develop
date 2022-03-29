const mongoose = require('mongoose');

const ddschema = new mongoose.Schema({
    code: {
        type: String,

    },
    desc: {
        type: String,

    }
})


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


const hpiProblemSchema = new mongoose.Schema({
    patientID: {
        type: String,
        // required: [true, 'Please add a referral object id of the patient']
    },
    patientName: {
        type: String,
    },
    dignosedBy: {
        type: String
    },
    companyName:{
        type:String,
    },
    doctorId: {
        type: String,
    },
    isChecked: {
        type: Boolean
    },
    fullBodyCoordinates: {
        type: [String],
        // required: [true, 'Please add the coordinates for full body 3d Model']
    },
    symptoms: {
        type: [String],
        // required: [true, 'Please add symptoms for the problem you mentioned in full body 3D model']
    },
    symptomsStarted: {
        type: String,
        // required: [true, 'Please add when did when symptoms started']
    },
    symptomsDevelop: {
        type: String,
        // required: [true, 'Please enter how did the symptoms develop'],
        // enum: ['gradually', 'suddenly']
    },
    injury: {
        isInjury: {
            type: Boolean,
            // required: [false, 'Please enter whether you have injury or not'],
            default: false
        },
        Details: {
            type: String,
            required: false
        }
    },
    symptomsDuration: {
        type: String,
        // required: [true, 'Please add the duration of symptoms']
    },
    symptomsAtBest: {
        type: String,
        // required: [true, 'Please enter symptoms at best']
    },
    symptomsAtWorst: {
        type: String,
        // required: [true, 'Please enter symptoms at worst']
    },
    symptomsRadiation: {
        isRadiate: {
            type: Boolean,
            // required: [true, 'Please enter the choice of radiation'],
            default: false
        },
        radiateAt: {
            type: [String],

        },
        radiateDetails: {
            type: String,

        }
    },
  
    aggravatingFactors: {
        type: [String],
        // required: [true, 'Please enter aggravating factors']
    },
    alleviatingFactors: {
        type: [String],
        // required: [true, 'Please enter alleviating factors']
    },
    previousTreatment: {
        isPreviousTreatment: {
            type: Boolean,
        },
        previousTreatmentInclude: {
            type: [String],

        },
        otherTreatments: {
            type: String,
            required: false,
        },
        physicalTherapy:{
            whenBegin:String,
            numberOfSession:String
        }

    },
    currentMedications: {
        type: [{
            name: String,
            dose: String,
            frequency: String,
            frequencyasneeded: String
        }],
        // required: [true, 'Please add current medications'],
    },
    createdAt: {
        type: String,
    },
    dignosis: {
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
        },
        roomNumber: String,
        castNumber: String,
        radiationDistribution: {
            type: [String],
            // required: [true, 'Please add where is the radiation distribution in radiation 3d model']
        },
        generalExam: {
            patientIs: [String],
            whoAppears: [String],
            has: [String],
            andIs: [String]

        },
        skin: [
            {
                name: String,
                location:String,
                size:String,
                description: String,
                skinPhotos: [String],
            }
        ],
        physicalExam: [
            {
                name: String,
                jointname: String,
                values: [String]
            }
        ],
        prescribedMedicine: {
            type: [String],

        },
        differentialDignosis: [ddschema],
        assessment: {
            type: String,

        },
        treatmentPlan: {
            type: [treatmentSchema],

        },
        surgeryRecommendedByDoctor: [surgicalSchema],
        specialTests: [specialTestSchema],
        diagnosticStudies: [diagnosticSchema],
        strength: [strengthSchema],
        reflexes: [reflexesSchema],
        rangeOfMotion: [String],
        physicalExamThreeDModal: [String],
        medicalEquipment: {
            type: [String],

        },
        suggestedFollowup: {
            type: String,
        },
        workDutyType: {
            type: String,
        },
        workDutyIncludes: {
            type: [String]
        },
        toThe: {
            type: String
        },
        toTheInclude: {
            type: [String]
        },
        greaterThan: {
            type: String
        },
        nextVisit: {
            type: String
        },
        date: String,
    },
    signature:[{
        publicId: {
            type: String,
        }},
      { eSignaturePhoto: {
            type: String,
        }},
        {isSignature: {
            type: Boolean,
        }}
        
    ],
    signature: {
        eSignaturePhotoUrl: String,
        public_id: String,
        date: String,
        isSignature:Boolean,
    },
    

});



module.exports = mongoose.model('Problem', hpiProblemSchema);