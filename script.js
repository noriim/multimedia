window.onload = function() {
    // Canvas beállítása
    let canvas = document.getElementById('gameCanvas');
    let ctx = canvas.getContext('2d');
    let backgroundMusic = document.getElementById('backgroundMusic');
    backgroundMusic.volume = 0.25;
    let removeSound = document.getElementById('removeSound');
    removeSound.volume = 0.25;
    function playRemoveSound() {
        removeSound.play();
    }
    let gameStarted = false;
    let gameRunning = false;
    let firstClickAfterStart = false;
    let clickCount = 0;
    let newRowNeeded = false;
    let gameInterval;

    window.startGame = function () {
        firstClickAfterStart = true;
        gameRunning = true;
        gameInterval = setInterval(updateGame, 1000);
    }

    // Játékállapot
    window.game = {
        score: 0,
        time: 0,
        powerups: [],
        grid: [],
    };

    // Rajzoljuk meg a "Play" gombot
    function drawPlayButton() {
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, canvas.height / 3);
        ctx.lineTo(canvas.width / 2 + 50, canvas.height / 2);
        ctx.lineTo(canvas.width / 2, canvas.height / 3 * 2);
        ctx.closePath();
        ctx.stroke();
    }

    drawPlayButton();

    // Karakter képének betöltése
    let characterImage = new Image();
    characterImage.onload = function() {
        // A kép betöltődött, most már használható a drawImage függvényben
    };
    characterImage.src = 'character.png';

    // Karakter állapota
    let character = {
        position: { x: 0, y: canvas.height - 60 },
        heldBlocks: []
    };

    // Egérpozíció nyomon követése
    canvas.addEventListener('mousemove', function(event) {
        let rect = canvas.getBoundingClientRect();
        let mouseX = event.clientX - rect.left;
        if (gameStarted) {
            character.position.x = Math.floor(mouseX / 80) * 80 + 40 - characterImage.width * (60 / characterImage.height) / 2;
            drawGame(); // Rajzolja újra a játékot az egér mozgásával
        }
    }, false);

    // Egérkattintás-eseménykezelő
    canvas.addEventListener('click', function(event) {
        let rect = canvas.getBoundingClientRect();
        let mouseX = event.clientX - rect.left;
        let column = Math.floor(mouseX / 80); // Az oszlop, amelyben az egér van
        if (!gameStarted) {
            // Háttérzene lejátszása
            backgroundMusic.play();
            gameStarted = true;
            startGame();
        } else if (gameStarted && firstClickAfterStart) {
            clickCount++;
            if (clickCount === 10) {
                newRowNeeded = true;
                clickCount = 0;
            }
            if (character.heldBlocks.length > 0) {
                // Ha a karakter tart blokkokat, akkor rakja le őket
                for (let i = 0; i < 17; i++) { // Kezdjük a felső sorral
                    if (!game.grid[i][column]) {
                        // Ha a cella üres, akkor ide rakjuk le a blokkot
                        let block = character.heldBlocks.pop();
                        block.y = i;
                        game.grid[i][column] = block;
                        if (character.heldBlocks.length === 0) {
                            break;
                        }
                    }
                }
            } else {
                // Ha a karakter nem tart blokkokat, akkor vegyen fel néhányat
                let colorToPickUp = null;
                for (let i = 16; i >= 0; i--) { // Kezdjük az alsó sorral
                    let block = game.grid[i][column];
                    if (block && (!colorToPickUp || block.color === colorToPickUp)) { // Ha a cella nem üres, és ugyanolyan színű, mint a felveendő blokkok, akkor vegyük fel a blokkot
                        character.heldBlocks.push(block);
                        game.grid[i][column] = null;
                        colorToPickUp = block.color;
                    } else if (colorToPickUp) {
                        // Ha már felvettünk egy blokkot, és a következő blokk más színű, akkor álljunk le
                        break;
                    }
                }
            }
            while (removeBlocks()) {
                updateGrid();
            }

            drawGame();
        }
    }, false);

    // Rács inicializálása
    for (let i = 0; i < 17; i++) { // 17 sor
        game.grid[i] = [];
        for (let j = 0; j < 10; j++) { // 10 oszlop
            game.grid[i][j] = null;
        }
    }

    // Alap blokkok hozzáadása
    for (let i = 0; i < 5; i++) { // 5 sor
        for (let j = 0; j < 10; j++) {
            let block = {
                x: j,
                y: i,
                color: getRandomColor(),
            };
            game.grid[block.y][block.x] = block;
        }
    }

    // Véletlenszerű szín generálása
    function getRandomColor() {
        let colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#00FFFF', '#FF00FF', '#FFA500'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    
    let blocksToRemove = [];

// Animáció kezelése
    function handleAnimations() {
        for (let i = 0; i < blocksToRemove.length; i++) {
            let block = blocksToRemove[i];
            block.opacity -= 0.5;
            if (block.opacity <= 0) {
                // Ha a blokk teljesen átlátszóvá vált, távolítsuk el a tömbből
                blocksToRemove.splice(i, 1);
                i--;
            }
        }
    }

// Játék rajzolása
    function drawGame() {
        // Törölje a vásznat
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Rajzolja ki a pontszámot
        ctx.fillStyle = 'black';
        ctx.font = '40px Arial';
        ctx.fillText('Pontszám: ' + game.score, 10, 40);

        // Rajzolja ki az eltelt időt
        let minutes = Math.floor(game.time / 60);
        let seconds = game.time % 60;
        ctx.fillText('Eltelt idő: ' + minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0'), canvas.width - 290, 40);

        // Rajzolja ki a blokkokat
        for (let i = 0; i < 17; i++) {
            for (let j = 0; j < 10; j++) {
                let block = game.grid[i][j];
                if (block) {
                    ctx.fillStyle = block.color;
                    ctx.fillRect(j * 80, (i * 30) + 50, 80, 30); 
                } else if (j === Math.floor(character.position.x / 80)) {
                    ctx.fillStyle = '#CCCCCC'; // Szürkés árnyalat
                    ctx.fillRect(j * 80, (i * 30) + 50, 80, canvas.height); 
                }
            }
        }

        // Rajzolja ki az eltávolítandó blokkokat
        for (let i = 0; i < blocksToRemove.length; i++) {
            let block = blocksToRemove[i];
            ctx.fillStyle = block.color; // A helyes szín használata (ez nem nagyon működik for some reason :c)
            ctx.globalAlpha = block.opacity / 5.0; // Beállítjuk az átlátszóságot
            ctx.fillRect(block.x * 80, (block.y * 30) + 50, 80, 30); 
        }
        ctx.globalAlpha = 1; // Állítsuk vissza az átlátszóságot az alapértelmezett értékre csak itt

        // Rajzolja ki a karaktert és a tartott blokkokat
        let y = character.position.y;
        for (let i = character.heldBlocks.length - 1; i >= 0; i--) {
            let block = character.heldBlocks[i];
            ctx.fillStyle = block.color;
            ctx.fillRect(character.position.x, y, characterImage.width * (60 / characterImage.height), 30);
            y -= 30;
        }
        ctx.drawImage(characterImage, character.position.x, character.position.y, characterImage.width * (60 / characterImage.height), 60);
    }

// Szomszédos blokkok ellenőrzése
    function checkNeighbors(x, y, color, visited) {
        if (x < 0 || x > 9 || y < 0 || y > 16 || game.grid[y][x] === null || game.grid[y][x].color !== color || visited[y][x]) {
            return [];
        }
        visited[y][x] = true;
        let blocks = [{x: x, y: y}];
        blocks = blocks.concat(checkNeighbors(x-1, y, color, visited));
        blocks = blocks.concat(checkNeighbors(x+1, y, color, visited));
        blocks = blocks.concat(checkNeighbors(x, y-1, color, visited));
        blocks = blocks.concat(checkNeighbors(x, y+1, color, visited));
        return blocks;
    }

// Blokkok törlése
    function removeBlocks() {
        let removed = false;
        for (let i = 0; i < 17; i++) {
            for (let j = 0; j < 10; j++) {
                let block = game.grid[i][j];
                if (block) {
                    let visited = new Array(17).fill(false).map(() => new Array(10).fill(false));
                    let blocks = checkNeighbors(j, i, block.color, visited);
                    if (blocks.length >= 4) {
                        for (let k = 0; k < blocks.length; k++) {
                            blocks[k].opacity = 1;
                            blocksToRemove.push(blocks[k]);
                            game.grid[blocks[k].y][blocks[k].x] = null;
                        }
                        game.score += blocks.length;
                        removed = true;
                        playRemoveSound();
                    }
                }
            }
        }
        return removed;
    }


// Rács frissítése
    function updateGrid() {
        for (let j = 0; j < 10; j++) {
            let column = [];
            for (let i = 16; i >= 0; i--) {
                if (game.grid[i][j] !== null) {
                    column.unshift(game.grid[i][j]);
                }
            }
            while (column.length < 17) {
                column.push(null);
            }
            for (let i = 0; i < 17; i++) {
                game.grid[i][j] = column[i];
            }
        }
    }


// Játék frissítése
    function updateGame() {
        if (!gameRunning) {
            return;
        }
        game.time++;
        // Csak akkor adjunk hozzá új sort, ha a clickek száma kigyűlt
        if (newRowNeeded) {
            // Új sor hozzáadása a rács tetejére
            let newRow = [];
            for (let j = 0; j < 10; j++) {
                let block = {
                    x: j,
                    y: 0,
                    color: getRandomColor(),
                };
                newRow[j] = block;
            }
            game.grid.unshift(newRow);

            // A rács alján lévő sor eltávolítása, ha a rács túl nagy (game over miatt nem igazán számít már, de bent hagyom biztonság kedvéért)
            if (game.grid.length > 17) {
                game.grid.pop();
            }
            newRowNeeded = false;
        }

        // Blokkok pozíciójának frissítése
        for (let i = 0; i < 17; i++) {
            for (let j = 0; j < 10; j++) {
                let block = game.grid[i][j];
                if (block) {
                    block.y = i; // A blokkok pozíciójának frissítése a rácsban
                }
            }
        }
        while (removeBlocks()) {
            updateGrid();
        }
        handleAnimations();
        drawGame();
        
        for (let j = 0; j < 10; j++) {
            if (game.grid[16][j] !== null) {
                gameOver();
                break;
            }
        }
    }
// Játék vége
    function gameOver() {
        gameStarted = false;
        gameRunning = false;
        firstClickAfterStart = false;
        canvas.style.display = 'none';
        displayLeaderboard();
        document.getElementById('playAgainButton').style.display = 'block';
        document.getElementById('endScreen').style.display = 'block';
    }

    window.saveScore = function (name, score) {
        // Leaderboard lekérése
        let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];

        // Score check
        for (let i = 0; i < leaderboard.length; i++) {
            if (leaderboard[i].name === name && leaderboard[i].score === score) {
                // Ha már létező score, nem rakjuk be
                return;
            }
        }

        // Score hozzáadása
        leaderboard.push({name: name, score: score});

        // Score alapú sort
        leaderboard.sort((a, b) => b.score - a.score);

        // Leaderboard mentése
        localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
    }


    window.displayLeaderboard = function () {
        // Leaderboard lekérése
        let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];

        // Leaderboard HTML készítése
        let leaderboardHTML = '';
        leaderboard.forEach((entry, index) => {
            leaderboardHTML += (index + 1) + '. ' + entry.name + ': ' + entry.score + '<br>';
        });

        // Display leaderboard
        document.getElementById('leaderboard').innerHTML = leaderboardHTML;

        // Show play again button
        document.getElementById('playAgainButton').style.display = 'block';
    }

    window.resetGame = function () {
        clearInterval(gameInterval); // Töröljük az előző időzítőt
        // Játék újrainicializálása
        game = {
            score: 0,
            time: 0,
            powerups: [],
            grid: []
        };

        // Karakter újrainicializálása
        character = {
            position: {x: 0, y: canvas.height - 60},
            heldBlocks: []
        };

        // Rács újrainicializálása
        for (let i = 0; i < 17; i++) {
            game.grid[i] = [];
            for (let j = 0; j < 10; j++) {
                game.grid[i][j] = null;
            }
        }

        // Alap blokkok hozzáadása megint
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 10; j++) {
                let block = {
                    x: j,
                    y: i,
                    color: getRandomColor(),
                };
                game.grid[block.y][block.x] = block;
            }
        }

        document.getElementById('endScreen').style.display = 'none';
        document.getElementById('playAgainButton').style.display = 'none';

        canvas.style.display = 'block';

        gameStarted = true;
        startGame();
    }
};