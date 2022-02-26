const SPACE_BETWEEN_TILES = 0.4;
const TILE_SIZE = 2.1;

function randIntBetween(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function createTile(x, y) {
    console.log(`creating tile at ${x}, ${y}`);
    tile = document.createElement("div");
    tile.className = "tile";
    tile.innerHTML = "A";
    // Adjust tile position via overloading style tag
    absX = TILE_SIZE * x + SPACE_BETWEEN_TILES * x + SPACE_BETWEEN_TILES;
    absY = TILE_SIZE * y + SPACE_BETWEEN_TILES * y + SPACE_BETWEEN_TILES;
    tile.style.transform = `translate(${absX}rem, ${absY}rem)`;
    grid = document.getElementsByClassName("tile-container")[0];
    grid.appendChild(tile);
}

window.onload = function(){
    x = randIntBetween(0, 5);
    y = randIntBetween(0, 5);
    createTile(x, y);
}
