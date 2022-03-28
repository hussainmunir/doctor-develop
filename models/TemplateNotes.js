

    const mongoose = require('mongoose')



    const templateNoteSchema = new mongoose.Schema(
       
           {templateName: String,
            treatmentPlan: String,
            treatmentDetail: String,
            doctorId: String,
            },
    
    )

const templateNotes = new mongoose.Schema({
    templateNotes: [templateNoteSchema]
        
})

module.exports = mongoose.model('TemplateNotes', templateNotes);