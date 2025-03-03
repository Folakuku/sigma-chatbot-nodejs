const express = require("express");
const router = express.Router();
const Character = require("../models/Character");
const Conversation = require("../models/Conversation");
const { ensureAuthenticated } = require("../middleware");
const { sendMessage, sendMessageWithTemplate } = require("../utils/ai");

router.get("/", ensureAuthenticated, async (req, res) => {
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
  const character = new Character({
    name,
    description: personality,
    creator: req.user._id,
  });
  await character.save();
  req.user.characters.push(character._id);
  await req.user.save();
  res.redirect("/chat");
});

router.post("/message", ensureAuthenticated, async (req, res) => {
  const { characterId, message } = req.body;

  let newConvo = false;
  let conversation = await Conversation.findOne({
    user: req.user._id,
    character: characterId,
  });
  if (!conversation) {
    newConvo = true;
    conversation = new Conversation({
      user: req.user._id,
      character: characterId,
      messages: [],
    });
  }
  conversation.messages.push({ sender: "user", content: message });

  const character = await Character.findById(characterId);

  let messages = [
    {
      role: "system",
      content: `Your name is ${character.name} and you are ${character.description}. Stay in character at all times`,
    },

    { role: "user", content: message },
  ];

  if (!newConvo) {
    messages.shift();
  }

  const { output, thread_id } = await sendMessage(
    messages,
    conversation.thread_id
  );

  // The output contains all messages in the state.
  // This will log the last message in the conversation.
  const aiResponse = output.messages[output.messages.length - 1];

  // console.log(aiResponse.content);

  conversation.messages.push({
    sender: "character",
    content: aiResponse.content,
  });

  conversation.thread_id = thread_id;

  await conversation.save();
  res.json({ messages: conversation.messages });
});

router.post("/template-message", ensureAuthenticated, async (req, res) => {
  const { characterId, message } = req.body;

  let conversation = await Conversation.findOne({
    user: req.user._id,
    character: characterId,
  });

  if (!conversation) {
    newConvo = true;
    conversation = new Conversation({
      user: req.user._id,
      character: characterId,
      messages: [],
    });
  }

  conversation.messages.push({ sender: "user", content: message });

  const character = await Character.findById(characterId);

  let messages = [{ role: "user", content: message }];

  const { output, thread_id } = await sendMessageWithTemplate(
    character,
    messages,
    conversation.thread_id
  );

  // The output contains all messages in the state.
  // This will log the last message in the conversation.
  const aiResponse = output.messages[output.messages.length - 1];

  conversation.messages.push({
    sender: "character",
    content: aiResponse.content,
  });

  conversation.thread_id = thread_id;

  await conversation.save();
  res.json({ messages: conversation.messages });
});

module.exports = router;
