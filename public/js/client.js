document.addEventListener("DOMContentLoaded", () => {
  const characterList = document.querySelectorAll(".character-list li");
  const messagesDiv = document.getElementById("messages");
  const messageForm = document.getElementById("message-form");
  const messageInput = document.getElementById("message-input");
  let selectedCharacterId = null;

  characterList.forEach((character) => {
    character.addEventListener("click", async () => {
      characterList.forEach((c) => c.classList.remove("active"));
      character.classList.add("active");
      selectedCharacterId = character.dataset.characterId;
      messagesDiv.innerHTML = "";

      // Fetch conversation
      const response = await fetch(
        `/chat/message?characterId=${selectedCharacterId}`,
        { method: "GET" }
      );
      const { messages } = await response.json();
      messages.forEach((msg) => appendMessage(msg.sender, msg.content));
    });
  });

  messageForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!selectedCharacterId) return alert("Please select a character");

    const message = messageInput.value;
    appendMessage("user", message);

    const response = await fetch("/chat/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ characterId: selectedCharacterId, message }),
    });
    const { messages } = await response.json();
    const aiMessage = messages[messages.length - 1];
    appendMessage("character", aiMessage.content);

    messageInput.value = "";
  });

  function appendMessage(sender, content) {
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("message", sender);
    msgDiv.textContent = content;
    messagesDiv.appendChild(msgDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }
});
