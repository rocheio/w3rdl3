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
function addLetters(l1, l2) {
    // Add two letters together using alphanumerics. Return `null` if more than 26 (Z)
    charCodeOffset = 64 // "A" == 65, lets use A=1 and Z=26
    cc1 = l1.charCodeAt(0) - charCodeOffset
    cc2 = l2.charCodeAt(0) - charCodeOffset
    if (cc1 + cc2 > 26) return null;
    return String.fromCharCode(cc1 + cc2 + charCodeOffset);
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

function createNewTileAt(row, col, value) {
    // console.log(`creating tile (${row}, ${col})`);
    var tile = document.createElement("div");
    tile.innerHTML = value;
    tile.className = "tile";
    if (value == "A") {
        tile.className += " tile-a";
    } else if (value == "B") {
        tile.className += " tile-b";
    }

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

function tilesMayCombine(rowSrc, colSrc, rowDest, colDest) {
    // Return true if a two tiles may be legally combined
    // console.log(`tile (${row}, ${col}) checking at (${row}, ${collidesAt})`);
    l1 = TILES[rowSrc][colSrc].innerHTML;
    l2 = TILES[rowDest][colDest].innerHTML;

    // `A` tiles do not combine together
    if (l1 == "A" && l2 == "A") return false;
    // `B` tiles do not combine together
    if (l1 == "B" && l2 == "B") return false;
    // Higher-order tiles do not combine together
    // TODO: SHOULD we allow higher value letters to combine?
    if (l1 != "A" && l1 != "B" && l2 != "A" && l2 != "B") return false;
    // Tiles that sum to more than `Z` cannot be combined
    if (addLetters(l1, l2) == null) return false;
    // TODO: If either tile has been combined already return false
    // (temp set in memory of `tilesCombinedThisTurn` that resets in post-op)
    return true;
}

function combineTiles(rowSrc, colSrc, rowDest, colDest) {
    // Combine a source tile with a destination tile at the destination
    // console.log(`tile (${row}, ${col}) combining at (${row}, ${collidesAt})`);
    tileSrc = TILES[rowSrc][colSrc];
    tileDest = TILES[rowDest][colDest];

    tileDest.innerHTML = addLetters(tileSrc.innerHTML, tileDest.innerHTML);

    // Only the base A and B tiles have special classes, strip those off
    if (tileDest.className.indexOf("tile-a") != -1
            || tileDest.className.indexOf("tile-b") != -1) {
        tileDest.className = "tile";
    }

    // Delete the old source tile
    TILES[rowSrc][colSrc] = null;
    tileSrc.remove();
}

function shiftTilesLeft() {
    for (row = 0; row < 5; row++) {
        for (col = 0; col < 5; col++) {
            if (TILES[row][col] != null) {
                shiftSingleTileLeft(row, col);
            }
        }
    }
}
function shiftSingleTileLeft(row, col) {
    if (col == 0) return;
    rowValues = TILES[row];

    // Prefer moving to empty space
    leftmostEmptyCol = rowValues.indexOf(null);
    if (leftmostEmptyCol != -1 && leftmostEmptyCol < col) {
        moveTileToLocation(row, col, row, leftmostEmptyCol);
        return;
    }

    // Combine with adjacent tile if unable to move
    if (tilesMayCombine(row, col, row, col-1)) {
        combineTiles(row, col, row, col-1);
    }
}

function shiftTilesRight() {
    for (row = 4; row >= 0; row--) {
        for (col = 4; col >= 0; col--) {
            if (TILES[row][col] != null) {
                shiftSingleTileRight(row, col);
            }
        }
    }
}
function shiftSingleTileRight(row, col) {
    if (col == 4) return;
    rowValues = TILES[row];

    // Prefer moving to empty space
    rightmostEmptyCol = reverseIndexOf(rowValues, null);
    if (rightmostEmptyCol != -1 && rightmostEmptyCol > col) {
        moveTileToLocation(row, col, row, rightmostEmptyCol);
        return;
    }

    // Combine with adjacent tile if unable to move
    if (tilesMayCombine(row, col, row, col+1)) {
        combineTiles(row, col, row, col+1);
    }
}

function shiftTilesUp() {
    for (col = 0; col < 5; col++) {
        for (row = 0; row < 5; row++) {
            if (TILES[row][col] != null) {
                shiftSingleTileUp(row, col);
            }
        }
    }
}
function shiftSingleTileUp(row, col) {
    if (row == 0) return;
    columnValues = getColumnOfTiles(col)

    // Prefer moving to empty space
    upmostEmptyRow = columnValues.indexOf(null);
    if (upmostEmptyRow != -1 && upmostEmptyRow < row) {
        moveTileToLocation(row, col, upmostEmptyRow, col);
        return;
    }

    // Combine with adjacent tile if unable to move
    if (tilesMayCombine(row, col, row-1, col)) {
        combineTiles(row, col, row-1, col);
    }
}

function shiftTilesDown() {
    for (col = 4; col >= 0; col--) {
        for (row = 4; row >= 0; row--) {
            if (TILES[row][col] != null) {
                shiftSingleTileDown(row, col);
            }
        }
    }
}
function shiftSingleTileDown(row, col) {
    if (row == 4) return;
    columnValues = getColumnOfTiles(col)

    // Prefer moving to empty space
    downmostEmptyRow = reverseIndexOf(columnValues, null);
    if (downmostEmptyRow != -1 && downmostEmptyRow > row) {
        moveTileToLocation(row, col, downmostEmptyRow, col);
        return;
    }

    // Combine with adjacent tile if unable to move
    if (tilesMayCombine(row, col, row+1, col)) {
        combineTiles(row, col, row+1, col);
    }
}

function moveTileToLocation(oldRow, oldCol, newRow, newCol) {
    tile = TILES[oldRow][oldCol];
    TILES[oldRow][oldCol] = null;
    TILES[newRow][newCol] = tile;
    setTileTransform(tile, newRow, newCol);
    // console.log(`tile (${oldRow}, ${oldCol}) shifted to (${newRow}, ${newCol})`);
}

function randomEmptyLocationInGrid() {
    // Return random (row, col) coordinates of an empty space in the grid.
    // Return null if no such location exists
    emptySpaces = []
    for (var row = 0; row < 5; row++) {
        for (var col = 0; col < 5; col++) {
            if (TILES[row][col] == null) {
                emptySpaces.push([row, col]);
            }
        }
    }
    if (emptySpaces.length == 0) {
        return null;
    }
    randIndex = Math.floor(Math.random() * emptySpaces.length);
    return emptySpaces[randIndex];
}

function spawnNewTileAtRandomEmptyLocation() {
    coords = randomEmptyLocationInGrid();
    // TODO: Reset game, etc.
    if (coords == null) {
        alert("Game over");
        return;
    }
    value = Math.random() < 0.5 ? "A" : "B";
    createNewTileAt(coords[0], coords[1], value);
}

function triggerPostActionSequence() {
    // Roll a chance to spawn a new A or B tile in empty space
    newSquareSpawnChance = 0.3;
    if (Math.random() < newSquareSpawnChance) {
        spawnNewTileAtRandomEmptyLocation();
    }
}

window.onload = function(){
    spawnNewTileAtRandomEmptyLocation();
    window.addEventListener('keyup', function(event) {
        switch (event.key) {
            case "ArrowLeft":
                shiftTilesLeft();
                triggerPostActionSequence();
                break;
            case "ArrowRight":
                shiftTilesRight();
                triggerPostActionSequence();
                break;
            case "ArrowUp":
                shiftTilesUp();
                triggerPostActionSequence();
                break;
            case "ArrowDown":
                shiftTilesDown();
                triggerPostActionSequence();
                break;
        }
    });
}
