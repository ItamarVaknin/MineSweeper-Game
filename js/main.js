'use strict'

var gBoard
var gLevel = {SIZE: 4, MINES: 2}
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
   }
var gCell
var gTimerInterval = false
var gNumFlags = 0



const MINE_IMG = '<img src="img/mine.png" class="mine">'
const FLAG_IMG = '<img src="img/flag.png" class="mine">'

function levelGame(elLevel) {
    var level = elLevel.getAttribute('data-level')
    console.log(level)
    gLevel.SIZE = level
    switch (+level) {
        case 4:
        gLevel.MINES = 2
        console.log(gLevel.MINES)
        break
        case 8:
        gLevel.MINES = 14
        console.log(gLevel.MINES)
        break
        case 12:
        gLevel.MINES = 32
        console.log(gLevel.MINES)
        break
    }
    init()
}

function createCell(i, j) {
    gCell = {
     location: {i, j},
     minesAroundCount: 0,
     isShown: false,
     isMine: false,
     isMarked: false,
    }
    return gCell
}


function init() {
    gBoard =  buildBoard()
    renderBoard(gBoard)

    

}


function buildBoard() {
    const board = createMat(gLevel.SIZE, gLevel.SIZE)
    // console.log(board)

    for(var i = 0; i < board.length; i++){
        for(var j = 0; j < board[i].length; j++){
            // board[i][j] = { type: WALL, gameElement: null }
           board[i][j] = createCell(i, j)
        }
    }

    createMines(board)

    // console.log(board)
	return board
}


function renderBoard(board) {
	const elBoard = document.querySelector('.board')
	var strHTML = ''

    for (var i = 0; i < board.length; i++) {
		strHTML += '<tr>\n'
		for (var j = 0; j < board[0].length; j++) {
			const currCell = board[i][j]

			var cellClass = getClassName({ i, j })

			strHTML += `\t<td class="cell  ${cellClass}"  onclick="cellClicked((this), ${i}, ${j})">\n`
			// strHTML += `\t<td class="cell  ${cellClass}"  onclick="cellClicked((this), ${i}, ${j})" onmousedown="toggleFlag(this, ${i}, ${j})">\n`

            // modal
            currCell.minesAroundCount =  setMinesNegsCount(gBoard, i, j)

            //DOM
			// if (currCell.isMine) {
			// 	strHTML += '\t' + MINE_IMG + '\n'
			// }
            // else strHTML += '\t' + currCell.minesAroundCount + '\n'
           
			strHTML += '\t</td>\n'
		}
		strHTML += '</tr>\n'
	}

	// console.log('strHTML is:')
	// console.log(strHTML)
	elBoard.innerHTML = strHTML
}


function setMinesNegsCount(board, rowIdx, colIdx) {
    var count = 0
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx) continue
            if (j < 0 || j >= board[0].length) continue
            var currCell = board[i][j]
            if (currCell.isMine) count++
        }
    }
    return count
}


function cellClicked(elCell, i, j) {
    console.log('cellClicked - iswork')
    if (!gTimerInterval) timerPlay()
    var currCell = gBoard[i][j]
   
    if (currCell.isMine)  {
        console.log('isMine')
        gameOver()
        return
    }
    if (currCell.isShown) {
        console.log('isShown') 
        return 
    }    

    // modal
    currCell.isShown = true 
    // DOM
    elCell.classList.add('shown')
    elCell.innerText = currCell.minesAroundCount
    if (currCell.minesAroundCount === 1) elCell.style.color = 'blue'
    if (currCell.minesAroundCount === 2) elCell.style.color = 'green'
    if (currCell.minesAroundCount >= 3) elCell.style.color = 'red'

    expandShown(gBoard,elCell, i, j)
    checkGameOver()
}

function expandShown(board, elCell, rowIdx, colIdx) {
    console.log('expandShown work!')
    if (board[rowIdx][colIdx].minesAroundCount >= 1) return
        elCell.innerText = ''
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx) continue
            if (j < 0 || j >= board[0].length) continue
            var currCell = board[i][j]
                        
            if (!currCell.isShown && !currCell.isMine) {
                // modal
                currCell.isShown = true 
                // DOM
                var selector = `.cell-${i}-${j}`
                var negCell = document.querySelector(selector)
                negCell.classList.add('shown')
                if (currCell.minesAroundCount === 0){
                    negCell.innerText = ''
                    console.log('expandShown stat again')
                    expandShown(gBoard,negCell, i, j)
                }
                else negCell.innerText = currCell.minesAroundCount

                if (currCell.minesAroundCount === 1) negCell.style.color = 'blue'
                if (currCell.minesAroundCount === 2) negCell.style.color = 'green'
                if (currCell.minesAroundCount >= 3) negCell.style.color = 'red'
            }
            
        }
    }
}


function createMines(board) {
    var numMines = gLevel.MINES
    for (var i = 0; i < numMines; i++) {
        var rowIdx = rand(0,board.length - 1)
        var colIdx = rand(0,board[0].length - 1)
        
        if (board[rowIdx][colIdx].isShown) {
            numMines++
            continue
        }
        // board[rowIdx][colIdx].isShown = true
        board[rowIdx][colIdx].isMine = true
    }

}


window.addEventListener("contextmenu", function(event){
    event.preventDefault()
    // console.log(event.path[0])
    event.path[0].innerHTML += '\t' + FLAG_IMG + '\n'
    gNumFlags++
    flagCountPresented()
    if (gNumFlags >= 2) checkGameOver()
    var flag = document.querySelector('.mine') 
    flag.innerHTML = '' 
    event.path[0].classList.toggle('mine')
    // console.log(event.path[0])
})

function flagCountPresented() {
    var counter = 99
    var restFalgs = counter - gNumFlags
    
    var countFalgs = document.querySelector('.flags')
    countFalgs.innerText = restFalgs
    console.log(restFalgs)
    console.log(countFalgs)
}


function checkGameOver() {
    var numCells = gLevel.SIZE**2
    var countCellsForWin = numCells - (gLevel.MINES)
    var counter = 0

    for (var i = 0; i < gBoard.length; i++) {
		for (var j = 0; j < gBoard[0].length; j++) {
			var currCell = gBoard[i][j]
            if (currCell.isShown) {
            counter++
            // console.log(counter)
            }
            if (counter === countCellsForWin && gNumFlags === gLevel.MINES){
                console.log(gNumFlags)
                console.log('win!!') 
                stopTimer()
            }
		}
	}
}



function gameOver() {
    stopTimer()
    var counter = 0
    // var cellsIsMine = []
	for (var i = 0; i < gBoard.length; i++) {
		for (var j = 0; j < gBoard[0].length; j++) {
			var currCell = gBoard[i][j]
            // console.log(gBoard[i][j])
			if (gBoard[i][j].isMine) {
                
                var selector = `.cell-${i}-${j}`
                var elCell = document.querySelector(selector)
                elCell.innerHTML += '\t' + MINE_IMG + '\n'
                if (!counter) {
                    // console.log(gBoard[i][j])
                    elCell.classList.add('is-mine')
                    counter++
                }
                else elCell.classList.add('shown')
            }
            if (currCell.isShown) continue
		}
	}
    console.log('game over')
}




// function cellMarked(elCell) 










// // cearte timer for user 
var seconds = 0;
var minutes = 0;
var appendSeconds = document.querySelector('.seconds')
var appendMinutes = document.querySelector('.minutes')
var buttonStart = document.querySelector('.timer')


function startTimer() {
    seconds++;

    if (seconds < 9) {
        appendSeconds.innerHTML = "0" + seconds
    }
    if (seconds > 9) {
        appendSeconds.innerHTML = seconds
    }
    if (seconds > 59) {
        minutes++;
        appendMinutes.innerHTML = "0" + minutes
        seconds = 0;
        appendSeconds.innerHTML = "0" + 0;
    }
    if (minutes > 9) {
        appendMinutes.innerHTML = minutes
    }
}

function timerPlay() {
    gTimerInterval = true
    gTimerInterval = setInterval(startTimer, 1000)
}

function stopTimer() {
    clearInterval(gTimerInterval)
    gTimerInterval = 0
}



// Returns the class name for a specific cell
function getClassName(location) {
	const cellClass = 'cell-' + location.i + '-' + location.j
	return cellClass
}






