const SPACE_BETWEEN_TILES = 0.4;
const TILE_SIZE = 2.1;

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

function randIntBetween(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function createTile(row, col) {
    console.log(`creating tile at row ${row} col ${col}`);
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
    console.log("shiftTilesLeft");
    // NOTE: Left operation needs to shift from 0 -> inf
    for (row = 0; row < 5; row++) {
        for (col = 0; col < 5; col++) {
            if (TILES[row][col] != null) {
                shiftOneTileLeft(row, col);
            }
        }
    }
}

function shiftOneTileLeft(row, col) {
    tile = TILES[row][col];
    firstEmpty = leftmostEmptyColInRow(row);
    if (firstEmpty == -1) {
        console.log("no room to shift, no action needed");
        return;
    }
    TILES[row][col] = null;
    TILES[row][firstEmpty] = tile;
    
    setTileTransform(tile, row, firstEmpty);
    console.log(row, col, firstEmpty)
}


function leftmostEmptyColInRow(x) {
    return TILES[x].indexOf(null);
}

window.onload = function(){
    x = randIntBetween(0, 5);
    y = randIntBetween(0, 5);
    createTile(x, y);

    window.addEventListener('keyup', function(event) {
        switch (event.key) {
            case "ArrowLeft":
                shiftTilesLeft();
                break;
            case "ArrowRight":
                // Right pressed
                break;
            case "ArrowUp":
                // Up pressed
                break;
            case "ArrowDown":
                // Down pressed
                break;
        }
    });
}
