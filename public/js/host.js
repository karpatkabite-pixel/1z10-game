const socket = io()

let players = []
let currentTurn = null

// NEXT QUESTION
window.next = function(){
socket.emit("nextQuestion")
}

// RECEIVE PLAYERS
socket.on("players",(p)=>{
players = p
render()
})

// RECEIVE TURN
socket.on("turn",(id)=>{
currentTurn = id
render()
})

// RENDER FUNCTION
function render(){

let div = document.getElementById("players")
let turnDiv = document.getElementById("turn")

div.innerHTML = ""

// find current player name
let currentPlayer = players.find(p => p.id === currentTurn)

turnDiv.innerText = currentPlayer
? "🎯 Current: " + currentPlayer.name
: "No active player"

players.forEach(p=>{

let el = document.createElement("div")
el.className = "host-player"

if(p.eliminated){
el.classList.add("out")
}

if(p.id === currentTurn){
el.classList.add("active")
}

// CLICK TO PASS
el.onclick = ()=>{
socket.emit("pass",p.id)
}

el.innerHTML = `
<span style="font-size:20px">${p.avatar || "🙂"}</span>
<b>${p.name}</b>
${p.eliminated ? "❌" : "❤️".repeat(p.lives)}
`

div.appendChild(el)

})

}