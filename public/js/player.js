const socket = io()

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

socket.emit("join",{name,avatar})

// BUILD PLAYER UI (MOVED INSIDE JOIN)
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
}
})

socket.on("timeUp",()=>{
if(myTurn){
document.getElementById("status").innerText = "Too slow!"
}
})

// =========================
// WINNER
// =========================
socket.on("winner",(w)=>{

document.body.innerHTML = `
<h1>🏆 Winner</h1>
<h2>${w.name}</h2>
`

})
