/**
 * SpaceInvaders.js - Retro Terminal Space Shooter
 */

export class SpaceInvaders {
    constructor(terminalOutput, onGameOver) {
        this.output = terminalOutput;
        this.onGameOver = onGameOver;

        this.width = 30;
        this.height = 15;
        this.score = 0;
        this.gameLoop = null;
        this.speed = 100;

        this.player = { x: Math.floor(this.width / 2) };
        this.bullets = []; // {x, y}
        this.enemies = []; // {x, y}
        this.enemyDirection = 1;
        this.enemyMoveTimer = 0;
        this.enemyMoveInterval = 5; // Move enemies every 5 frames

        this.gameContainer = null;
        this.isGameOver = false;

        this.spawnEnemies();
    }

    spawnEnemies() {
        for (let y = 0; y < 4; y++) {
            for (let x = 2; x < this.width - 2; x += 3) {
                this.enemies.push({ x, y });
            }
        }
    }

    start() {
        this.gameContainer = document.createElement('div');
        this.gameContainer.className = 'game-container';
        this.gameContainer.style.fontFamily = 'monospace';
        this.gameContainer.style.whiteSpace = 'pre';
        this.gameContainer.style.lineHeight = '1.2';
        this.gameContainer.style.color = '#33ff33';
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
                if (this.player.x > 0) this.player.x--;
                break;
            case 'ArrowRight':
                if (this.player.x < this.width - 1) this.player.x++;
                break;
            case ' ': // Spacebar to shoot
                this.bullets.push({ x: this.player.x, y: this.height - 2 });
                break;
            case 'c':
            case 'Escape':
                this.stop();
                this.onGameOver();
                break;
        }
    }

    update() {
        if (this.isGameOver) return;

        // Move bullets
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            this.bullets[i].y--;
            if (this.bullets[i].y < 0) {
                this.bullets.splice(i, 1);
            }
        }

        // Move enemies
        this.enemyMoveTimer++;
        if (this.enemyMoveTimer >= this.enemyMoveInterval) {
            this.enemyMoveTimer = 0;
            let moveDown = false;

            // Check limits safely
            if (this.enemies.length > 0) {
                const leftMost = Math.min(...this.enemies.map(e => e.x));
                const rightMost = Math.max(...this.enemies.map(e => e.x));

                if ((rightMost >= this.width - 2 && this.enemyDirection === 1) ||
                    (leftMost <= 1 && this.enemyDirection === -1)) {
                    this.enemyDirection *= -1;
                    moveDown = true;
                }
            }

            this.enemies.forEach(e => {
                if (moveDown) {
                    e.y++;
                } else {
                    e.x += this.enemyDirection;
                }
            });

            // Game Over if enemies reach bottom
            if (this.enemies.some(e => e.y >= this.height - 2)) {
                this.gameOver();
                return;
            }
        }

        // Collision Detection
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const b = this.bullets[i];
            const hitIndex = this.enemies.findIndex(e => e.x === b.x && e.y === b.y);

            if (hitIndex !== -1) {
                this.enemies.splice(hitIndex, 1);
                this.bullets.splice(i, 1);
                this.score += 10;

                // Win condition / Level up
                if (this.enemies.length === 0) {
                    this.levelUp();
                }
            }
        }

        // Collision with player
        if (this.enemies.some(e => e.x === this.player.x && e.y === this.height - 1)) {
            this.gameOver();
            return;
        }

        this.render();
    }

    levelUp() {
        this.score += 100;
        this.enemyMoveInterval = Math.max(1, this.enemyMoveInterval - 1);
        this.spawnEnemies();
    }

    render() {
        let board = '';
        // Top Border
        board += '╔' + '═'.repeat(this.width) + '╗\n';

        for (let y = 0; y < this.height; y++) {
            board += '║';
            for (let x = 0; x < this.width; x++) {
                let char = ' ';

                // Player
                if (y === this.height - 1 && x === this.player.x) {
                    char = '^';
                }

                // Beams/Bullets - prioritize over player check if overlapping (shouldn't happen but good for safety)
                else if (this.bullets.some(b => b.x === x && b.y === y)) {
                    char = '|';
                }

                // Enemies
                else if (this.enemies.some(e => e.x === x && e.y === y)) {
                    char = 'W';
                }

                board += char;
            }
            board += '║\n';
        }

        // Bottom Border
        board += '╚' + '═'.repeat(this.width) + '╝\n';
        board += ` Score: ${this.score} | ←/→ Move | SPACE Shoot | ESC Exit`;

        if (this.gameContainer) {
            this.gameContainer.textContent = board;
        }

        // Ensure scrolling works
        if (this.output) {
            this.output.scrollTop = this.output.scrollHeight;
        }
    }

    gameOver() {
        this.isGameOver = true;
        clearInterval(this.gameLoop);
        this.gameContainer.textContent += '\n\n GAME OVER! Press ENTER to exit.';
        this.output.scrollTop = this.output.scrollHeight;
    }

    stop() {
        clearInterval(this.gameLoop);
        if (this.gameContainer) {
            this.gameContainer.remove();
        }
    }
}
