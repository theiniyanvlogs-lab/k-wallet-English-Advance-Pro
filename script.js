// Manual password renewal system

let expiryKey="chatbot_expiry";

function setupSubscription(){
  let storedExpiry=localStorage.getItem(expiryKey);

  if(!storedExpiry){
    let userPass=prompt("Enter Subscription Password provided by Admin:");
    if(!userPass){
      alert("Password required!");
      return;
    }

    let expiryDate=new Date();
    expiryDate.setDate(expiryDate.getDate()+27);

    localStorage.setItem(expiryKey, expiryDate.toISOString());
    alert("✅ Subscription Activated!");
    storedExpiry=expiryDate.toISOString();
  }

  checkExpiry();
}

function checkExpiry(){
  let expiryDate=new Date(localStorage.getItem(expiryKey));
  let today=new Date();

  let subBtn=document.getElementById("subBtn");
  let dd=String(expiryDate.getDate()).padStart(2,"0");
  let mm=String(expiryDate.getMonth()+1).padStart(2,"0");
  let yyyy=expiryDate.getFullYear();
  subBtn.innerText=`EXP: ${dd}/${mm}/${yyyy}`;

  if(today>expiryDate){
    document.getElementById("expiredBox").style.display="block";
    document.querySelector(".send-btn").disabled=true;
    document.querySelector(".voice-btn").disabled=true;
    document.getElementById("userInput").disabled=true;
  }
}

window.onload=setupSubscription;

async function sendMessage(){
  let input=document.getElementById("userInput");
  let msg=input.value.trim();
  if(msg==="") return;

  let chatBox=document.getElementById("chatBox");
  chatBox.innerHTML+=`<div class="msg user">${msg}</div>`;
  input.value="";

  let botDiv=document.createElement("div");
  botDiv.className="msg bot";
  botDiv.innerHTML="🤖 Thinking...";
  chatBox.appendChild(botDiv);

  try{
    let response=await fetch("/api/chat",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({message:msg})
    });

    let data=await response.json();
    botDiv.innerHTML=`<p>${data.reply}</p>`;
  }catch(err){
    botDiv.innerHTML="❌ Server Error";
  }
}

function startVoice(){
  if(!("webkitSpeechRecognition" in window)){
    alert("Voice not supported");
    return;
  }
  let recognition=new webkitSpeechRecognition();
  recognition.lang="en-US";
  recognition.start();
  recognition.onresult=function(event){
    document.getElementById("userInput").value=event.results[0][0].transcript;
  };
}

function clearChat(){document.getElementById("chatBox").innerHTML="";}
