const chatWindow = document.getElementById("chat-window");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const toneSelect = document.getElementById("tone");
const rippleOverlay = document.getElementById("ripple-overlay");

// Load memory from localStorage or initialize empty array
let memory = JSON.parse(localStorage.getItem("chatMemory")) || [];
let recentTopics = JSON.parse(localStorage.getItem("recentTopics")) || [];

const toneInstructions = {
  friendly: "You are a friendly and positive advice-giving assistant.",
  professional: "You are a formal, concise, and professional advice assistant.",
  funny: "You are a humorous assistant that gives advice with a touch of comedy.",
  motivational: "You are a deeply motivational coach that inspires and uplifts."
};

// Show previous messages on load
// Do not display previous messages on load

// Event listeners
sendBtn.addEventListener("click", handleSend);
userInput.addEventListener("keydown", e => {
  if (e.key === "Enter") handleSend();
});

toneSelect.addEventListener("change", () => {
  // Ripple animation
  rippleOverlay.classList.add("ripple-show");
  rippleOverlay.addEventListener("animationend", () => {
    rippleOverlay.classList.remove("ripple-show");
  }, { once: true });
});

async function handleSend() {
  const msg = userInput.value.trim();
  if (!msg) return;

  appendMessage("user", msg);
  memory.push({ sender: "user", message: msg });

  userInput.value = "";

  appendMessage("bot", "Typing...", true);

  if (!recentTopics.includes(msg)) {
    recentTopics.push(msg);
    if (recentTopics.length > 5) recentTopics.shift();
    localStorage.setItem("recentTopics", JSON.stringify(recentTopics));
  }

  const response = await generateAdvice(msg);

  // Remove typing message
  const lastChild = chatWindow.lastChild;
  if (lastChild && lastChild.classList.contains("typing")) {
    chatWindow.removeChild(lastChild);
  }

  appendMessage("bot", response);
  memory.push({ sender: "bot", message: response });

  localStorage.setItem("chatMemory", JSON.stringify(memory));
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

  if (isTyping) {
    msgDiv.classList.add("typing");
  }

  chatWindow.appendChild(msgDiv);
  chatWindow.scrollTo({ top: chatWindow.scrollHeight, behavior: 'smooth' });
}

async function generateAdvice(userMessage) {
  const tone = toneSelect.value;
  const userName = localStorage.getItem("userName") || "friend";
  const topicMemory = recentTopics.join(" | ");

  const messages = [
    {
      role: "system",
      content: `${toneInstructions[tone]} Your user is ${userName}. Keep replies brief, ideally under 30 words. Recent topics: ${topicMemory}`
    },
    {
      role: "user",
      content: userMessage
    }
  ];

  try {
  const response = await fetch("/api/advice", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages: messages
      })
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

localStorage.removeItem("chatMemory");
