const mongoose = require("mongoose");
const { Schema } = mongoose;

const commentSchema = new Schema({
  taskId: { type: Schema.Types.ObjectId, ref: "Task", required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["public", "solution"], required: true },
  solutionId: { type: mongoose.Schema.Types.ObjectId, ref: "User.solutions" },
  solutionCode: {
    type: String,
    default: "",
  },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Comment", commentSchema);
