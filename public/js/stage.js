const socket = io()

const playersDiv = document.getElementById("players")
const questionDiv = document.getElementById("question")
const answersDiv = document.getElementById("answers")

let players = []
let currentTurn = null

// PLAYERS
socket.on("players",(p)=>{

players = p
renderPlayers()

})

// TURN
socket.on("turn",(id)=>{
currentTurn = id
renderPlayers()
})

// RENDER FUNCTION (IMPORTANT)
function renderPlayers(){

playersDiv.innerHTML = ""

players.forEach(player=>{

let el = document.createElement("div")
el.className = "player"

if(player.eliminated){
el.classList.add("out")
}

if(player.id === currentTurn){
el.classList.add("active")
}

el.innerHTML = `
<div style="font-size:30px">${player.avatar || "🙂"}</div>
<div class="name">${player.name}</div>
<div class="lives">${"●".repeat(player.lives)}</div>
`

playersDiv.appendChild(el)

})

}

// QUESTION
socket.on("question",(q)=>{

questionDiv.innerText = q.question

answersDiv.innerHTML = `
<div class="answer">A ${q.A}</div>
<div class="answer">B ${q.B}</div>
<div class="answer">C ${q.C}</div>
<div class="answer">D ${q.D}</div>
`

})

// TIMER
socket.on("timer",(t)=>{
document.getElementById("timer").innerText = t
})

socket.on("timeUp",()=>{
document.getElementById("timer").innerText = "TIME!"
})

// WINNER
socket.on("winner",(w)=>{
document.body.innerHTML = `
<h1>🏆 WINNER</h1>
<h2>${w.name}</h2>
`
})