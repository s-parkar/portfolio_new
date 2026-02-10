/**
 * SnakeGame.js - Retro ASCII Snake for Terminal
 */

export class SnakeGame {
    constructor(terminalOutput, onGameOver) {
        this.output = terminalOutput;
        this.onGameOver = onGameOver;

        this.width = 30;
        this.height = 15;
        this.score = 0;
        this.gameLoop = null;
        this.speed = 100;

        this.snake = [{ x: 5, y: 5 }];
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.food = this.spawnFood();

        this.gameContainer = null;
        this.isGameOver = false;
    }

    start() {
        // Create a specific container for the game to replace/update content
        this.gameContainer = document.createElement('div');
        this.gameContainer.className = 'game-container';
        this.gameContainer.style.fontFamily = 'monospace';
        this.gameContainer.style.whiteSpace = 'pre';
        this.gameContainer.style.lineHeight = '1.2';
        this.output.appendChild(this.gameContainer);

        this.gameLoop = setInterval(() => this.update(), this.speed);
        this.render();
    }

    handleInput(key) {
        if (this.isGameOver) {
            if (key === 'Enter') {
                this.stop();
                this.onGameOver(); // Exit back to terminal
            }
            return;
        }

        switch (key) {
            case 'ArrowUp':
                if (this.direction.y === 0) this.nextDirection = { x: 0, y: -1 };
                break;
            case 'ArrowDown':
                if (this.direction.y === 0) this.nextDirection = { x: 0, y: 1 };
                break;
            case 'ArrowLeft':
                if (this.direction.x === 0) this.nextDirection = { x: -1, y: 0 };
                break;
            case 'ArrowRight':
                if (this.direction.x === 0) this.nextDirection = { x: 1, y: 0 };
                break;
            case 'c': // Ctrl+C emulation
            case 'Escape':
                this.stop();
                this.onGameOver();
                break;
        }
    }

    update() {
        if (this.isGameOver) return;

        this.direction = this.nextDirection;

        const head = {
            x: this.snake[0].x + this.direction.x,
            y: this.snake[0].y + this.direction.y
        };

        // Collision detection (Walls)
        if (head.x < 0 || head.x >= this.width || head.y < 0 || head.y >= this.height) {
            this.gameOver();
            return;
        }

        // Collision detection (Self)
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOver();
            return;
        }

        this.snake.unshift(head);

        // Eat food
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.food = this.spawnFood();
            // Increase speed slightly
            if (this.speed > 50) {
                clearInterval(this.gameLoop);
                this.speed -= 2;
                this.gameLoop = setInterval(() => this.update(), this.speed);
            }
        } else {
            this.snake.pop();
        }

        this.render();
    }

    spawnFood() {
        let newFood;
        while (true) {
            newFood = {
                x: Math.floor(Math.random() * this.width),
                y: Math.floor(Math.random() * this.height)
            };
            // Check if food is on snake
            const onSnake = this.snake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
            if (!onSnake) break;
        }
        return newFood;
    }

    render() {
        let board = '';

        // Top Border
        board += '┌' + '─'.repeat(this.width) + '┐\n';

        for (let y = 0; y < this.height; y++) {
            board += '│';
            for (let x = 0; x < this.width; x++) {
                let char = ' ';

                // Snake
                const segmentIndex = this.snake.findIndex(s => s.x === x && s.y === y);
                if (segmentIndex !== -1) {
                    char = segmentIndex === 0 ? 'O' : 'o'; // Head vs Body
                }

                // Food
                if (this.food.x === x && this.food.y === y) {
                    char = '@';
                }

                board += char;
            }
            board += '│\n';
        }

        // Bottom Border
        board += '└' + '─'.repeat(this.width) + '┘\n';
        board += ` Score: ${this.score} | Controls: Arrow Keys | Exit: ESC`;

        this.gameContainer.textContent = board;

        // Scroll to keep game in view
        this.output.scrollTop = this.output.scrollHeight;
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
