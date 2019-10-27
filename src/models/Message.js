const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const MessageSchema = new mongoose.Schema(
  {
    participant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    date: {
      type: Date
    },
    message: {
      type: String
    }
  },
  { versionKey: false }
);

MessageSchema.plugin(AutoIncrement, {
  inc_field: "idMessage",
  reference_value: "Message"
});

module.exports = mongoose.model("Message", MessageSchema);
