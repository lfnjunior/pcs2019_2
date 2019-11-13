const mongoose = require('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose)

const MessageSchema = new mongoose.Schema(
   {
      /*
      participantId: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'User'
      },*/
      participantId: {
         type: Number
      },
      messageDate: {
         type: Date
      },
      message: {
         type: String
      }
   },
   { versionKey: false }
)

MessageSchema.plugin(AutoIncrement, {
   inc_field: 'idMessage',
   reference_value: 'Message'
})

module.exports = mongoose.model('Message', MessageSchema)
