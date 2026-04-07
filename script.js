/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");
const latestQuestionText = document.getElementById("latestQuestionText");
const workerUrl = "https://loreal-chat-worker.roland-okungbowa1.workers.dev/";

// Set initial message
chatWindow.textContent = "";

function addMessage(text, role) {
  const msgGroup = document.createElement("div");
  msgGroup.className = `msg-group ${role}`;

  const msgLabel = document.createElement("p");
  msgLabel.className = "msg-label";
  msgLabel.textContent = role === "user" ? "User" : "Lo";

  const msg = document.createElement("div");
  msg.className = `msg ${role}`;
  msg.textContent = text;

  msgGroup.appendChild(msgLabel);
  msgGroup.appendChild(msg);
  chatWindow.appendChild(msgGroup);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

addMessage("👋 Hello! How can I help you today?", "ai");

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const prompt = userInput.value.trim();
  if (!prompt) {
    return;
  }

  latestQuestionText.textContent = prompt;
  addMessage(prompt, "user");
  userInput.value = "";

  try {
    const response = await fetch(workerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content:
              "You are a L'Oreal beauty assistant. Only answer questions about L'Oreal products, beauty routines, and product recommendations. If a request is unrelated to L'Oreal beauty topics, politely refuse and ask the user to ask about L'Oreal skincare, makeup, haircare, or fragrance.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      const errorMessage =
        data?.error?.message || `Request failed: ${response.status}`;
      throw new Error(errorMessage);
    }

    if (data?.error?.message) {
      throw new Error(data.error.message);
    }

    const aiReply = data?.choices?.[0]?.message?.content;
    if (!aiReply) {
      throw new Error("No reply content returned by the API.");
    }

    addMessage(aiReply, "ai");
  } catch (error) {
    const fallbackMessage = "Sorry, something went wrong. Please try again.";
    const userFriendlyError = error?.message || fallbackMessage;
    addMessage(userFriendlyError, "ai");
    console.error("Cloudflare Worker request error:", error);
  }
});
