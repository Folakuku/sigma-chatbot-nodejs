const express = require("express");
const router = express.Router();
const Character = require("../models/Character");
const Conversation = require("../models/Conversation");
const { ensureAuthenticated } = require("../middleware");
const { ChatGroq } = require("@langchain/groq");
const { HumanMessage, SystemMessage } = require("@langchain/core/messages");

const model = new ChatGroq({
  model: "mixtral-8x7b-32768",
  temperature: 0,
});

router.get("/", ensureAuthenticated, async (req, res) => {
  console.log("Chats");
  const characters = await Character.find({
    $or: [{ creator: req.user._id }, { isPredefined: true }],
  });
  const conversations = await Conversation.find({ user: req.user._id }).populate(
    "character"
  );
  res.render("chat", { user: req.user, characters, conversations });
});

router.get("/create-character", ensureAuthenticated, (req, res) => {
  res.render("create-character", { user: req.user });
});

router.post("/create-character", ensureAuthenticated, async (req, res) => {
  const { name, personality } = req.body;
  const character = new Character({ name, personality, creator: req.user._id });
  await character.save();
  req.user.characters.push(character._id);
  await req.user.save();
  res.redirect("/chat");
});

router.post("/message", ensureAuthenticated, async (req, res) => {
  const { characterId, message } = req.body;

  let conversation = await Conversation.findOne({
    user: req.user._id,
    character: characterId,
  });
  if (!conversation) {
    conversation = new Conversation({
      user: req.user._id,
      character: characterId,
      messages: [],
    });
  }
  conversation.messages.push({ sender: "user", content: message });

  // Placeholder for AI response (LangChain integration would go here)
  const character = await Character.findById(characterId);

  const messages = [
    new SystemMessage(character.prompt_template),
    new HumanMessage(message),
  ];

  const aiResponse = await model.invoke(messages);
  console.log(aiResponse);

  conversation.messages.push({
    sender: "character",
    content: aiResponse.content,
  });

  await conversation.save();
  res.json({ messages: conversation.messages });
});

module.exports = router;
