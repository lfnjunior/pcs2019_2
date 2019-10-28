const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const EventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    street: {
      type: String,
      required: true
    },
    neighborhood: {
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
    eventType: {
      required: true,
      type: mongoose.Schema.Types.ObjectId,
      ref: "EventType"
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    status: {
      type: Boolean,
      default: false
    }
  },
  { versionKey: false }
);

EventSchema.plugin(AutoIncrement, {
  inc_field: "idEvent",
  reference_value: "Event"
});

module.exports = mongoose.model("Event", EventSchema);
