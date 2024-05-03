// Játékállapot
var game = {
    score: 0,
    time: 0,
    powerups: [],
    grid: [], // A rács, amely a blokkokat tárolja
    // ...
};

// Játék indítása
function startGame() {
    // Rács inicializálása
    for (var i = 0; i < 10; i++) { // 10 sor
        game.grid[i] = [];
        for (var j = 0; j < 10; j++) { // 10 oszlop
            game.grid[i][j] = null;
        }
    }

    // Időzítő beállítása
    setInterval(updateGame, 1000);
}

// Blokkok frissítése
function updateBlocks() {
    // Új blokk hozzáadása véletlenszerűen
    if (Math.random() < 0.1) {
        var block = {
            x: Math.floor(Math.random() * 10), // Véletlenszerű oszlop
            y: 0, // Az első sor
            color: getRandomColor(), // Véletlenszerű szín kiválasztása
        };
        game.grid[block.y][block.x] = block;
    }

    // Blokkok mozgatása
    for (var i = 0; i < 10; i++) {
        for (var j = 0; j < 10; j++) {
            var block = game.grid[i][j];
            if (block) {
                block.y++; // A blokkok lefelé mozgatása 1 sorral

                // Blokk eltávolítása, ha elérte az alját
                if (block.y >= 10) {
                    game.grid[i][j] = null;
                }
            }
        }
    }
}

// Játék rajzolása
function drawGame() {
    // Törölje a vásznat
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Rajzolja ki a blokkokat
    for (var i = 0; i < 10; i++) {
        for (var j = 0; j < 10; j++) {
            var block = game.grid[i][j];
            if (block) {
                ctx.fillStyle = block.color;
                ctx.fillRect(block.x * 20, block.y * 20, 20, 20); // A blokk mérete 20 pixel
            }
        }
    }

    // Rajzolja ki a pontszámot
    ctx.fillStyle = 'black';
    ctx.fillText('Pontszám: ' + game.score, 10, 20);
}

