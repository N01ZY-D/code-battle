const mongoose = require("mongoose");

const categoryOrderSchema = new mongoose.Schema({
  key: { type: String, default: "categoryOrder", unique: true },
  value: [{ type: String, required: true }],
});

module.exports = mongoose.model(
  "CategoryOrder",
  categoryOrderSchema,
  "settings"
);
