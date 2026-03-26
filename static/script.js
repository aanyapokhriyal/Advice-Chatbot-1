const chatWindow = document.getElementById("chat-window");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const toneSelect = document.getElementById("tone");

let memory = JSON.parse(localStorage.getItem("chatMemory")) || [];
let recentTopics = JSON.parse(localStorage.getItem("recentTopics")) || [];

const toneInstructions = {
  friendly: "You are a friendly and positive advice-giving assistant.",
  professional: "You are a formal, concise, and professional advice assistant.",
  funny: "You are a humorous assistant that gives advice with a touch of comedy.",
  motivational: "You are a deeply motivational coach that inspires and uplifts."
};

const DEFAULT_MODEL = "llama-3.3-70b-versatile";
const MAX_MEMORY = 50;
const MAX_MSG_LENGTH = 500;

sendBtn.addEventListener("click", handleSend);
userInput.addEventListener("keydown", e => { if (e.key === "Enter") handleSend(); });

toneSelect.addEventListener("change", () => {
  // Optional: add tone-change logic here
});

async function handleSend() {
  const msg = userInput.value.trim();
  if (!msg) return;

  if (msg.length > MAX_MSG_LENGTH) {
    alert(`Message too long! Please keep it under ${MAX_MSG_LENGTH} characters.`);
    return;
  }

  sendBtn.disabled = true;
  userInput.disabled = true;

  appendMessage("user", msg);
  memory.push({ sender: "user", message: msg });
  userInput.value = "";
  appendMessage("bot", "Typing...", true);

  if (!recentTopics.includes(msg)) {
    recentTopics.push(msg);
    if (recentTopics.length > 5) recentTopics.shift();
    localStorage.setItem("recentTopics", JSON.stringify(recentTopics));
  }

  let response;
  try {
    response = await generateAdvice(msg);
  } catch (err) {
    response = "Sorry, something went wrong. Please try again.";
  } finally {
    const lastChild = chatWindow.lastChild;
    if (lastChild && lastChild.classList.contains("typing")) {
      chatWindow.removeChild(lastChild);
    }
  }

  appendMessage("bot", response);
  memory.push({ sender: "bot", message: response });

  if (memory.length > MAX_MEMORY) {
    memory = memory.slice(-MAX_MEMORY);
  }

  localStorage.setItem("chatMemory", JSON.stringify(memory));

  sendBtn.disabled = false;
  userInput.disabled = false;
  userInput.focus();
}

function appendMessage(sender, message, isTyping = false) {
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("message-box");

  if (sender === "user") {
    msgDiv.classList.add("user-message");
  } else {
    const tone = toneSelect.value;
    msgDiv.classList.add("bot-message", `bot-${tone}`);
  }

  msgDiv.textContent = message;
  if (isTyping) msgDiv.classList.add("typing");

  chatWindow.appendChild(msgDiv);
  chatWindow.scrollTo({ top: chatWindow.scrollHeight, behavior: "smooth" });
}

async function generateAdvice(userMessage) {
  const tone = toneSelect.value;
  const topicMemory = recentTopics.join(" | ");

  const messages = [
    {
      role: "system",
      content: `${toneInstructions[tone]} Keep replies brief, ideally under 80 words. Recent topics: ${topicMemory}`
    },
    ...memory.map(m => ({
      role: m.sender === "user" ? "user" : "assistant",
      content: m.message
    })),
    { role: "user", content: userMessage }
  ];

  try {
    const response = await fetch("/api/advice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: DEFAULT_MODEL, messages })
    });

    const data = await response.json();

    if (data.error) {
      console.error("Groq Error:", data.error);
      return "Sorry, something went wrong: " + data.error.message;
    }

    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error("Fetch Error:", error);
    return "Sorry, I couldn't connect to the advice server.";
  }
}