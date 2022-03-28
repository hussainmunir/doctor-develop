const TemplateNotes = require('../models/TemplateNotes.js');

exports.setTamplate = async (req, res, next) => {
    try {
      const templatenotes = new TemplateNotes({
        templateNotes:req.body.templateNotes
      })
  
      const result = await templatenotes.save();
      res.status(200).json({
        success: true,
        data: result
      });
  
    } catch (err) {
      next(new ErrorResponse(err.message, 500))
    }
  }