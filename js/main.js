'use strict'

var gBoard
var gLevel = {SIZE: 4, MINES: 2, LIVES: 0, HINTS: 0}
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    isHint: false,
    manuallyState: false,
    sevenBoomMinesState: false,
    megaHint:false,
   }
var gCell
var gTimerInterval = false
var gNumFlags = 0
var gFirstClickSelector
var gBestTime = Infinity
var gSafeClicks = 3
var gSequence = []
var gMegaHintCountClick = 0
var gNumManuallyMines = 0


const WIN_IMG = '<img src="img/win.png" class="smiley">'
const LOSE_IMG = '<img src="img/lose.png" class="smiley">'
const PLAY_IMG = '<img src="img/smiley.png" class="smiley">'

const MINE_IMG = '<img src="img/mine.png" class="mine">'
const FLAG_IMG = '<img src="img/flag.png" class="mine flag">'

function levelGame(elLevel) {
    var level = elLevel.getAttribute('data-level')
    gLevel.SIZE = level
    switch (+level) {
        case 4:
        gLevel.MINES = 2
        gLevel.LIVES = 0
        gLevel.HINTS = 0
        break
        case 8:
        gLevel.MINES = 14
        gLevel.LIVES = 2
        gLevel.HINTS = 2
        break
        case 12:
        gLevel.MINES = 32
        gLevel.LIVES = 3
        gLevel.HINTS = 3
        break
    }
    localStorage.setItem('lives', gLevel.LIVES)
    // localStorage.setItem('mines', gLevel.MINES)
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
    gLevel.LIVES = localStorage.getItem('lives')
    // gLevel.MINES = localStorage.getItem('mines')
    if (gLevel.SIZE <= 4) gLevel.LIVES = 0
    gSafeClicks = 3
    var numSafeClicks = document.querySelector('.count-safe-click')
    numSafeClicks.innerHTML = gSafeClicks
    gMegaHintCountClick = 0
    gFirstClickSelector = false
    gBoard = buildBoard()
    renderBoard(gBoard)
    gameLives()
    gameHints()
    checkBestTime()
    var smiley = document.querySelector('.smiley')
    smiley.innerHTML = PLAY_IMG
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

    if(!gGame.manuallyState && !gGame.sevenBoomMinesState) createMines(board)

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

			strHTML += `\t<td class="cell  ${cellClass}"  onclick="cellClicked((this), ${i}, ${j})" onmouseup="createManuallyMines(${i}, ${j})">\n`
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
    if(!gGame.isOn) return
    if (elCell.innerText === '🚩') return
    if (gGame.manuallyState) return
    if (!gTimerInterval) timerPlay()
    if (gGame.megaHint) {
       megaHintPlay(elCell, i, j)
       return
    }
    if (gGame.isHint) {
        hintPlay(elCell, i, j)
        return
    }
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
    gSequence.unshift({i, j})
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
    // console.log('expandShown work!')
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
                gSequence.push({i, j})
                // DOM
                var selector = `.cell-${i}-${j}`
                var negCell = document.querySelector(selector)
                negCell.classList.add('shown')
                if (currCell.minesAroundCount === 0 && !gGame.isHint){
                    negCell.innerText = ''
                    console.log('expandShown start again')
                    expandShown(gBoard,negCell, i, j)
                }
                else negCell.innerText = currCell.minesAroundCount

                if (currCell.minesAroundCount === 0 && gGame.isHint) negCell.innerText = ''
                
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
        var currCell = board[rowIdx][colIdx]

        if (currCell.isShown || currCell.isMine) {
            numMines++
            continue
        }
        currCell.isMine = true
    }

}


window.addEventListener("contextmenu", function(event){
    event.preventDefault()
    // console.log(event.path[0])

    if (!gTimerInterval) timerPlay()
    if (event.path[0].classList.contains('shown')) return
    if (event.path[0].classList.contains('flag')) {
        // event.path[0].innerHTML = ''
        event.path[0].innerText = ''
        event.path[0].classList.remove('flag')
        gNumFlags--
    }
    else {
        // event.path[0].innerHTML += '\t' + FLAG_IMG + '\n'
        event.path[0].innerText = '🚩'
        event.path[0].classList.add('flag')
        gNumFlags++
    }
    flagCountPresented()
    if (gNumFlags >= 2) checkGameOver()
})

function flagCountPresented() {
    var counter = 99
    var restFalgs = counter - gNumFlags
    
    var countFalgs = document.querySelector('.flags')
    countFalgs.innerText = restFalgs
    // console.log(restFalgs)
    // console.log(countFalgs)
}


function gameLives () {
    var lives = document.querySelector('.lives')
    // console.log(gLevel.LIVES)
    switch (+gLevel.LIVES) {
        case 3:
        lives.innerHTML = '❤️❤️❤️'
        // console.log(lives)
        break
        case 2:
        lives.innerHTML = '❤️❤️'
        // console.log(lives)
        break
        case 1:
        lives.innerHTML = '❤️'
        // console.log(lives)
        break
        case 0:
        lives.innerHTML = ''
        // console.log(lives)
        break
    }
    
}

function hintState() {
    console.log('hintstate is work')
    if (!gLevel.HINTS) return
    if (!gGame.isHint) gGame.isHint = true
    else gGame.isHint = false
    console.log('gGame.isHint:', gGame.isHint)
}

function hintPlay(elCell, i, j) {
    console.log('hintplay is work')
    gLevel.HINTS--
    gameHints()

    var currCell = gBoard[i][j]
    
    // modal
    currCell.isShown = true 
    // DOM
    elCell.classList.add('shown')
    elCell.innerText = currCell.minesAroundCount
    if (currCell.minesAroundCount === 0) elCell.innerText = ''
    if (currCell.minesAroundCount === 1) elCell.style.color = 'blue'
    if (currCell.minesAroundCount === 2) elCell.style.color = 'green'
    if (currCell.minesAroundCount >= 3) elCell.style.color = 'red'
    
    if (currCell.isMine)  {
        console.log('hint - isMine')
        elCell.innerText = ''
        gameOver(elCell, i, j)
    }

    revealedCellNegsHint(gBoard, i, j)
    setTimeout(repeateHint ,1000, elCell, i, j)

}

function revealedCellNegsHint(board, rowIdx, colIdx) {
    console.log('revealedHint');
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx) continue
            if (j < 0 || j >= board[0].length) continue
            var currCell = board[i][j]
                        
                // modal
                // currCell.isShown = true 

                // DOM
                var selector = `.cell-${i}-${j}`
                var negCell = document.querySelector(selector)
                negCell.classList.add('shown')
                if (currCell.minesAroundCount === 0) negCell.innerText = ''
                else negCell.innerText = currCell.minesAroundCount
    
                if (currCell.isMine)  {
                    console.log('hint - isMine')
                    negCell.innerText = ''
                    gameOver(negCell, i, j)
                }
                else {
                    if (currCell.minesAroundCount === 1) negCell.style.color = 'blue'
                    if (currCell.minesAroundCount === 2) negCell.style.color = 'green'
                    if (currCell.minesAroundCount >= 3) negCell.style.color = 'red'
                }
            }
            
        }
    }


function repeateHint (elCell, rowIdx, colIdx) {
    console.log('settimeout is work')

    elCell.innerHTML = ''
    elCell.classList.remove('is-mine')
    elCell.classList.remove('shown')
    gBoard[rowIdx][colIdx].isShown = false

    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx) continue
            if (j < 0 || j >= gBoard[0].length) continue
            var currCell = gBoard[i][j]
            
            currCell.isShown = false
        
            var selector = `.cell-${i}-${j}`
            var negCell = document.querySelector(selector)
            negCell.classList.remove('is-mine')
            negCell.classList.remove('shown')
            negCell.innerHTML = ''
        }
    } 
    gGame.isHint = false
   
}


function gameHints () {
    var hints = document.querySelector('.hints')
    // console.log(hints)
    switch (+gLevel.HINTS) {
        case 3:
        hints.innerHTML = '💡💡💡'
        // console.log(hints)
        break
        case 2:
        hints.innerHTML = '💡💡'
        // console.log(hints)
        break
        case 1:
        hints.innerHTML = '💡'
        // console.log(hints)
        break
        case 0:
        hints.innerHTML = ''
        // console.log(hints)
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
                // console.log(startTime)
                var resFinish = Date.now() - startTime
                // console.log(resFinish)
                if (resFinish < gBestTime) {
                    gBestTime = (resFinish / 1000).toFixed(1)
                    localStorage.setItem('best-time', gBestTime);
                    // showBTime.innerText = 'Best Time: ' + bestTime + '\'s';
                }
            }
		}
	}
}



function gameOver(elCell, i, j) {
    stopTimer()
    var counter = gLevel.LIVES
    if (gGame.isHint || gGame.megaHint) {
        elCell.innerHTML += '\t' + MINE_IMG + '\n'
        return
    }

    if (counter > 1) {
        // console.log(gBoard[i][j])
        elCell.innerHTML += '\t' + MINE_IMG + '\n'
        gBoard[i][j].isShown = true
        gSequence.unshift({i, j})
        elCell.classList.add('is-mine')
        gLevel.LIVES--
        gameLives()
        return
    }
    
    elCell.classList.add('is-mine')
	for (var i = 0; i < gBoard.length; i++) {
		for (var j = 0; j < gBoard[0].length; j++) {
			var currCell = gBoard[i][j]
            // console.log(gBoard[i][j])
			if (gBoard[i][j].isMine && !gBoard[i][j].isShown) {
                gSequence.unshift({i, j})
                var selector = `.cell-${i}-${j}`
                var elCellSecond = document.querySelector(selector)
                elCellSecond.innerText = ''
                elCellSecond.innerHTML += '\t' + MINE_IMG + '\n'
                elCellSecond.classList.add('shown')
            }
            if (currCell.isShown) continue
		}
	}
    gLevel.LIVES--
    gameLives()
    console.log('game over')
    gGame.isOn = false
    changeSmiley()

    console.log('gLevel.MINES:',gLevel.MINES)
}


function changeSmiley() {
    var smiley = document.querySelector('.smiley')
    if (gGame.isOn) {
        smiley.innerHTML = WIN_IMG
    }
    else smiley.innerHTML = LOSE_IMG
    // console.log(smiley)
}


function checkBestTime() {
    var elBestTime = document.querySelector('.best-time')
    // console.log(elBestTime)
    if (localStorage.getItem('best-time') === null) {
        elBestTime.innerHTML = 'Best Time: 00.0 \'s';
    } 
    else {
        gBestTime = localStorage.getItem('best-time');
        elBestTime.innerHTML = 'Best Time: ' + gBestTime + '\'s'
    }

}


function safeClick() {
    console.log('safeclick')
    if(!gSafeClicks) return

    var cellsEmpty = []
	for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var currCell = gBoard[i][j]
            if (currCell.isShown || currCell.isMine) continue
            else cellsEmpty.unshift({ i, j })
            // console.log(currCell)
        }
    }

    var cellEmpty = rand(0,cellsEmpty.length - 1)

    if(!cellsEmpty.length) {
        console.log('arr.cellsEmpty is empty')
        var btnSafeClick = document.querySelector('.safe-click')
        btnSafeClick.style.backgroundColor = '#f33118'
        return
    }
    
    var selector = `.cell-${cellsEmpty[cellEmpty].i}-${cellsEmpty[cellEmpty].j}`
    var elCell = document.querySelector(selector)
    elCell.classList.add('safe')

    // modal
    gSafeClicks--
    // DOM
    var numSafeClicks = document.querySelector('.count-safe-click')
    numSafeClicks.innerHTML = gSafeClicks

    setTimeout(() => {
        elCell.classList.remove('safe')
    }, 3000)

}


function manuallyState() {
    console.log('manuallyState is work')
    var btnManually = document.querySelector('.btn-manuallyState')
    if (!gGame.manuallyState) {
        gGame.manuallyState = true
        btnManually.style.backgroundColor = 'green'
        init()
        console.log(gGame.manuallyState)
    }
    else {
        gGame.manuallyState = false
        btnManually.style.backgroundColor = '#7d5d05'
        gLevel.MINES = gNumManuallyMines
        gNumManuallyMines = 0
        renderBoard(gBoard)
    }

}

function createManuallyMines(i, j) {
    if (!gGame.manuallyState) return
    console.log('i:',i)
    console.log('j:',j)

    if (gBoard[i][j].isShown) return
    else gBoard[i][j].isMine = true
    console.log(gBoard[i][j])
    gNumManuallyMines++

}


function undoPlay() {
    var i = gSequence[0].i
    var j = gSequence[0].j

    var currCell = gBoard[i][j]
    console.log('currCell undo:',currCell)
    var livesLess

    currCell.isShown = false
    var selector = `.cell-${i}-${j}`
    var elCell = document.querySelector(selector)

    // console.log(elCell.classList.contains("is-mine"))
    if (elCell.classList.contains('is-mine')) livesLess = true
    else livesLess = false

    elCell.classList.remove('is-mine')
    elCell.classList.remove('shown')
    elCell.innerHTML = ''
    gSequence.shift()
    if (currCell.isMine) {
        var i = gSequence[0].i
        var j = gSequence[0].j
        var nextCell = gBoard[i][j]
        // console.log('currCellSecond:',nextCell)

        // console.log('gLevel.LIVES:', gLevel.LIVES);
        if (nextCell.isMine || !gLevel.LIVES) gGame.isOn = false
        else gGame.isOn = true

        
        if (gLevel.SIZE > 4 && livesLess) {
            gLevel.LIVES++
            console.log('up 1 live')
            gameLives()
            if (!nextCell.isMine) gGame.isOn = true
        }
    }
}


function sevenBoomMines() {
    console.log('sevenBoomMines()')
    // for (var i = 0; i < 145; i++) {
    //     if (i % 7 === 0) console.log('i:',i)
    //     else continue
    // }

    gGame.sevenBoomMinesState = true
    init()
    var counter = 0
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var currCell = gBoard[i][j]
            if (counter % 7 === 0 && counter !== 0) {
                if (j === 0) {
                    gBoard[i-1][gBoard[0].length-1].isMine = true
                }
                else {
                    gBoard[i][j-1].isMine = true
                }

            }
            counter++
        }
    }
    renderBoard(gBoard)
    gGame.sevenBoomMinesState = false
}

function megaHintState() {
    if (gMegaHintCountClick) return
    gGame.megaHint = true
    console.log('gGame.megaHint:',gGame.megaHint)
    var btnMegaHint = document.querySelector('.mega-hint')
    btnMegaHint.style.backgroundColor = '#3ae61b'
}

var gRowIdxStart
var gColIdxStart

function megaHintPlay(elCell, i, j) {

    if (!gMegaHintCountClick) {
        gRowIdxStart = i
        gColIdxStart = j
        gMegaHintCountClick++
        console.log('gMegaHintCountClick:',gMegaHintCountClick)
        return
    }
    else {
        var rowIdxEnd = i
        var colIdxEnd = j
        console.log('gMegaHintCountClick:',gMegaHintCountClick)
        gGame.isOn = false
    }


    console.log('revealed Mega Hint')
    for (var i = gRowIdxStart; i <= rowIdxEnd; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = gColIdxStart; j <= colIdxEnd; j++) {
            if (j < 0 || j >= gBoard[0].length) continue
            var currCell = gBoard[i][j]
                        
                // DOM
                var selector = `.cell-${i}-${j}`
                var cellInField = document.querySelector(selector)
                cellInField.classList.add('shown')
                if (currCell.minesAroundCount === 0) cellInField.innerText = ''
                else cellInField.innerText = currCell.minesAroundCount
    
                if (currCell.isMine)  {
                    console.log('hint - isMine')
                    cellInField.innerText = ''
                    gameOver(cellInField, i, j)
                }
                else {
                    if (currCell.minesAroundCount === 1) cellInField.style.color = 'blue'
                    if (currCell.minesAroundCount === 2) cellInField.style.color = 'green'
                    if (currCell.minesAroundCount >= 3) cellInField.style.color = 'red'
                }
            }
            
        }
    setTimeout(repeateMegaHint ,2000, gRowIdxStart, gColIdxStart, rowIdxEnd, colIdxEnd)
    gGame.megaHint = false
}

function repeateMegaHint (rowIdxStart, colIdxStart, rowIdxEnd, colIdxEnd) {
    console.log('repeateMegaHint is work')

    // elCell.innerHTML = ''
    // elCell.classList.remove('is-mine')
    // elCell.classList.remove('shown')
    // gBoard[rowIdx][colIdx].isShown = false

    for (var i = rowIdxStart; i <= rowIdxEnd; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = colIdxStart; j <= colIdxEnd; j++) {
            if (j < 0 || j >= gBoard[0].length) continue
            var currCell = gBoard[i][j]
            
            currCell.isShown = false
        
            var selector = `.cell-${i}-${j}`
            var cellInField = document.querySelector(selector)
            cellInField.classList.remove('is-mine')
            cellInField.classList.remove('shown')
            cellInField.innerHTML = ''
        }
    }    
    var btnMegaHint = document.querySelector('.mega-hint')
    btnMegaHint.style.backgroundColor = '#4dab79'
    gGame.isOn = true
}


function exterminatorMines() {
    console.log('exterminatorMines is work')

    
    var cellsMines = []
	for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var currCell = gBoard[i][j]
            console.log(currCell)
            if (currCell.isMine) cellsMines.unshift({ i, j })
            else continue
        }
    }

    if(!cellsMines.length) {
        console.log('arr.cellsMines is empty')
        return
    }

    var eliminationsNum = 3
    for (var i = 0; i < eliminationsNum; i++) {
        if (cellsMines.length < 3) eliminationsNum = cellsMines.length
        var cellMine = rand(0,cellsMines.length - 1)
        var currCellMine = gBoard[cellsMines[cellMine].i][cellsMines[cellMine].j]
        if (!currCellMine.isMine) eliminationsNum++
        currCellMine.isMine = false
    }

    renderBoard(gBoard)

}




// function cellMarked(elCell) 




// // cearte timer for user 
var seconds = 0;
var minutes = 0;
var appendSeconds = document.querySelector('.seconds')
var appendMinutes = document.querySelector('.minutes')
var buttonStart = document.querySelector('.timer')
var startTime = Date.now()




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






