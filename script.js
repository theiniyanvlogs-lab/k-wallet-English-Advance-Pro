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
/* ✅ ULTRA KEYWORD EXTRACTOR (2026 PERFECT FIX) */
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
/* ✅ SMART CATEGORY DETECTOR (2026 PREMIUM MODE) */
/* ===================================================== */
function detectCategory(msg) {
  msg = msg.toLowerCase();

  if (
    msg.includes("recipe") ||
    msg.includes("prepare") ||
    msg.includes("cook") ||
    msg.includes("how to make")
  ) return "food";

  if (
    msg.includes("state") ||
    msg.includes("capital") ||
    msg.includes("district") ||
    msg.includes("tourism") ||
    msg.includes("where is")
  ) return "place";

  if (
    msg.includes("who is") ||
    msg.includes("biography") ||
    msg.includes("actor") ||
    msg.includes("leader")
  ) return "person";

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

  if (!entered) {
    alert("Password Required! Please get password from WhatsApp.");
    return;
  }

  let valid = await loadPasswords();

  if (!valid.includes(entered)) {
    alert("❌ Invalid Password. Please request correct password in WhatsApp.");
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
/* ✅ PREMIUM TAMIL TRANSLATOR (NO SKIP NAMES) */
/* ===================================================== */
async function translateTamil(btn) {
  let tamilBox = btn.nextElementSibling;
  tamilBox.innerHTML = "⏳ Translating...";

  let englishText = btn.getAttribute("data-text");

  try {
    let response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message:
          "Translate the following English text into Tamil EXACTLY.\n\n" +
          "Rules:\n" +
          "- Do not skip any words\n" +
          "- Keep names like Tamil, Telugu, Hindi, Malayalam unchanged\n" +
          "- Do not summarize\n" +
          "- Only translate exactly\n\n" +
          "Text:\n" +
          englishText,
      }),
    });

    let data = await response.json();

    tamilBox.innerHTML = `
      <div class="msg tamil">
        ${data.reply.replace(/\n/g, "<br>")}
      </div>
    `;

    btn.disabled = true;
    btn.innerText = "✅ Tamil Shown";
  } catch (err) {
    tamilBox.innerHTML = "❌ Translation Failed";
  }
}

/* ===================================================== */
/* ✅ SEND MESSAGE + ULTRA PREMIUM SMART LINKS */
/* ===================================================== */
async function sendMessage() {
  let input = document.getElementById("userInput");
  let msg = input.value.trim();
  if (msg === "") return;

  /* ✅ Send Button Click Sound */
  if (clickSound) {
    clickSound.currentTime = 0;
    clickSound.play();
  }

  let chatBox = document.getElementById("chatBox");

  chatBox.innerHTML += `<div class="msg user">${msg}</div>`;
  input.value = "";

  let botDiv = document.createElement("div");
  botDiv.className = "msg bot";

  /* Typing Animation */
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
    if (data.error) {
      botDiv.innerHTML = "❌ " + data.error;
      return;
    }

    let englishReply = data.reply;
    let keyword = extractKeyword(msg);
    let category = detectCategory(msg);

    /* ✅ SMART YOUTUBE QUERIES */
    let q1, q2, q3, q4, q5;

    if (category === "food") {
      q1 = msg + " recipe";
      q2 = msg + " step by step";
      q3 = msg + " hotel style";
      q4 = msg + " tips";
      q5 = msg + " cooking video";
    } else if (category === "place") {
      q1 = msg + " tourism";
      q2 = msg + " famous places";
      q3 = msg + " travel guide";
      q4 = msg + " culture";
      q5 = msg + " map";
    } else if (category === "person") {
      q1 = msg + " biography";
      q2 = msg + " interview";
      q3 = msg + " achievements";
      q4 = msg + " life story";
      q5 = msg + " latest news";
    } else {
      q1 = msg + " explained";
      q2 = msg + " tutorial";
      q3 = msg + " examples";
      q4 = msg + " details";
      q5 = msg + " information";
    }

    /* ✅ SMART INSTAGRAM TAGS */
    let ig1, ig2, ig3, ig4, ig5;

    if (category === "food") {
      ig1 = keyword;
      ig2 = keyword + "recipe";
      ig3 = keyword + "food";
      ig4 = keyword + "cooking";
      ig5 = keyword + "homemade";
    } else if (category === "place") {
      ig1 = keyword;
      ig2 = keyword + "tourism";
      ig3 = keyword + "travel";
      ig4 = keyword + "culture";
      ig5 = keyword + "explore";
    } else if (category === "person") {
      ig1 = keyword;
      ig2 = keyword + "biography";
      ig3 = keyword + "life";
      ig4 = keyword + "legend";
      ig5 = keyword + "inspiration";
    } else {
      ig1 = keyword;
      ig2 = keyword + "facts";
      ig3 = keyword + "info";
      ig4 = keyword + "knowledge";
      ig5 = keyword + "trending";
    }

    /* ✅ Final Output */
    botDiv.innerHTML = `
      <p>${englishReply.replace(/\n/g, "<br>")}</p>

      <button class="tamil-btn"
        data-text="${englishReply.replace(/"/g, "&quot;")}"
        onclick="translateTamil(this)">
        🌐 Tamil Want? Click Here
      </button>

      <div class="tamil-output"></div>

      <div class="link-box">
        <h4>🎥 YouTube Links</h4>
        <a target="_blank" href="https://www.youtube.com/results?search_query=${encodeURIComponent(q1)}">▶ ${q1}</a>
        <a target="_blank" href="https://www.youtube.com/results?search_query=${encodeURIComponent(q2)}">📌 ${q2}</a>
        <a target="_blank" href="https://www.youtube.com/results?search_query=${encodeURIComponent(q3)}">⭐ ${q3}</a>
        <a target="_blank" href="https://www.youtube.com/results?search_query=${encodeURIComponent(q4)}">🔥 ${q4}</a>
        <a target="_blank" href="https://www.youtube.com/results?search_query=${encodeURIComponent(q5)}">🎬 ${q5}</a>
      </div>

      <div class="link-box">
        <h4>📷 Instagram Tags</h4>
        <a target="_blank" href="https://www.instagram.com/explore/tags/${ig1}/">#${ig1}</a>
        <a target="_blank" href="https://www.instagram.com/explore/tags/${ig2}/">#${ig2}</a>
        <a target="_blank" href="https://www.instagram.com/explore/tags/${ig3}/">#${ig3}</a>
        <a target="_blank" href="https://www.instagram.com/explore/tags/${ig4}/">#${ig4}</a>
        <a target="_blank" href="https://www.instagram.com/explore/tags/${ig5}/">#${ig5}</a>
      </div>
    `;

    /* ✅ Reply Sound */
    if (replySound) {
      replySound.currentTime = 0;
      replySound.play();
    }

    chatBox.scrollTop = chatBox.scrollHeight;

  } catch (err) {
    botDiv.innerHTML = "❌ Server Error";
  }
}

/* ===================================================== */
/* ✅ VOICE INPUT + MIC SOUND */
/* ===================================================== */
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

/* ===================================================== */
/* ✅ CLEAR CHAT */
/* ===================================================== */
function clearChat() {
  document.getElementById("chatBox").innerHTML = "";
}
