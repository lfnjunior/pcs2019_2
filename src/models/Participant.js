const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const ParticipantSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event"
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    registrationDate: {
      type: Date,
      require: true
    }
  },
  { versionKey: false }
);

ParticipantSchema.plugin(AutoIncrement, {
  inc_field: "idParticipant",
  reference_value: "Participant"
});

module.exports = mongoose.model("Participant", ParticipantSchema);
