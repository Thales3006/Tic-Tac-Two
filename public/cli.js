const socket = io()

const form = document.getElementById('form')
const input = document.getElementById('input')
const messages = document.getElementById('messages')

form.addEventListener('submit', (e) => {
    e.preventDefault()
    if (input.value) {
        socket.emit('chat message', input.value)
        input.value = ''
    }
})


socket.on('chat message', (message) => {
    const item = document.createElement('li')
    item.textContent = message
    messages.appendChild(item)
    window.scrollTo(0, document.body.scrollHeight)
})

socket.on('update cells', (newInfo) => {
    let current = newInfo.current
    let newMat = newInfo.gameMatrix

    let text = document.getElementById("turnTitle")
    text.innerHTML = `Vez de: ${newInfo.turn ? "X" : "O"}`
    text.style.color = newInfo.turn ? "#AA2200" : "#0022AA"
    
    const innerCells = Array.from(document.querySelectorAll("td.inner"))
    innerCells.forEach((cell, index) => {
        j = index % 3
        i = Math.floor(index/3) % 3
        k = Math.floor(index/(3**2)) % 3
        w = Math.floor(index/(3**3)) % 3

        cellValue = newMat[i+w*3][j+k*3]
        
        if(cellValue === 1)
            cell.innerHTML = '<b>X</b>'
        else if(cellValue === 2)
            cell.innerHTML = '<b>O</b>'
        else if(cellValue === 0)
            cell.innerHTML = '<b></b>'

        if(current.row === undefined || w === current.row && k === current.column){
                cell.style.backgroundColor = "#FFFFFF"
                cell.style.border = "5px solid #705c5c"

        } else {
                cell.style.backgroundColor = "#BBBBBB"
                cell.style.border = "5px solid #604c4c"
        }

    })
})

const tableOuter = document.querySelector("#game table")
for (let i = 0; i < 3; i++) {
    const row = document.createElement("tr")
    for (let j = 0; j < 3; j++) {
        const cell = document.createElement("td")
        cell.appendChild(generateInnerTable(i,j))
        cell.className = "outer"

        row.appendChild(cell)
    }
    row.className = "outer"
    tableOuter.appendChild(row)
}

function generateInnerTable(c, r){
    const table = document.createElement("table")
    for (let i = 0; i < 3; i++) {
        const row = document.createElement("tr")
        for (let j = 0; j < 3; j++) {
            const cell = document.createElement("td")
            cell.setAttribute("data-row", i + 3*c)
            cell.setAttribute("data-col", j + 3*r)
            cell.className = "inner"
            row.appendChild(cell)
        }
        row.className = "inner"
        table.appendChild(row)
    }
    table.className = "inner"
    return table;
}

tableOuter.addEventListener("click", (event) => {
    const cell = event.target

    if (cell.tagName === "TD" && cell.dataset.row)
        socket.emit('click cell', {
            row: cell.dataset.row, 
            column: cell.dataset.col
        })
})

document.getElementById("restart").addEventListener('click',() => {
    socket.emit('restart')
})