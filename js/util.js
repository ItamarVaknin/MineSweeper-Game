'use strict'

const btn = document.querySelector('.btn-drak')
const h1 = document.querySelector('h1')
const body = document.querySelector('body')

btn.onclick = function () {
    this.classList.toggle('active')
    body.classList.toggle('active')
    h1.classList.toggle('active')
}


function createMat(ROWS, COLS) {
    const mat = []
    for (var i = 0; i < ROWS; i++) {
        const row = []
        for (var j = 0; j < COLS; j++) {
            row.push('')
        }
        mat.push(row)
    }
    return mat
}


// getrandomint
function rand(min, max){
	min = Math.ceil(min)
	max = Math.floor(max)
	return Math.floor(Math.random() * (max - min + 1) + min)
}

