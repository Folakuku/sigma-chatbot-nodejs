const { ChatGroq } = require("@langchain/groq");
const { ChatPromptTemplate } = require("@langchain/core/prompts");
const {
  HumanMessage,
  SystemMessage,
  AIMessage,
} = require("@langchain/core/messages");
const {
  START,
  END,
  StateGraph,
  MemorySaver,
  MessagesAnnotation,
} = require("@langchain/langgraph");
const uuidv4 = require("uuid").v4;

// Create LLM
const llm = new ChatGroq({
  model: "mixtral-8x7b-32768",
  temperature: 0.4,
});

// Without Template implementation
const callModel = async (state) => {
  const response = await llm.invoke(state.messages);

  return { messages: response };
};

// Define a new graph
const workflow = new StateGraph(MessagesAnnotation)
  // Define the node and edge
  .addNode("model", callModel)
  .addEdge(START, "model")
  .addEdge("model", END);

const app = workflow.compile({ checkpointer: new MemorySaver() });

//Template

// Send Message without Prompt Template
exports.sendMessage = async (messages, threadId) => {
  const thread_id = threadId || uuidv4();
  const config = { configurable: { thread_id } };

  const formattedMessages = messages.map((msg) =>
    msg.role === "system"
      ? new SystemMessage(msg.content)
      : msg.role === "user"
      ? new HumanMessage(msg.content)
      : new AIMessage(msg.content)
  );

  const output = await app.invoke({ messages: formattedMessages }, config);
  return { output, thread_id };
};

// Send Message with Prompt Template
exports.sendMessageWithTemplate = async (character, singleMessage, threadId) => {
  const thread_id = threadId || uuidv4();
  const config = { configurable: { thread_id } };

  const promptTemplate = ChatPromptTemplate.fromMessages([
    [
      "system",
      `Your name is ${character.name} and you are ${character.description}, Stay in character at all times`,
    ],
    ["placeholder", "{messages}"],
  ]);

  const callModel2 = async (state) => {
    const prompt = await promptTemplate.invoke(state);
    const response = await llm.invoke(prompt);
    // Update message history with response:
    return { messages: [response] };
  };

  const workflow2 = new StateGraph(MessagesAnnotation)
    // Define the (single) node in the graph
    .addNode("model", callModel2)
    .addEdge(START, "model")
    .addEdge("model", END);
  const app2 = workflow2.compile({ checkpointer: new MemorySaver() });

  const output = await app2.invoke({ messages: singleMessage }, config);
  console.log(output);
  return { output, thread_id };
};
