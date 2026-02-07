// =======================================
// ✅ Subscription + One Device System
// =======================================

let expiryKey = "chatbot_expiry";
let passKey = "chatbot_password";
let deviceKey = "chatbot_device";

// ✅ Generate One Device ID (Phone Lock)
function getDeviceId() {
  let id = localStorage.getItem(deviceKey);

  if (!id) {
    id = "DEV-" + Math.random().toString(36).substring(2, 12);
    localStorage.setItem(deviceKey, id);
  }

  return id;
}

// =======================================
// ✅ Setup Subscription
// =======================================

async function setupSubscription() {
  let storedPass = localStorage.getItem(passKey);
  let storedExpiry = localStorage.getItem(expiryKey);

  // 🔑 Ask Password Only First Time
  if (!storedPass) {
    let userPass = prompt("Enter Subscription Password provided by Admin:");

    if (!userPass) {
      alert("❌ Password required!");
      return;
    }

    localStorage.setItem(passKey, userPass);
    storedPass = userPass;
  }

  // ✅ Verify Password with Backend
  await verifySubscription();
}

// =======================================
// ✅ Verify Subscription via API
// =======================================

async function verifySubscription() {
  let password = localStorage.getItem(passKey);
  let deviceId = getDeviceId();

  try {
    let response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },

      // Send dummy message just to validate subscription
      body: JSON.stringify({
        message: "subscription-check",
        password: password,
        deviceId: deviceId
      })
    });

    let data = await response.json();

    // ❌ Invalid Password
    if (!response.ok) {
      alert(data.error);

      localStorage.removeItem(passKey);
      location.reload();
      return;
    }

    // ✅ Save Expiry from Backend
    if (data.expiry) {
      localStorage.setItem(expiryKey, data.expiry);
    }

    checkExpiry();

  } catch (err) {
    alert("❌ Server not responding. Try again later.");
  }
}

// =======================================
// ✅ Check Expiry + Disable Chatbot
// =======================================

function checkExpiry() {
  let expiryDate = new Date(localStorage.getItem(expiryKey));
  let today = new Date();

  let subBtn = document.getElementById("subBtn");

  let dd = String(expiryDate.getDate()).padStart(2, "0");
  let mm = String(expiryDate.getMonth() + 1).padStart(2, "0");
  let yyyy = expiryDate.getFullYear();

  subBtn.innerText = `EXP: ${dd}/${mm}/${yyyy}`;

  // ❌ Subscription Finished
  if (today > expiryDate) {
    document.getElementById("expiredBox").style.display = "block";

    document.querySelector(".send-btn").disabled = true;
    document.querySelector(".voice-btn").disabled = true;
    document.getElementById("userInput").disabled = true;
  }
}

// =======================================
// ✅ Auto Start Subscription Check
// =======================================

window.onload = setupSubscription;

// =======================================
// ✅ Chatbot Send Message Function
// =======================================

async function sendMessage() {
  let input = document.getElementById("userInput");
  let msg = input.value.trim();
  if (msg === "") return;

  let chatBox = document.getElementById("chatBox");

  // Show User Message
  chatBox.innerHTML += `
    <div class="msg user">${msg}</div>
  `;
  input.value = "";

  // Bot Placeholder
  let botDiv = document.createElement("div");
  botDiv.className = "msg bot";
  botDiv.innerHTML = "🤖 Thinking...";
  chatBox.appendChild(botDiv);

  // Subscription Data
  let password = localStorage.getItem(passKey);
  let deviceId = getDeviceId();

  try {
    let response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: msg,
        password: password,
        deviceId: deviceId
      })
    });

    let data = await response.json();

    // ❌ Error Handling
    if (!response.ok) {
      botDiv.innerHTML = `⚠️ ${data.error}`;
      return;
    }

    // ✅ Show Bot Reply + Buttons
    botDiv.innerHTML = `
      <p>${data.reply}</p>

      <div class="bot-links">
        <a href="${data.youtube}" target="_blank" class="yt-btn">
          📺 YouTube
        </a>

        <a href="${data.instagram}" target="_blank" class="insta-btn">
          📸 Instagram
        </a>
      </div>
    `;

  } catch (err) {
    botDiv.innerHTML = "❌ Server Error";
  }
}

// =======================================
// ✅ Voice Input Function
// =======================================

function startVoice() {

  if (!("webkitSpeechRecognition" in window)) {
    alert("❌ Voice input not supported in this browser.");
    return;
  }

  let recognition = new webkitSpeechRecognition();
  recognition.lang = "en-US";

  recognition.start();

  recognition.onresult = function (event) {
    document.getElementById("userInput").value =
      event.results[0][0].transcript;
  };

  recognition.onerror = function () {
    alert("⚠️ Voice input failed. Try again.");
  };
}

// =======================================
// ✅ Clear Chat Button
// =======================================

function clearChat() {
  document.getElementById("chatBox").innerHTML = "";
}
