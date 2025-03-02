const mongoose = require("mongoose");

const characterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  personality: String,
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  isPredefined: { type: Boolean, default: false },
});

module.exports = mongoose.model("Character", characterSchema);
