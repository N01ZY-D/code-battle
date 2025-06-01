const mongoose = require("mongoose");
const { Schema } = mongoose;

const reportSchema = new Schema({
  reporterId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  targetType: {
    type: String,
    enum: ["task", "theory", "comment"],
    required: true,
  },
  targetId: { type: Schema.Types.ObjectId, required: true },
  reason: { type: String, required: true },
  status: {
    type: String,
    enum: ["open", "reviewed", "closed"],
    default: "open",
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Report", reportSchema);
