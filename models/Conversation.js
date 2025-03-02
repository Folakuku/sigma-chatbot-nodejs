const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  character: { type: mongoose.Schema.Types.ObjectId, ref: "Character" },
  messages: [
    {
      sender: String, // 'user' or 'character'
      content: String,
      timestamp: { type: Date, default: Date.now },
    },
  ],
});

module.exports = mongoose.model("Conversation", conversationSchema);
