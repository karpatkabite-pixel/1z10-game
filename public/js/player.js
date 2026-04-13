const socket = io()

// =========================
// SOUNDS
// =========================
const sounds = {
bg: new Audio("sounds/bg.mp3"),
click: new Audio("sounds/click.mp3"),
tick: new Audio("sounds/tick.mp3"),
wrong: new Audio("sounds/wrong.mp3")
}

sounds.bg.loop = true
sounds.bg.volume = 0.3

let myTurn = false
let players = []

// =========================
// JOIN
// =========================
window.join = function(){

let name = document.getElementById("name").value
let avatar = document.getElementById("avatar").value

if(!name){
alert("Enter your name!")
return
}

if(!avatar){
alert("Choose an avatar!")
return
}

// start music (user interaction required)
sounds.bg.play().catch(()=>{})

socket.emit("join",{name,avatar})

// BUILD UI
document.body.innerHTML = `

<div class="player-ui">

<div id="status" class="status">Waiting for your turn...</div>

<div class="answers-player">

<button class="btn a" onclick="send('A')">A</button>
<button class="btn b" onclick="send('B')">B</button>
<button class="btn c" onclick="send('C')">C</button>
<button class="btn d" onclick="send('D')">D</button>

</div>

<div id="passList" class="pass-list"></div>

<button class="pass-btn" onclick="togglePass()">PASS</button>

</div>

`

}

// =========================
// SEND ANSWER
// =========================
window.send = function(a){

if(!myTurn) return

// 🔊 click sound
sounds.click.currentTime = 0
sounds.click.play()

// 📳 vibration (optional)
if(navigator.vibrate){
navigator.vibrate(100)
}

document.getElementById("status").innerText = "Answer sent!"

socket.emit("answer",a)

}

// =========================
// PASS MENU
// =========================
window.togglePass = function(){

if(!myTurn) return

let list = document.getElementById("passList")

if(list.innerHTML === ""){

list.innerHTML = players
.filter(p => !p.eliminated && p.id !== socket.id)
.map(p => `
<div class="pass-option" onclick="passTo('${p.id}')">
<img src="${p.avatar}" width="30"> ${p.name}
</div>
`).join("")

}else{
list.innerHTML = ""
}

}

// =========================
// PASS TO PLAYER
// =========================
window.passTo = function(id){

socket.emit("pass",id)

document.getElementById("status").innerText = "Passed!"

document.getElementById("passList").innerHTML = ""

}

// =========================
// RECEIVE PLAYERS
// =========================
socket.on("players",(p)=>{
players = p
})

// =========================
// TURN SYSTEM
// =========================
socket.on("turn",(id)=>{

myTurn = (id === socket.id)

let status = document.getElementById("status")

if(status){
status.innerText = myTurn ? "YOUR TURN!" : "Waiting..."
}

document.querySelectorAll(".btn").forEach(btn=>{
btn.disabled = !myTurn
})

})

// =========================
// TIMER
// =========================
socket.on("timer",(t)=>{
if(myTurn){

document.getElementById("status").innerText = "Time: " + t

// 🔊 tick sound
sounds.tick.currentTime = 0
sounds.tick.play()

}
})

// =========================
// TIME UP
// =========================
socket.on("timeUp",()=>{
if(myTurn){
document.getElementById("status").innerText = "Too slow!"
sounds.wrong.currentTime = 0
sounds.wrong.play()
}
})

// =========================
// WINNER
// =========================
socket.on("winner",(w)=>{

sounds.bg.pause()

document.body.innerHTML = `
<h1>🏆 Winner</h1>
<h2>${w.name}</h2>
`

})
