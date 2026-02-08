let expiryKey = "chatbot_expiry";

/* ✅ CLICK SOUND UNLOCK (Chrome Fix) */
let clickSound;

window.addEventListener(
  "click",
  () => {
    if (!clickSound) {
      clickSound = new Audio("/click.mp3");
      clickSound.volume = 1.0;
    }
  },
  { once: true }
);

/* ✅ Load Passwords */
async function loadPasswords() {
  let res = await fetch(REGISTRY_PATH);
  let data = await res.json();
  return data.validPasswords;
}

/* ✅ Subscription Setup */
async function setupSubscription() {
  let storedExpiry = localStorage.getItem(expiryKey);
  if (storedExpiry) {
    checkExpiry();
    return;
  }

  let entered = prompt("Enter TP Trial Password or SP Subscription Password:");
  if (!entered) {
    alert("Password Required!");
    return;
  }

  let valid = await loadPasswords();
  if (!valid.includes(entered)) {
    alert("❌ Invalid Password");
    return;
  }

  let days = entered.startsWith("SP") ? 30 : 7;

  let expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + days);
  localStorage.setItem(expiryKey, expiryDate.toISOString());

  alert(`✅ Activated for ${days} Days`);
  checkExpiry();
}

/* ✅ Check Expiry */
function checkExpiry() {
  let expiryDate = new Date(localStorage.getItem(expiryKey));
  let today = new Date();
  let subBtn = document.getElementById("subBtn");

  let dd = String(expiryDate.getDate()).padStart(2, "0");
  let mm = String(expiryDate.getMonth() + 1).padStart(2, "0");
  let yyyy = expiryDate.getFullYear();
  subBtn.innerText = `EXP: ${dd}/${mm}/${yyyy}`;

  if (today > expiryDate) {
    document.getElementById("expiredBox").style.display = "block";
    document.querySelector(".send-btn").disabled = true;
    document.querySelector(".voice-btn").disabled = true;
    document.getElementById("userInput").disabled = true;
    localStorage.removeItem(expiryKey);
  }
}

window.onload = setupSubscription;

/* ✅ SEND MESSAGE + SHOW 5 YT + 5 IG BUTTONS */
async function sendMessage() {
  let input = document.getElementById("userInput");
  let msg = input.value.trim();
  if (msg === "") return;

  let chatBox = document.getElementById("chatBox");

  // User Message
  chatBox.innerHTML += `<div class="msg user">${msg}</div>`;
  input.value = "";

  // Bot Placeholder
  let botDiv = document.createElement("div");
  botDiv.className = "msg bot";
  botDiv.innerHTML = "🤖 Thinking...";
  chatBox.appendChild(botDiv);

  try {
    let response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg }),
    });

    let data = await response.json();

    if (data.error) {
      botDiv.innerHTML = "❌ " + data.error;
      return;
    }

    let keyword = msg.split(" ")[0];

    botDiv.innerHTML = `
      <p>${data.reply.replace(/\n/g, "<br>")}</p>

      <div class="link-box">
        <h4>🎥 YouTube Videos</h4>

        <a target="_blank"
          href="https://www.youtube.com/results?search_query=${encodeURIComponent(msg)}">
          ▶ Watch ${keyword} Videos
        </a>

        <a target="_blank"
          href="https://www.youtube.com/results?search_query=${encodeURIComponent(keyword + " recipe")}">
          🍳 ${keyword} Recipe
        </a>

        <a target="_blank"
          href="https://www.youtube.com/results?search_query=${encodeURIComponent(keyword + " shorts")}">
          🎬 ${keyword} Shorts
        </a>

        <a target="_blank"
          href="https://www.youtube.com/results?search_query=${encodeURIComponent("hotel style " + keyword)}">
          🏨 Hotel Style ${keyword}
        </a>

        <a target="_blank"
          href="https://www.youtube.com/results?search_query=${encodeURIComponent(keyword)}">
          🔍 View All Results
        </a>
      </div>

      <div class="link-box">
        <h4>📷 Instagram Posts</h4>

        <a target="_blank"
          href="https://www.instagram.com/explore/tags/${keyword}/">
          #${keyword}
        </a>

        <a target="_blank"
          href="https://www.instagram.com/explore/tags/southindianfood/">
          #southindianfood
        </a>

        <a target="_blank"
          href="https://www.instagram.com/explore/tags/breakfastideas/">
          #breakfastideas
        </a>

        <a target="_blank"
          href="https://www.instagram.com/explore/tags/homemadefood/">
          #homemadefood
        </a>

        <a target="_blank"
          href="https://www.instagram.com/explore/search/keyword/?q=${keyword}">
          🔍 View More
        </a>
      </div>
    `;

    chatBox.scrollTop = chatBox.scrollHeight;
  } catch (err) {
    botDiv.innerHTML = "❌ Server Error";
  }
}

/* ✅ VOICE INPUT + CLICK SOUND */
function startVoice() {
  if (clickSound) {
    clickSound.currentTime = 0;
    clickSound.play();
  }

  if (!("webkitSpeechRecognition" in window)) {
    alert("Voice not supported");
    return;
  }

  let recognition = new webkitSpeechRecognition();
  recognition.lang = "en-US";
  recognition.start();

  recognition.onresult = function (e) {
    document.getElementById("userInput").value =
      e.results[0][0].transcript;
  };
}

/* ✅ CLEAR CHAT */
function clearChat() {
  document.getElementById("chatBox").innerHTML = "";
}
