
const express = require("express")
const http = require("http")
const socketio = require("socket.io")
const fs = require("fs")

const app = express()
const server = http.createServer(app)
const io = socketio(server)

app.use(express.static("public"))
app.use(express.json())

let players = []
let questionIndex = 0
let currentPlayerIndex = 0

let timer = null
let timeLeft = 10

// LOAD QUESTIONS
function loadQuestions(){
return JSON.parse(fs.readFileSync("./database/questions.json"))
}

// 🧠 SOCKET LOGIC
io.on("connection",(socket)=>{

// JOIN
socket.on("join",(data)=>{

players.push({
id:socket.id,
name:data.name,
avatar:data.avatar,
lives:2,
eliminated:false
})

io.emit("players",players)

})

// ANSWER
socket.on("answer",(a)=>{

let currentPlayer = players[currentPlayerIndex]
if(!currentPlayer) return
if(socket.id !== currentPlayer.id) return

let questions = loadQuestions()
let q = questions[questionIndex]

if(a !== q.correct){

currentPlayer.lives--

if(currentPlayer.lives <= 0){
currentPlayer.eliminated = true
}

}

checkWinner()
io.emit("players",players)

})

// PASS (FIXED: use ID properly)
socket.on("pass",(targetId)=>{

let index = players.findIndex(p=>p.id === targetId)
if(index === -1) return

currentPlayerIndex = index

io.emit("turn",players[index].id)

})

// NEXT QUESTION
socket.on("nextQuestion",()=>{

if(players.length === 0) return

if(players.length === 0) return
console.log("Players alive:", players.filter(p=>!p.eliminated).length)
// allow game with 1 player (for testing)
if(players.filter(p=>!p.eliminated).length === 0){
return
}

// find next active player
do{
currentPlayerIndex++
if(currentPlayerIndex >= players.length){
currentPlayerIndex = 0
}
}while(players[currentPlayerIndex].eliminated)

let currentPlayer = players[currentPlayerIndex]

let questions = loadQuestions()

questionIndex++
if(questionIndex >= questions.length){
questionIndex = 0
}

io.emit("question",questions[questionIndex])
io.emit("turn",currentPlayer.id)

startTimer()

})

})

// 🏆 WINNER SYSTEM
function checkWinner(){

let active = players.filter(p=>!p.eliminated)

if(active.length === 1){

let winner = active[0]

io.emit("winner",winner)

saveMatch(winner.name)

}

}

// 💾 SAVE MATCH
function saveMatch(winner){

let matches = JSON.parse(
fs.readFileSync("./database/matches.json")
)

matches.push({
date:new Date().toISOString(),
winner
})

fs.writeFileSync(
"./database/matches.json",
JSON.stringify(matches,null,2)
)

}

// ⏱ TIMER
function startTimer(){

clearInterval(timer)
timeLeft = 10

timer = setInterval(()=>{

timeLeft--

io.emit("timer",timeLeft)

if(timeLeft <= 0){

clearInterval(timer)

// treat as wrong answer
let currentPlayer = players[currentPlayerIndex]

if(currentPlayer && !currentPlayer.eliminated){

currentPlayer.lives--

if(currentPlayer.lives <= 0){
currentPlayer.eliminated = true
}

io.emit("players",players)
checkWinner()

}

io.emit("timeUp")

}

},1000)

}

// ➕ ADD QUESTION
app.post("/addQuestion",(req,res)=>{

let questions = loadQuestions()

questions.push(req.body)

fs.writeFileSync(
"./database/questions.json",
JSON.stringify(questions,null,2)
)

res.send("OK")

})

// 🌐 PORT FIX (for internet later)
const PORT = process.env.PORT || 3000

server.listen(PORT,()=>{
console.log("Server running on port " + PORT)
})