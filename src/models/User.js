const mongoose = require('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose)

const UserSchema = new mongoose.Schema(
  {
    username: {
      index: true,
      type: String,
      require: true
    },
    email: {
      //unique: true,
      index: true,
      //trim: true,
      type: String,
      required: true
      //lowercase: true
    },
    password: {
      type: String,
      required: true
      //select: false
    },
    birthdate: {
      type: Date,
      default: null
    },
    sex: {
      type: String,
      default: null
    }
  },
  { versionKey: false }
)

UserSchema.plugin(AutoIncrement, {
  inc_field: 'idUser',
  reference_value: 'User'
})

module.exports = mongoose.model('User', UserSchema)
