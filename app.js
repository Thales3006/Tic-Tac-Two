const express = require('express')
const { createServer } = require('http')
const { join } = require('path')
const { Server } = require("socket.io")

const port = 3000
const app = express()
const server = createServer(app)
const io = new Server(server)

let gameMatrix = Array(9).fill().map(()=>Array(9).fill(0))

app.use(express.static('public'))
app.get('/', (req, res) => {
    res.sendFile(join(__dirname, '/index.html'))
  })

io.on('connection', (socket) => {
    console.log(`new user ${socket.id} connected`)
    io.emit('update cells',gameMatrix)

    socket.on('disconnect', () => {
        console.log(`user ${socket.id} disconnected`)
    })
    
    socket.on('chat message', (message) => {
        console.log(`[${socket.id}]: ${message}`)
        io.emit('chat message', `[${socket.id}]: ${message}`)
    })

    socket.on('click cell', (cell) => {
        if(gameMatrix[cell.row][cell.column] === 0)
            gameMatrix[cell.row][cell.column] = 1
        io.emit('update cells',gameMatrix)
    })

    socket.on('restart', () => {
        gameMatrix = Array(9).fill().map(()=>Array(9).fill(0))
        io.emit('update cells',gameMatrix)
    })


})

server.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})