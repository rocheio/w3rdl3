// Styling constants for moving the tiles with CSS transforms
const SPACE_BETWEEN_TILES = 0.275;
const TILE_SIZE = 2.1;

// The game space is a 5x5 grid of tiles that can not overlap
// Values are `null` when no tile exists or a <div> element
// This global is initialized on each window load
var TILES = []

// Each game tracks moves taken, a numerical score, and words scored with
const MAX_GAME_MOVES = 125;
var GAME_MOVES = 0;
var GAME_SCORE = 0;
var GAME_WORDS_SCORED = [];

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
function isLetter(value) {
    return value.length === 1 && value.match(/[a-z]/i);
}

function newTileGrid() {
    grid = new Array(5);
    for (var row = 0; row < 5; row++) {
        grid[row] = new Array(5);
        for (var col = 0; col < 5; col++) {
            grid[row][col] = null;
        }
    }
    return grid;
}

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

    document.getElementById("tile-container").appendChild(tile);
}

function setTileTransform(tile, row, col) {
    // Adjust tile position via overloading style tag
    absX = TILE_SIZE * row + SPACE_BETWEEN_TILES * row;
    absY = TILE_SIZE * col + SPACE_BETWEEN_TILES * col;
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
    if (TILES[row][col-1] == null) {
        moveTileToLocation(row, col, row, col-1);
    } else if (tilesMayCombine(row, col, row, col-1)) {
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
    if (TILES[row][col+1] == null) {
        moveTileToLocation(row, col, row, col+1);
    } else if (tilesMayCombine(row, col, row, col+1)) {
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
    if (columnValues[row-1] == null) {
        moveTileToLocation(row, col, row-1, col);
    } else if (tilesMayCombine(row, col, row-1, col)) {
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
    if (columnValues[row+1] == null) {
        moveTileToLocation(row, col, row+1, col);
    } else if (tilesMayCombine(row, col, row+1, col)) {
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
    if (coords == null) {
        triggerGameOverModal();
        return;
    }
    value = Math.random() < 0.5 ? "A" : "B";
    createNewTileAt(coords[0], coords[1], value);
}

function triggerPostActionSequence() {
    // Roll a chance to spawn a new A or B tile in empty space
    newSquareSpawnChance = 0.4;
    if (Math.random() < newSquareSpawnChance) {
        spawnNewTileAtRandomEmptyLocation();
    }
    // Decrease the move counter and end the game when it hits zero
    GAME_MOVES -= 1;
    updateMoveCountUI();
    if (GAME_MOVES == 0) {
        triggerGameOverModal();
    }
}

function toggleWordInputField() {
    elem = document.getElementById("word-input");

    if (document.activeElement != elem) {
        elem.focus();
        return;
    }

    // Normalize the WORD so we only need to check upper case
    word = elem.value.trim().toUpperCase();

    if (word.length == 5
            && validWordOnGameBoard(word)
            && FIVE_LETTER_WORDS.includes(word.toLowerCase())) {
        // Successful word!
        console.log(`Valid 5-letter word in game board: '${word}'`);
        GAME_SCORE += 1;
        updateScoreUI();
        GAME_WORDS_SCORED.push(word)
    } else {
        // TODO: Shake red to indicate error
        console.log(`Invalid 5-letter word in game board: '${word}'`);
    }

    elem.value = '';
    elem.blur();
}

function letterCountsOnGameBoard() {
    // Return a map of all letters on the game board to their counts
    var allLetters = {};
    for (var row = 0; row < 5; row++) {
        for (var col = 0; col < 5; col++) {
            if (TILES[row][col] == null) continue;

            letter = TILES[row][col].innerHTML;
            if (allLetters[letter] == undefined) {
                allLetters[letter] = 0;
            }
            allLetters[letter] += 1;
        }
    }
    return allLetters;
}

function letterCountsOfWord(word) {
    var allLetters = {};
    for (var i = 0; i < word.length; i++) {
        letter = word[i];
        if (allLetters[letter] == undefined) {
            allLetters[letter] = 0;
        }
        allLetters[letter] += 1;
    }
    return allLetters;
}

function validWordOnGameBoard(word) {
    // Return True if word is 5 letters, in the dictionary, and contiguous on the board
    var allLetters = letterCountsOnGameBoard();
    var wordLetters = letterCountsOfWord(word);
    // console.log(`All letters on board: ${Object.keys(allLetters)} vs input: ${Object.keys(wordLetters)}`);
    for (letter in wordLetters) {
        if (allLetters[letter] == undefined || wordLetters[letter] > allLetters[letter]) {
            return false;
        }
    }
    return true;
}

function preventDefaultKeydownActions() {
    // Prevents scrolling actions of arrow keys in this app
    window.addEventListener("keydown", function(e) {
        if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
            e.preventDefault();
        }
    }, false);
}

function bindAppKeyEvents() {
    window.addEventListener('keyup', function(event) {
        if (event.key == "ArrowLeft") {
            shiftTilesLeft();
            triggerPostActionSequence();
            return;
        }
        if (event.key == "ArrowRight") {
            shiftTilesRight();
            triggerPostActionSequence();
            return;
        }
        if (event.key == "ArrowUp") {
            shiftTilesUp();
            triggerPostActionSequence();
            return;
        }
        if (event.key == "ArrowDown") {
            shiftTilesDown();
            triggerPostActionSequence();
            return;
        }
        if (event.key == "Enter") {
            toggleWordInputField();
            return;
        }
    });

    // Detect alphabet keys typed when word input is not active
    // NOTE: Detect at the full PRESS level to avoid i.e. "ctrl+r" reloads from inputting
    window.addEventListener('keypress', function(event) {
        if (isLetter(event.key)) {
            inputField = document.getElementById("word-input");
            if (document.activeElement != inputField) {
                inputField.focus()
                inputField.value += event.key
            }
        }
    });
}

function updateMoveCountUI() {
    // TODO: On 25 turn yellow and 5 turn red, normal is black?
    document.getElementById("moves-value").innerHTML = GAME_MOVES;
}

function updateScoreUI() {
    // TODO: On increase some sort of nice animation
    document.getElementById("score-value").innerHTML = GAME_SCORE;
}

function resetGameStateToStartingPoint() {
    TILES = newTileGrid();
    GAME_MOVES = MAX_GAME_MOVES;
    GAME_SCORE = 0;
    GAME_WORDS_SCORED = [];
    updateMoveCountUI();
    updateScoreUI();
    hideAllModals();
    document.getElementById("tile-container").innerHTML = "";
    spawnNewTileAtRandomEmptyLocation();
}

function triggerGameOverModal() {
    // Show a summary of the score / moves in this game
    wordPlurality = GAME_SCORE == 1 ? "word" : "words";
    message = `${GAME_SCORE} ${wordPlurality} in ${MAX_GAME_MOVES} moves`;
    document.getElementById("game-over-summary").innerHTML = message;
    // Show a "word cloud" of all the words scored in this game
    document.getElementById("game-over-word-list").innerHTML = "";
    for (var i = 0; i < GAME_WORDS_SCORED.length; i++) {
        elem = document.createElement("div");
        elem.className = "game-over-word";
        elem.innerHTML = GAME_WORDS_SCORED[i];
        document.getElementById("game-over-word-list").appendChild(elem);
    }
    // Unhide the modal
    document.getElementById("modal-game-over").style.display = "flex";
}

function hideAllModals() {
    document.getElementById("modal-game-over").style.display = "none";
    document.getElementById("modal-instructions").style.display = "none";
}

window.onload = function(){
    preventDefaultKeydownActions();
    bindAppKeyEvents();
    document.getElementById("button-new-game").addEventListener("click", function(){
        resetGameStateToStartingPoint();
    });
    resetGameStateToStartingPoint();
}

// TODO: "Random 25 turns" button
// TODO: CSS `Z` tile should have like a red color / border?
// CSS: Vowels should have some pretty border to call em out?
// TODO: `Share` button on the game over screen with emojis and shit
// `w3rdl3.com - 25 words in 125 moves - :finger_guns:`
