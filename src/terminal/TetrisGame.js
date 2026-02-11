/**
 * TetrisGame.js - ASCII Tetris for Terminal
 */

export class TetrisGame {
    constructor(terminalOutput, onGameOver) {
        this.output = terminalOutput;
        this.onGameOver = onGameOver;

        this.width = 12; // 10 playable + 2 borders
        this.height = 20;
        this.score = 0;
        this.gameLoop = null;
        this.speed = 1000;

        this.board = [];
        this.currentPiece = null;
        this.gameContainer = null;
        this.isGameOver = false;

        this.initBoard();
        this.spawnPiece();
    }

    initBoard() {
        for (let y = 0; y < this.height; y++) {
            this.board[y] = Array(this.width).fill(0);
            // Walls
            this.board[y][0] = 1;
            this.board[y][this.width - 1] = 1;
            // Floor
            if (y === this.height - 1) {
                this.board[y].fill(1);
            }
        }
    }

    // Tetromino definitions
    get pieces() {
        return [
            [[1, 1, 1, 1]], // I
            [[1, 1], [1, 1]], // O
            [[0, 1, 0], [1, 1, 1]], // T
            [[1, 0, 0], [1, 1, 1]], // L
            [[0, 0, 1], [1, 1, 1]], // J
            [[0, 1, 1], [1, 1, 0]], // S
            [[1, 1, 0], [0, 1, 1]]  // Z
        ];
    }

    spawnPiece() {
        const shapes = this.pieces;
        const shape = shapes[Math.floor(Math.random() * shapes.length)];

        this.currentPiece = {
            shape: shape,
            x: Math.floor((this.width - shape[0].length) / 2),
            y: 0
        };

        // Check collision on spawn (Game Over)
        if (this.checkCollision(0, 0, this.currentPiece.shape)) {
            this.gameOver();
        }
    }

    start() {
        this.gameContainer = document.createElement('div');
        this.gameContainer.className = 'game-container';
        this.gameContainer.style.fontFamily = 'monospace';
        this.gameContainer.style.whiteSpace = 'pre';
        this.gameContainer.style.lineHeight = '1.2';
        this.gameContainer.style.color = '#00ffff'; // Cyan for sci-fi feel
        this.output.appendChild(this.gameContainer);

        this.gameLoop = setInterval(() => this.update(), this.speed);
        this.render();
    }

    handleInput(key) {
        if (this.isGameOver) {
            if (key === 'Enter') {
                this.stop();
                this.onGameOver();
            }
            return;
        }

        switch (key) {
            case 'ArrowLeft':
                if (!this.checkCollision(-1, 0)) this.currentPiece.x--;
                break;
            case 'ArrowRight':
                if (!this.checkCollision(1, 0)) this.currentPiece.x++;
                break;
            case 'ArrowDown':
                if (!this.checkCollision(0, 1)) this.currentPiece.y++;
                break;
            case 'ArrowUp':
                this.rotatePiece();
                break;
            case ' ': // Drop
                while (!this.checkCollision(0, 1)) {
                    this.currentPiece.y++;
                }
                this.lockPiece();
                break;
            case 'c':
            case 'Escape':
                this.stop();
                this.onGameOver();
                break;
        }
        this.render();
    }

    rotatePiece() {
        const shape = this.currentPiece.shape;
        const newShape = shape[0].map((_, i) => shape.map(row => row[i]).reverse());

        if (!this.checkCollision(0, 0, newShape)) {
            this.currentPiece.shape = newShape;
        }
    }

    checkCollision(offsetX, offsetY, shape = this.currentPiece.shape) {
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    const boardX = this.currentPiece.x + x + offsetX;
                    const boardY = this.currentPiece.y + y + offsetY;

                    if (boardY >= this.height || this.board[boardY] && this.board[boardY][boardX] !== 0) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    update() {
        if (this.isGameOver) return;

        if (!this.checkCollision(0, 1)) {
            this.currentPiece.y++;
        } else {
            this.lockPiece();
        }
        this.render();
    }

    lockPiece() {
        // Add piece to board
        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (this.currentPiece.shape[y][x]) {
                    const boardY = this.currentPiece.y + y;
                    const boardX = this.currentPiece.x + x;
                    if (boardY < this.height) {
                        this.board[boardY][boardX] = 2; // Locked block
                    }
                }
            }
        }

        // Check for cleared lines
        for (let y = this.height - 2; y >= 0; y--) {
            let rowFull = true;
            for (let x = 1; x < this.width - 1; x++) {
                if (this.board[y][x] === 0) rowFull = false;
            }

            if (rowFull) {
                // Remove row and move everything down
                this.board.splice(y, 1);
                this.board.unshift([1, ...Array(this.width - 2).fill(0), 1]);
                this.score += 100;
                y++; // Recheck same row index (now new row)
            }
        }

        this.spawnPiece();
    }

    render() {
        let display = '';

        // Render board
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                let cell = this.board[y][x];

                // Draw current piece
                if (this.currentPiece) {
                    const py = y - this.currentPiece.y;
                    const px = x - this.currentPiece.x;
                    if (py >= 0 && py < this.currentPiece.shape.length &&
                        px >= 0 && px < this.currentPiece.shape[0].length &&
                        this.currentPiece.shape[py][px]) {
                        cell = 2;
                    }
                }

                if (cell === 1) display += '│'; // Wall
                else if (cell === 2) display += '█'; // Block
                else display += ' '; // Empty
            }
            display += '\n';
        }

        // Footer
        display += `Score: ${this.score} | Rotate: UP | Drop: SPACE`;

        if (this.gameContainer) {
            this.gameContainer.textContent = display;
        }
    }

    gameOver() {
        this.isGameOver = true;
        clearInterval(this.gameLoop);
        this.gameContainer.textContent += '\n\n GAME OVER! Press ENTER to exit.';
    }

    stop() {
        clearInterval(this.gameLoop);
        if (this.gameContainer) {
            this.gameContainer.remove();
        }
    }
}
