const mongoose = require('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose)

const MessageSchema = new mongoose.Schema(
   {
      participantId: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'Participant'
      },
      messageDate: {
         type: Date,
         required: true
      },
      message: {
         type: String,
         required: true
      }
   },
   { versionKey: false }
)

MessageSchema.plugin(AutoIncrement, {
   inc_field: 'idMessage',
   reference_value: 'Message'
})

module.exports = mongoose.model('Message', MessageSchema)
