'use strict'

var gBoard
var gLevel = {SIZE: 4, MINES: 2, LIVES: 0}
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
   }
var gCell
var gTimerInterval = false
var gNumFlags = 0
var gFirstClickSelector


const WIN_IMG = '<img src="img/win.png" class="smiley">'
const LOSE_IMG = '<img src="img/lose.png" class="smiley">'

const MINE_IMG = '<img src="img/mine.png" class="mine">'
const FLAG_IMG = '<img src="img/flag.png" class="mine">'

function levelGame(elLevel) {
    var level = elLevel.getAttribute('data-level')
    console.log(level)
    gLevel.SIZE = level
    switch (+level) {
        case 4:
        gLevel.MINES = 2
        gLevel.LIVES = 0
        console.log(gLevel.LIVES)
        console.log(gLevel.MINES)
        break
        case 8:
        gLevel.MINES = 14
        gLevel.LIVES = 2
        console.log(gLevel.LIVES)
        console.log(gLevel.MINES)
        break
        case 12:
        gLevel.MINES = 32
        gLevel.LIVES = 3
        console.log(gLevel.LIVES)
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
    gGame.isOn = true
    gFirstClickSelector = false
    gBoard =  buildBoard()
    renderBoard(gBoard)
    gameLives()
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
    // if(!gGame.isOn) return
    if (!gTimerInterval) timerPlay()
    var currCell = gBoard[i][j]
    
    if (currCell.isMine)  {
        console.log('isMine')
        if (gFirstClickSelector) {
            gameOver(elCell, i, j)
        }
        return
    }
    gFirstClickSelector = true
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
    if (!gTimerInterval) timerPlay()
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


function gameLives () {
    var lives = document.querySelector('.lives')
    switch (+gLevel.LIVES) {
        case 3:
        lives.innerHTML = '❤️❤️❤️'
        console.log(lives)
        break
        case 2:
        lives.innerHTML = '❤️❤️'
        console.log(lives)
        break
        case 1:
        lives.innerHTML = '❤️'
        console.log(lives)
        break
        case 0:
        lives.innerHTML = ''
        console.log(lives)
        break
    }
    
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
                changeSmiley()
                gGame.isOn = false
            }
		}
	}
}



function gameOver(elCell, i, j) {
    stopTimer()
    var counter = gLevel.LIVES
    
    if (counter > 1) {
        // console.log(gBoard[i][j])
        gBoard[i][j].isShown = true
        elCell.innerHTML += '\t' + MINE_IMG + '\n'
        elCell.classList.add('is-mine')
       
        gLevel.LIVES--
        gameLives()
        return
    }
    
    var count = 0
	for (var i = 0; i < gBoard.length; i++) {
		for (var j = 0; j < gBoard[0].length; j++) {
			var currCell = gBoard[i][j]
            // console.log(gBoard[i][j])
			if (gBoard[i][j].isMine && !gBoard[i][j].isShown) {
                
                var selector = `.cell-${i}-${j}`
                var elCellSecond = document.querySelector(selector)
                elCellSecond.innerHTML += '\t' + MINE_IMG + '\n'
                if (!count) {
                    // console.log(gBoard[i][j])
                    elCell.classList.add('is-mine')
                    count++
                }
                else elCellSecond.classList.add('shown')
                // else elCellSecond.classList.add('shown')
            }
            if (currCell.isShown) continue
		}
	}
    gLevel.LIVES--
    gameLives()
    console.log('game over')
    gGame.isOn = false
    changeSmiley()
}


function changeSmiley() {
    var smiley = document.querySelector('.smiley')
    if (gGame.isOn) {
        smiley.innerHTML = WIN_IMG
    }
    else smiley.innerHTML = LOSE_IMG
    console.log(smiley)
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






