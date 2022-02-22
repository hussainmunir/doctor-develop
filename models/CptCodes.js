const mongoose = require('mongoose')

const cptCodeSchema = new mongoose.Schema({
    Code: {
        type: String
    },
    SurgeryName: {
        type: String
    }
})

module.exports = mongoose.model('CptCodes', cptCodeSchema);