const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const EventSchema = new mongoose.Schema(
  {
    title: {
      unique: true,
      type: String,
      require: true
    },
    startDate: {
      type: Date,
      require: true,
      default: null
    },
    endtDate: {
      type: Date,
      require: true,
      default: null
    },
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    referencePoint: {
      type: String,
      default: null
    },
    description: {
      type: String,
      default: null
    },
    status: {
      type: String,
      default: null
    },
    eventType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EventType"
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { versionKey: false }
);

EventSchema.plugin(AutoIncrement, {
  inc_field: "idEvent",
  reference_value: "Event"
});

module.exports = mongoose.model("Event", EventSchema);
