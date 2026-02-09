let expiryKey = "chatbot_expiry";

/* ✅ CLICK + REPLY SOUND */
let clickSound;
let replySound;

/* ✅ Unlock Sounds After First Click (Chrome Policy Fix) */
window.addEventListener(
  "click",
  () => {
    if (!clickSound) {
      clickSound = new Audio("/click.mp3");
      clickSound.volume = 1.0;
    }

    if (!replySound) {
      replySound = new Audio("/reply.mp3");
      replySound.volume = 1.0;
    }
  },
  { once: true }
);

/* ===================================================== */
/* ✅ SAFE HTML ESCAPE (Fix Broken Quotes) */
/* ===================================================== */
function escapeHTML(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* ===================================================== */
/* ✅ ULTRA KEYWORD EXTRACTOR */
/* ===================================================== */
function extractKeyword(msg) {
  let stopWords = [
    "how","to","prepare","make","cook","recipe",
    "is","are","the","a","an","please","tell",
    "me","about","where","they","living","live"
  ];

  let cleaned = msg.toLowerCase().replace(/[^\w\s]/g, "");
  let words = cleaned.split(" ");
  let filtered = words.filter((w) => !stopWords.includes(w));

  return filtered.length > 0 ? filtered[0] : msg;
}

/* ===================================================== */
/* ✅ SMART CATEGORY DETECTOR */
/* ===================================================== */
function detectCategory(msg) {
  msg = msg.toLowerCase();

  if (msg.includes("recipe") || msg.includes("cook")) return "food";
  if (msg.includes("capital") || msg.includes("tourism")) return "place";
  if (msg.includes("who is") || msg.includes("actor")) return "person";

  return "general";
}

/* ===================================================== */
/* ✅ LOAD PASSWORDS */
/* ===================================================== */
async function loadPasswords() {
  let res = await fetch(REGISTRY_PATH);
  let data = await res.json();
  return data.validPasswords;
}

/* ===================================================== */
/* ✅ SUBSCRIPTION SETUP */
/* ===================================================== */
async function setupSubscription() {
  let storedExpiry = localStorage.getItem(expiryKey);

  if (storedExpiry) {
    checkExpiry();
    return;
  }

  document.getElementById("expiredBox").style.display = "block";

  let entered = prompt(
    "🔑 Enter TP Trial Password (7 Days) or SP Subscription Password (30 Days):"
  );

  if (!entered) return alert("Password Required!");

  let valid = await loadPasswords();

  if (!valid.includes(entered)) {
    alert("❌ Invalid Password.");
    return;
  }

  document.getElementById("expiredBox").style.display = "none";

  let days = entered.startsWith("SP") ? 30 : 7;

  let expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + days);

  localStorage.setItem(expiryKey, expiryDate.toISOString());

  alert(`✅ Activated Successfully for ${days} Days`);
  checkExpiry();
}

/* ===================================================== */
/* ✅ CHECK EXPIRY */
/* ===================================================== */
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

/* ===================================================== */
/* ✅ PREMIUM TAMIL TRANSLATOR (2026 FIXED OUTPUT) */
/* ===================================================== */
async function translateTamil(btn) {

  let msgBox = btn.closest(".msg.bot");
  let tamilBox = msgBox.querySelector(".tamil-output");

  tamilBox.innerHTML = "⏳ Translating...";

  let englishText = btn.getAttribute("data-text");

  btn.disabled = true;

  try {
    let response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message:
          "Translate the following English text into NATURAL Tamil.\n\n" +
          "Rules:\n" +
          "- Do not change names (Coffee, Tamil, Hindi)\n" +
          "- Keep meaning accurate\n" +
          "- Write clean spoken Tamil\n" +
          "- No weird words\n\n" +
          englishText,
      }),
    });

    let data = await response.json();

    tamilBox.innerHTML = `
      <div class="msg tamil">
        ${data.reply.replace(/\n/g, "<br>")}
      </div>
    `;

    btn.innerText = "✅ Tamil Shown";

  } catch (err) {
    tamilBox.innerHTML = "❌ Translation Failed";
    btn.disabled = false;
    btn.innerText = "🌐 Tamil Want? Click Here";
  }
}

/* ===================================================== */
/* ✅ SEND MESSAGE */
/* ===================================================== */
async function sendMessage() {

  let input = document.getElementById("userInput");
  let msg = input.value.trim();
  if (msg === "") return;

  if (clickSound) clickSound.play();

  let chatBox = document.getElementById("chatBox");

  chatBox.innerHTML += `<div class="msg user">${escapeHTML(msg)}</div>`;
  input.value = "";

  let botDiv = document.createElement("div");
  botDiv.className = "msg bot";

  botDiv.innerHTML = `
    <div class="typing">
      <span></span><span></span><span></span>
    </div>
  `;

  chatBox.appendChild(botDiv);
  chatBox.scrollTop = chatBox.scrollHeight;

  try {
    let response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg }),
    });

    let data = await response.json();
    let englishReply = data.reply;

    let keyword = extractKeyword(msg);
    let category = detectCategory(msg);

    /* Smart Queries */
    let q1 = msg + " explained";
    let q2 = msg + " tutorial";
    let q3 = msg + " details";

    /* Final Bot Output */
    botDiv.innerHTML = `
      <div class="text">${englishReply.replace(/\n/g, "<br>")}</div>

      <button class="tamil-btn"
        data-text="${escapeHTML(englishReply)}"
        onclick="translateTamil(this)">
        🌐 Tamil Want? Click Here
      </button>

      <div class="tamil-output"></div>

      <div class="link-box">
        <h4>🎥 YouTube Search</h4>
        <a target="_blank" href="https://www.youtube.com/results?search_query=${encodeURIComponent(q1)}">▶ ${q1}</a>
        <a target="_blank" href="https://www.youtube.com/results?search_query=${encodeURIComponent(q2)}">📌 ${q2}</a>
        <a target="_blank" href="https://www.youtube.com/results?search_query=${encodeURIComponent(q3)}">⭐ ${q3}</a>
      </div>
    `;

    if (replySound) replySound.play();

    chatBox.scrollTop = chatBox.scrollHeight;

  } catch (err) {
    botDiv.innerHTML = "❌ Server Error";
  }
}

/* ===================================================== */
/* ✅ VOICE INPUT + MIC GLOW */
/* ===================================================== */
function startVoice() {

  if (!("webkitSpeechRecognition" in window)) {
    alert("Voice not supported");
    return;
  }

  let micBtn = document.querySelector(".voice-btn");
  micBtn.classList.add("listening");

  let recognition = new webkitSpeechRecognition();
  recognition.lang = "en-US";
  recognition.start();

  recognition.onresult = function (e) {
    document.getElementById("userInput").value =
      e.results[0][0].transcript;
  };

  recognition.onend = function () {
    micBtn.classList.remove("listening");
  };
}

/* ===================================================== */
/* ✅ CLEAR CHAT */
/* ===================================================== */
function clearChat() {
  document.getElementById("chatBox").innerHTML = "";
}
