const fs = require("fs")

function makeDir(p){
if(!fs.existsSync(p)){
fs.mkdirSync(p,{recursive:true})
}
}

makeDir("database")
makeDir("public")

fs.writeFileSync("database/questions.json",JSON.stringify([
{
question:"Capital of Italy?",
A:"Rome",
B:"Milan",
C:"Venice",
D:"Naples",
correct:"A"
}
],null,2))

fs.writeFileSync("database/leaderboard.json","[]")
fs.writeFileSync("database/matches.json","[]")

fs.writeFileSync("public/index.html",`
<h1>1 z 10 Game</h1>

<a href="/stage.html">Watch Game</a><br><br>
<a href="/join.html">Join Game</a><br><br>
<a href="/host.html">Host Panel</a>
`)

fs.writeFileSync("public/stage.html",`
<h1>Game Stage</h1>
<div id="players"></div>
<div id="question"></div>

<script src="/socket.io/socket.io.js"></script>

<script>
const socket = io()

socket.on("players",(players)=>{

let div=document.getElementById("players")
div.innerHTML=""

players.forEach(p=>{
div.innerHTML+=p.name+" ❤️"+p.lives+"<br>"
})

})

socket.on("question",(q)=>{
document.getElementById("question").innerText=q.question
})
</script>
`)

fs.writeFileSync("public/join.html",`
<h1>Join Game</h1>

<input id="name">

<button onclick="join()">Join</button>

<script src="/socket.io/socket.io.js"></script>

<script>
const socket=io()

function join(){

let name=document.getElementById("name").value

socket.emit("join",name)

document.body.innerHTML=\`
<button onclick="send('A')">A</button>
<button onclick="send('B')">B</button>
<button onclick="send('C')">C</button>
<button onclick="send('D')">D</button>
\`

}

function send(a){
socket.emit("answer",a)
}
</script>
`)

fs.writeFileSync("public/host.html",`
<h1>Host Panel</h1>

<button onclick="next()">Next Question</button>

<script src="/socket.io/socket.io.js"></script>

<script>
const socket=io()

function next(){
socket.emit("nextQuestion")
}
</script>
`)

fs.writeFileSync("server.js",`
const express = require("express")
const http = require("http")
const socketio = require("socket.io")
const fs = require("fs")

const app = express()
const server = http.createServer(app)
const io = socketio(server)

app.use(express.static("public"))

let players = []
let questionIndex = 0

let questions = JSON.parse(
fs.readFileSync("./database/questions.json")
)

io.on("connection",(socket)=>{

socket.on("join",(name)=>{

players.push({
id:socket.id,
name:name,
lives:2,
eliminated:false
})

io.emit("players",players)

})

socket.on("answer",(a)=>{

let q = questions[questionIndex]

let p = players.find(p=>p.id===socket.id)

if(!p || p.eliminated) return

if(a !== q.correct){

p.lives--

if(p.lives<=0){
p.eliminated = true
}

}

io.emit("players",players)

})

socket.on("nextQuestion",()=>{

questionIndex++

if(questionIndex>=questions.length){
questionIndex=0
}

io.emit("question",questions[questionIndex])

})

})

server.listen(3000,()=>{
console.log("Server running on port 3000")
})
`)

console.log("Project created successfully.")