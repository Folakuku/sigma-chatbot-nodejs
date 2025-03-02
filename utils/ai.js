const { ChatGroq } = require("@langchain/groq");
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

const llm = new ChatGroq({
  model: "mixtral-8x7b-32768",
  temperature: 0.4,
});

// Define a new graph
const workflow = new StateGraph(MessagesAnnotation)
  // Define the node and edge
  .addNode("model", async (state) => {
    const response = await llm.invoke(state.messages);

    return { messages: response };
  })
  .addEdge(START, "model")
  .addEdge("model", END);

const memory = new MemorySaver();

const app = workflow.compile({ checkpointer: memory });

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
