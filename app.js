const express = require('express')
const { createServer } = require('http')
const { join } = require('path')
const { Server } = require("socket.io")

const port = 3000
const app = express()
const server = createServer(app)
const io = new Server(server)

let gameMatrix = Array(9).fill().map(()=>Array(9).fill(0))
let current = {row: undefined, column: undefined}
let players = Array(2)
let turn = true

app.use(express.static('public'))
app.get('/', (req, res) => {
    res.sendFile(join(__dirname, '/index.html'))
  })

io.on('connection', (socket) => {
    console.log(`new user ${socket.id} connected`)
    if(players.length < 2)
        players.push(socket.id)
    io.emit('update cells', {gameMatrix, current})

    socket.on('disconnect', () => {
        console.log(`user ${socket.id} disconnected`)
        players = players.filter(player => player !== socket.id)
    })
    
    socket.on('chat message', (message) => {
        console.log(`[${socket.id}]: ${message}`)
        io.emit('chat message', `[${socket.id}]: ${message}`)
    })

    socket.on('click cell', (cell) => {
        if(gameMatrix[cell.row][cell.column] !== 0 ||
            cell.column < current.column*3 || cell.column >= current.column*3 + 3 ||
            cell.row < current.row*3 || cell.row >= current.row*3 + 3)
            return
        else if(turn && players[0] === socket.id)
            gameMatrix[cell.row][cell.column] = 1
        else if(!turn && players[1] === socket.id)
            gameMatrix[cell.row][cell.column] = 2
        else 
            return

        current = {row: cell.row % 3, column: cell.column % 3}
        turn = !turn

        io.emit('update cells', {gameMatrix, current, turn})
    })

    socket.on('restart', () => {
        gameMatrix = Array(9).fill().map(()=>Array(9).fill(0))
        current = {row: undefined, column: undefined}
        io.emit('update cells', {gameMatrix, current, turn})
    })


})

server.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})