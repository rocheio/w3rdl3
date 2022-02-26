const SPACE_BETWEEN_TILES = 0.4;
const TILE_SIZE = 2.1;

// General utility functions
function randIntBetween(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}
function reverseIndexOf(arr, value) {
    for (i = arr.length - 1; i > 0; i--) {
        if (arr[i] == value) return i;
    }
    return -1;
}

// The game space is a 5x5 grid of tiles that can not overlap
// Values are `null` when no tile exists or a <div> element
function initTileGrid() {
    grid = new Array(5);
    for (var row = 0; row < 5; row++) {
        grid[row] = new Array(5);
        for (var col = 0; col < 5; col++) {
            grid[row][col] = null;
        }
    }
    return grid;
}
var TILES = initTileGrid();

function getColumnOfTiles(index) {
    // Return a virtual column of tiles from the current game state
    arr = new Array(5);
    for (var row = 0; row < 5; row++) {
        arr[row] = TILES[row][index];
    }
    return arr;
}

function createNewTileAt(row, col) {
    console.log(`creating tile (${row}, ${col})`);
    var tile = document.createElement("div");
    tile.className = "tile";
    tile.innerHTML = "A";
    
    TILES[row][col] = tile;
    
    setTileTransform(tile, row, col);

    grid = document.getElementsByClassName("tile-container")[0];
    grid.appendChild(tile);
}

function setTileTransform(tile, row, col) {
    // Adjust tile position via overloading style tag
    absX = TILE_SIZE * row + SPACE_BETWEEN_TILES * row + SPACE_BETWEEN_TILES;
    absY = TILE_SIZE * col + SPACE_BETWEEN_TILES * col + SPACE_BETWEEN_TILES;
    tile.style.transform = `translate(${absY}rem, ${absX}rem)`;
}

function shiftTilesLeft() {
    for (row = 0; row < 5; row++) {
        for (col = 0; col < 5; col++) {
            if (TILES[row][col] != null) {
                shiftOneTileLeft(row, col);
            }
        }
    }
}
function shiftOneTileLeft(row, col) {
    leftmostEmptyCol = TILES[row].indexOf(null);
    if (leftmostEmptyCol != -1 && leftmostEmptyCol < col) {
        moveTileToLocation(row, col, row, leftmostEmptyCol);
    }
}

function shiftTilesRight() {
    for (row = 4; row >= 0; row--) {
        for (col = 4; col >= 0; col--) {
            if (TILES[row][col] != null) {
                shiftOneTileRight(row, col);
            }
        }
    }
}
function shiftOneTileRight(row, col) {
    rightmostEmptyCol = reverseIndexOf(TILES[row], null);
    if (rightmostEmptyCol != -1 && rightmostEmptyCol > col) {
        moveTileToLocation(row, col, row, rightmostEmptyCol);
    }
}

function shiftTilesUp() {
    for (col = 0; col < 5; col++) {
        for (row = 0; row < 5; row++) {
            if (TILES[row][col] != null) {
                shiftOneTileUp(row, col);
            }
        }
    }
}
function shiftOneTileUp(row, col) {
    column = getColumnOfTiles(col)
    upmostEmptyRow = column.indexOf(null);
    if (upmostEmptyRow != -1 && upmostEmptyRow < row) {
        moveTileToLocation(row, col, upmostEmptyRow, col);
    }
}

function shiftTilesDown() {
    for (col = 4; col >= 0; col--) {
        for (row = 4; row >= 0; row--) {
            if (TILES[row][col] != null) {
                shiftOneTileDown(row, col);
            }
        }
    }
}
function shiftOneTileDown(row, col) {
    column = getColumnOfTiles(col)
    downmostEmptyRow = reverseIndexOf(column, null);
    if (downmostEmptyRow != -1 && downmostEmptyRow > row) {
        moveTileToLocation(row, col, downmostEmptyRow, col);
    }
}

function moveTileToLocation(oldRow, oldCol, newRow, newCol) {
    tile = TILES[oldRow][oldCol];
    TILES[oldRow][oldCol] = null;
    TILES[newRow][newCol] = tile;
    setTileTransform(tile, newRow, newCol);
    console.log(`tile (${oldRow}, ${oldCol}) shifted to (${newRow}, ${newCol})`);
}

window.onload = function(){
    x = randIntBetween(0, 5);
    y = randIntBetween(0, 5);
    createNewTileAt(x, y);

    window.addEventListener('keyup', function(event) {
        switch (event.key) {
            case "ArrowLeft":
                shiftTilesLeft();
                break;
            case "ArrowRight":
                shiftTilesRight();
                break;
            case "ArrowUp":
                shiftTilesUp();
                break;
            case "ArrowDown":
                shiftTilesDown();
                break;
        }
    });
}
