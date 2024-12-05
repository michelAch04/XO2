export function markMove(latestMove, currentTurn) {
    const [currentGridIndex, currentCellIndex] = latestMove.split('-');  // Split the string into two parts
    const currentGrid = document.querySelector(`.grid[data-grid="${currentGridIndex}"]`);
    if (currentGrid) {
        const currentCell = currentGrid.querySelector(`.cell[data-cell="${currentCellIndex}"]`);
        const sign = currentTurn === true ? 'X' : 'O';
        currentCell.innerHTML = sign;
    }
}
//----------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------
let grids = [];
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        grids = document.querySelectorAll('.grid');
        console.log(grids);
    }, 10000);
})


export function playTurn(gridIndex, cellIndex, currentTurn) {
    const currentGrid = document.querySelector(`.grid[data-grid="${gridIndex}"]`);
    const currentCell = currentGrid.querySelector(`.cell[data-cell="${cellIndex}"]`);

    if (!currentGrid.classList.contains('active') || currentCell.classList.contains('full')) {
        return; // Ignore invalid moves
    }

    currentCell.textContent = currentTurn === true ? "X" : "O";
    currentCell.classList.add('full');
    currentGrid.classList.remove('active');
    checkGridCompletion(gridIndex);
    const winSign = checkWin(); //X, O or null

    const nextGrid = document.querySelector(`.grid[data-grid="${cellIndex}"`);
    if (nextGrid && nextGrid.classList.contains('incomplete')) {
        console.log(grids.length);
        grids.forEach(grid => {
            grid.classList.remove('active');
        });
        nextGrid.classList.add('active'); // Activate the target grid
        console.log(nextGrid.dataset.grid);
    } else {
        // If target grid is complete, allow play on any incomplete grid
        grids.forEach(grid => {
            if (grid.classList.contains('incomplete')) {
                grid.classList.add('active');
            }
        });
    }
    return winSign;
}

function checkGridCompletion(gridIndex) {
    const currentGrid = document.querySelector(`.grid[data-grid="${gridIndex}"]`);
    const gridCells = Array.from(currentGrid.querySelectorAll('.cell'));
    const signs = gridCells.map(cell => cell.textContent);

    // Check rows, columns, and diagonals
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    for (const pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (signs[a] && signs[a] === signs[b] && signs[b] === signs[c]) {
            currentGrid.classList.remove('incomplete');
            currentGrid.classList.add('complete');
            displayGridCompletion(currentGrid, signs[a]); // Pass the winning sign
            currentGrid.classList.add(`${signs[a].toLowerCase()}-win`)
            return;
        }
    }

    // Check for a draw: all cells filled and no winner
    if (signs.every(sign => sign)) {
        currentGrid.classList.remove('incomplete');
        currentGrid.classList.add('complete');
        displayDrawGrid(currentGrid); // Handle draw
    }
}

function checkWin() {
    const grids = Array.from(document.querySelectorAll('.grid'));
    const gridStates = grids.map(grid => {
        if (grid.classList.contains('x-win')) {
            return 'X';
        }
        else if (grid.classList.contains('o-win')) {
            return 'O';
        }
        return null; // Grid is either incomplete or a draw
    });

    // Define win patterns for the large grid
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    // Check for a winning pattern
    for (const pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (gridStates[a] && gridStates[a] === gridStates[b] && gridStates[b] === gridStates[c]) {
            displayOverallWinner(gridStates[a]); // Pass the winner's sign
            return gridStates[a];
        }
    }
    return null;
}

//DISPLAY
function createXAnimation() {
    return `
        <div class="draw-x">
            <div class="line line1"></div>
            <div class="line line2"></div>
        </div>
    `;
}

function createOAnimation() {
    return `
        <div class="draw-o">
            <div class="circle"></div>
        </div>
    `;
}

function displayDrawGrid(currentGrid) {
    // Clear all cells
    const gridCells = Array.from(currentGrid.querySelectorAll('.cell'));
    gridCells.forEach(cell => {
        cell.classList.add('hidden'); // Optionally hide cells
    });

    // Add a neutral overlay
    const overlay = document.createElement('div');
    overlay.classList.add('draw-overlay');
    overlay.textContent = 'DRAW'; // Display "DRAW" text

    // Append overlay to grid
    currentGrid.appendChild(overlay);
}

function displayGridCompletion(currentGrid, winnerSign) {
    // Clear all cells in the grid
    const gridCells = Array.from(currentGrid.querySelectorAll('.cell'));
    gridCells.forEach(cell => {
        cell.classList.add('hidden'); // Optionally hide cells
    });

    // Add an overlay div for the drawing animation
    const overlay = document.createElement('div');
    overlay.classList.add('winner-draw');
    overlay.innerHTML = winnerSign === 'X' ? createXAnimation() : createOAnimation();

    // Append the overlay to the grid
    currentGrid.appendChild(overlay);
    currentGrid.classList.add('complete'); // Mark grid as complete

    setTimeout(() => {
        const lines = overlay.querySelectorAll('.line');
        const circle = overlay.querySelector('.circle');

        if (lines) {
            lines.forEach(line => line.classList.add('animate'));
        }

        if (circle) {
            circle.classList.add('animate');
        }
    }, 100); // Slight delay to ensure the animation starts smoothly

}

function displayOverallWinner(winnerSign) {
    const board = document.getElementById('gameBoard');
    const overlay = document.createElement('div');
    overlay.classList.add('overall-winner-overlay');
    overlay.textContent = `${winnerSign} WINS!`;

    board.appendChild(overlay);

    // Optional: Add a replay button
    const replayButton = document.createElement('button');
    replayButton.textContent = 'Replay';
    replayButton.classList.add('replay-button');
    replayButton.onclick = () => location.reload(); // Reload the page for a new game
    overlay.appendChild(replayButton);
}


//----------------------TO ENABLE AND DISABLE---------------------------------
//----------------------------------------------------------------------------
//----------------------------------------------------------------------------

export function disableBoard() {
    grids.forEach(grid => {
        const cells = grid.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.classList.add('disabled');
        })
    })
}

export function enableBoard() {
    grids.forEach(grid => {
        const cells = grid.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.classList.remove('disabled');
        })
    })
}
