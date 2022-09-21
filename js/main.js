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


const MINE_IMG = '<img src="img/mine.png" class="mine">'



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

// console.log(gBoard)
function renderBoard(board) {
	const elBoard = document.querySelector('.board')
	var strHTML = ''

    for (var i = 0; i < board.length; i++) {
		strHTML += '<tr>\n'
		for (var j = 0; j < board[0].length; j++) {
			const currCell = board[i][j]

			var cellClass = getClassName({ i, j })

			strHTML += '\t<td class="cell ' + cellClass + '"  onclick="cellClicked((this)' + ',' + i + ',' + j + ')" >\n'

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
    // if (!gTimerInterval) timerPlay()
    var currCell = gBoard[i][j]
   
    if (currCell.isMine)  {
        elCell.innerHTML += '\t' + MINE_IMG + '\n'
        elCell.classList.add('is-mine')
        console.log('isMine')
        // gameOver()
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
        board[rowIdx][colIdx].isShown = true
        board[rowIdx][colIdx].isMine = true
    }

}








// function cellMarked(elCell) 

// function checkGameOver() 

// function expandShown(board, elCell, i, j)


// // cearte timer for user 
var seconds = 0;
var tens = 0;
var appendTens = document.querySelector('.tens')
var appendSeconds = document.querySelector('.seconds')
var buttonStart = document.querySelector('.timer')


function startTimer() {
    tens++;

    if (tens < 9) {
        appendTens.innerHTML = "0" + tens
    }
    if (tens > 9) {
        appendTens.innerHTML = tens
    }
    if (tens > 99) {
        seconds++;
        appendSeconds.innerHTML = "0" + seconds
        tens = 0;
        appendTens.innerHTML = "0" + 0;
    }
    if (seconds > 9) {
        appendSeconds.innerHTML = seconds
    }
}

function timerPlay() {
    var gTimerInterval = true
    gTimerInterval = setInterval(startTimer, 10)
}

function stopTimer() {
    clearInterval(gTimerInterval)
    gTimerInterval = 0
}






// function playTimer() {
    // gtimerInterval = true
    // var timer = document.querySelector('.timer')
    // var start = Date.now()
    // // console.log(start)
    
    // gtimerInterval = setInterval(function () {
    //     var currTs = Date.now()
    //     // console.log(currTs - start)
  
    //   var minutes = parseInt((currTs - start) / 60000)
    //   var secs = parseInt((currTs - start) / 1000)
    
    //   minutes = '00' + minutes
    //   secs = '00' + secs
      
    //   minutes = minutes.substring(minutes.length - 2, minutes.length)
    //   secs = secs.substring(secs.length - 2, secs.length)
    //   var limitTimer = 60
    //   if (+secs === 60) secs -= limitTimer++
  
    // //   timer.innerText = `${secs}:${ms}`
    //   timer.innerText = `${minutes}:${secs}`
    // }, 100)
//   }



// Returns the class name for a specific cell
function getClassName(location) {
	const cellClass = 'cell-' + location.i + '-' + location.j
	return cellClass
}









