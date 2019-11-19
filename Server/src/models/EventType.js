const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const EventTypeSchema = new mongoose.Schema(
  {
    name: {
      unique: true,
      type: String,
      require: true
    }
  },
  { versionKey: false }
);

EventTypeSchema.plugin(AutoIncrement, {
  inc_field: "idEventType",
  reference_value: "EventType"
});

module.exports = mongoose.model("EventType", EventTypeSchema);
