const mongoose = require("mongoose")

const templateNoteSchema = new mongoose.Schema(
       
    {templateName: String,
     treatmentPlan: String,
     treatmentDetail: String,
     doctorId: String,
     },

)
const doctorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
   
    email: {
        type: String,
        required: true,
        match: [
            /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i,
            'Please add a valid email'
        ],
        unique: [true, 'This email already exists']
    },
    phone: {
        type: Number,
        required: true,
        match: [
            /^(\([0-9]{3}\) |[0-9]{3}-)[0-9]{3}-[0-9]{4}$/,
            'Please add a valid phone number.'
        ]
    },
    emergencyContact: {
        type: Number,
        required: true,
        match: [
            /^(\([0-9]{3}\) |[0-9]{3}-)[0-9]{3}-[0-9]{4}$/,
            'Please add a valid phone number.'
        ]

    },
    password: {
        type: String,
        required: true,
    },
    homeAddress: {
        type: String,
        required: true
    },
    npi: {
        type: String,
        required: [true, 'Please add your NPI']
    },
    dea: {
        type: String,
        required: [true, 'Please add your DEA']
    },
    designations:{
        type: String,

    },
    companyName:{
        type:String,
    },
    templateNotes: [templateNoteSchema],
    gender:{
        type:String,
    }
 
});

module.exports = mongoose.model('Doctor', doctorSchema);