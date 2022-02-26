const SPACE_BETWEEN_TILES = 0.4;
const TILE_SIZE = 2.1;

// The game space is a 5x5 grid of tiles that can not overlap
var TILES = new Array(5);
for (var i = 0; i < 5; i++) {
    TILES[i] = new Array(5);
}

function randIntBetween(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function createTile(x, y) {
    console.log(`creating tile at ${x}, ${y}`);
    var tile = document.createElement("div");
    tile.className = "tile";
    tile.innerHTML = "A";
    
    // Adjust tile position via overloading style tag
    absX = TILE_SIZE * x + SPACE_BETWEEN_TILES * x + SPACE_BETWEEN_TILES;
    absY = TILE_SIZE * y + SPACE_BETWEEN_TILES * y + SPACE_BETWEEN_TILES;
    
    TILES[x][y] = tile;
    tile.style.transform = `translate(${absX}rem, ${absY}rem)`;

    grid = document.getElementsByClassName("tile-container")[0];
    grid.appendChild(tile);
}

function shiftTilesLeft() {
    console.log("shiftTilesLeft");
    TILES.forEach(row => {
        row.forEach(elem => {
            console.log(elem);
        })
    });
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
