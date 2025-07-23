/**
 * 贪吃蛇游戏类
 */
class Snake {
    /**
     * 初始化游戏
     * @param {HTMLCanvasElement} canvas - 游戏画布元素
     */
    constructor(canvas) {
        this.initializeCanvases(canvas);
        this.initializeGameState(canvas);
        this.loadAssets();
        this.bindControls(); // 绑定控制事件
    }

    // 初始化画布
    initializeCanvases(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // 初始化左右文字画布
        this.leftCanvas = document.getElementById('left-text');
        this.rightCanvas = document.getElementById('right-text');
        this.leftCtx = this.leftCanvas.getContext('2d');
        this.rightCtx = this.rightCanvas.getContext('2d');
        
        // 初始化提示文本画布
        this.tipCanvas = document.getElementById('tip-text');
        this.tipCanvas.width = 300;
        this.tipCanvas.height = 100;
        this.tipCtx = this.tipCanvas.getContext('2d');
        
        // 添加动画计时器属性
        this.textAnimationTimer = null;

        // 初始化进度条画布
        this.progressCanvas = document.getElementById('progress-bar');
        this.progressCtx = this.progressCanvas.getContext('2d');
        this.progressLevel = 0;
    
        // 加载彩蛋图片
        this.easterEggImage = new Image();
        this.easterEggImage.src = 'pic/easter-egg.png';
    }

    // 初始化游戏状态
    initializeGameState(canvas) {
        this.gridSize = 40;  // 网格大小，决定蛇和食物的大小
        // 计算画布中心点位置
        const centerX = Math.floor((canvas.width / this.gridSize) / 2);
        const centerY = Math.floor((canvas.height / this.gridSize) / 2);
        
        this.snake = [{ x: centerX, y: centerY }];  // 初始蛇的位置（中心点）
        this.direction = 'right';                    // 初始移动方向
        this.food = this.generateFood();             // 生成第一个食物
        this.score = 0;                             // 初始分数
        this.gameOver = false;                      // 游戏结束标志
        this.speed = 200;                           // 初始移动速度（毫秒）
        this.originalSpeed = this.speed;            // 保存原始速度
        this.speedBoost = 100;                      // 加速时减少的毫秒数
        this.minSpeed = 50;                         // 最小移动速度
        this.speedDecrease = 10;                    // 每次吃到食物后速度减少值
        this.isRunning = false;                     // 游戏运行状态
        this.headRotation = 0;                      // 蛇头旋转角度
        this.rotationSpeed = 90;                     // 旋转速度（度/帧）
        this.pulseScale = 1;                        // 脉冲缩放值
        this.pulseSpeed = 0.05;                     // 脉冲速度
        this.pulseDirection = 1;                    // 脉冲方向
        this.maxPulseScale = 1.2;                   // 最大缩放值
        this.minPulseScale = 0.8;                   // 最小缩放值
    }

    // 加载资源
    loadAssets() {
        const images = {
            head: 'pic/snake-head.png',
            food: 'pic/food.png',
            easterEgg: 'pic/easter-egg.png'
        };

        const imagePromises = Object.entries(images).map(([key, src]) => {
            const img = new Image();
            img.src = src;
            this[`${key}Image`] = img;
            return new Promise(resolve => img.onload = resolve);
        });

        Promise.all(imagePromises)
            .then(() => {
                this.draw(); // 初始绘制
                document.getElementById('start-menu').style.display = 'block'; // 显示开始菜单
            })
            .catch(error => console.error('图片加载失败:', error));
    }

    // 绑定控制
    bindControls() {
        const keyActions = {
            'Enter': () => this.handleEnterKey(),
            'ArrowUp': () => this.changeDirection('up', 'down'),
            'ArrowDown': () => this.changeDirection('down', 'up'),
            'ArrowLeft': () => this.changeDirection('left', 'right'),
            'ArrowRight': () => this.changeDirection('right', 'left'),
            ' ': () => this.handleSpaceKey()
        };

        document.addEventListener('keydown', (e) => {
            const action = keyActions[e.key];
            if (action) action();
        });

        document.addEventListener('keyup', (e) => { // 添加 keyup 事件监听
            if (e.key === ' ') this.resetSpeed();
        });

        ['restart-btn', 'start-btn'].forEach(id => {
            document.getElementById(id).addEventListener('click', () => {
                if (id === 'restart-btn') this.resetGame();
                else {
                    document.getElementById('start-menu').style.display = 'none';
                    this.startGame();
                }
            });
        });
    }

    // 更改方向
    changeDirection(newDir, oppositeDir) {
        if (this.direction !== oppositeDir) this.direction = newDir;
    }

    // 按下空格键加速
    handleSpaceKey() {
        if (this.isRunning && !this.gameOver) {
            this.speed = Math.max(this.minSpeed, this.originalSpeed - this.speedBoost);
        }
    }

    // 释放空格键恢复速度
    resetSpeed() {
        if (this.isRunning && !this.gameOver) {
            this.speed = this.originalSpeed;
        }
    }

    // 处理 Enter 键
    handleEnterKey() {
        if (!this.isRunning) {
            document.getElementById('start-menu').style.display = 'none';
            this.startGame();
        } else if (this.gameOver) {
            this.resetGame();
        }
    }

    // 更新游戏状态 (移动蛇)
    updateGameState() {
        const head = this.getNextHeadPosition();

        if (this.checkCollision(head)) {
            this.gameOver = true;
            return;
        }

        this.snake.unshift(head);

        if (this.isEatingFood(head)) {
            this.handleFoodEaten();
        } else {
            this.snake.pop();
        }
    }

    // 获取下一个蛇头位置
    getNextHeadPosition() {
        const head = { ...this.snake[0] };
        switch (this.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }
        return head;
    }

    // 处理食物被吃
    handleFoodEaten() {
        this.score += 10;
        document.getElementById('score').textContent = `分数: ${this.score}`;
        this.food = this.generateFood();
        this.updateProgressAndSpeed();
    }

    // 更新进度和速度
    updateProgressAndSpeed() {
        this.progressLevel = Math.min(10, this.progressLevel + 1);
        this.drawProgressBar();

        if (this.progressLevel >= 10) {
            this.showEasterEgg();
            return;
        }

        this.originalSpeed = Math.max(this.minSpeed, this.originalSpeed - this.speedDecrease);
        this.speed = this.originalSpeed;
    }

    // 检查碰撞
    checkCollision(head) {
        if (head.x < 0 || head.x >= Math.floor(this.canvas.width / this.gridSize) ||
            head.y < 0 || head.y >= Math.floor(this.canvas.height / this.gridSize)) {
            return true;
        }
        return this.snake.some(segment => segment.x === head.x && segment.y === head.y);
    }

    // 判断是否吃到食物
    isEatingFood(head) {
        return head.x === this.food.x && head.y === this.food.y;
    }

    // 生成食物
    generateFood() {
        const x = Math.floor(Math.random() * (this.canvas.width / this.gridSize));
        const y = Math.floor(Math.random() * (this.canvas.height / this.gridSize));
        return { x, y };
    }

    // 清除动画计时器
    clearAnimationTimer() {
        if (this.textAnimationTimer) {
            clearTimeout(this.textAnimationTimer);
            this.textAnimationTimer = null;
        }
    }

    // 开始游戏
    startGame() {
        this.isRunning = true;
        this.gameLoop();
    }

    // 游戏循环
    gameLoop() {
        if (this.gameOver || !this.isRunning) {
            if (this.gameOver) {
                this.handleGameOver();
            }
            return;
        }

        this.updateGameState(); // 更新游戏状态
        this.draw();
        setTimeout(() => this.gameLoop(), this.speed);
    }

    // 处理游戏结束
    handleGameOver() {
        document.getElementById('game-over').style.display = 'block';
        document.getElementById('final-score').textContent = `最终分数: ${this.score}`;
        this.showGameOverText(); // 显示游戏结束文字
    }

    // 显示游戏结束文字
    showGameOverText() {
        this.clearCanvases(); // 清理画布
        this.leftCtx.font = '48px Arial';
        this.rightCtx.font = '48px Arial';

        this.leftTextIndex = 0;
        this.rightTextIndex = 0;
        this.textAnimationSpeed = 300;

        const leftText = '白松结子邀星弈';
        const rightText = '楠木擎天唤粑临';

        const animateText = () => {
            if (this.leftTextIndex < leftText.length) {
                const gradient1 = this.leftCtx.createLinearGradient(
                    10,
                    100 + this.leftTextIndex * 60 - 48,
                    10,
                    100 + this.leftTextIndex * 60
                );
                gradient1.addColorStop(0, '#FF0000');
                gradient1.addColorStop(1, '#FF9900');
                this.leftCtx.fillStyle = gradient1;
                this.leftCtx.fillText(
                    leftText[this.leftTextIndex],
                    10,
                    100 + this.leftTextIndex * 60
                );
                this.leftTextIndex++;
            }

            if (this.rightTextIndex < rightText.length) {
                const gradient2 = this.rightCtx.createLinearGradient(
                    10,
                    100 + this.rightTextIndex * 60 - 48,
                    10,
                    100 + this.rightTextIndex * 60
                );
                gradient2.addColorStop(0, '#0066FF');
                gradient2.addColorStop(1, '#9933FF');
                this.rightCtx.fillStyle = gradient2;
                this.rightCtx.fillText(
                    rightText[this.rightTextIndex],
                    10,
                    100 + this.rightTextIndex * 60
                );
                this.rightTextIndex++;
            }

            if (
                this.leftTextIndex < leftText.length ||
                this.rightTextIndex < rightText.length
            ) {
                this.textAnimationTimer = setTimeout(
                    animateText,
                    this.textAnimationSpeed
                );
            }
        };

        animateText();
    }

    // 重置游戏
    resetGame() {
        this.clearAnimationTimer();
        this.initializeGameState(this.canvas);
        document.getElementById('score').textContent = '分数: 0';
        document.getElementById('game-over').style.display = 'none';
        document.getElementById('start-menu').style.display = 'block';
        this.progressLevel = 0; // 重置进度等级
        this.drawProgressBar();
        this.clearCanvases();
        this.draw();
    }

    // 清理画布
    clearCanvases() {
        [
            { ctx: this.leftCtx, canvas: this.leftCanvas },
            { ctx: this.rightCtx, canvas: this.rightCanvas },
            { ctx: this.progressCtx, canvas: this.progressCanvas },
        ].forEach(({ ctx, canvas }) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        });
    }

    // 绘制
    draw() {
        if (!this.headImage || !this.foodImage) {
            console.error('图片资源未加载完成');
            return;
        }

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制蛇身
        for (let i = 1; i < this.snake.length; i++) {
            const segment = this.snake[i];
            this.ctx.drawImage(
                this.headImage,
                segment.x * this.gridSize,
                segment.y * this.gridSize,
                this.gridSize,
                this.gridSize
            );
        }

        // 绘制蛇头
        const head = this.snake[0];
        this.ctx.save();
        this.ctx.translate(
            head.x * this.gridSize + this.gridSize / 2,
            head.y * this.gridSize + this.gridSize / 2
        );
        this.ctx.rotate((this.headRotation * Math.PI) / 180);
        this.ctx.scale(this.pulseScale, this.pulseScale);
        this.ctx.drawImage(
            this.headImage,
            -this.gridSize / 2,
            -this.gridSize / 2,
            this.gridSize,
            this.gridSize
        );
        this.ctx.restore();

        // 更新旋转和脉冲效果
        if (this.isRunning && !this.gameOver) {
            this.headRotation = (this.headRotation + this.rotationSpeed) % 360;
            this.pulseScale += this.pulseSpeed * this.pulseDirection;
            if (this.pulseScale >= this.maxPulseScale) {
                this.pulseDirection = -1;
            } else if (this.pulseScale <= this.minPulseScale) {
                this.pulseDirection = 1;
            }
        }

        // 绘制食物
        this.ctx.drawImage(
            this.foodImage,
            this.food.x * this.gridSize,
            this.food.y * this.gridSize,
            this.gridSize,
            this.gridSize
        );
    }

    // 绘制提示文本
    drawTipText() {
        this.tipCtx.clearRect(0, 0, this.tipCanvas.width, this.tipCanvas.height);
        this.tipCtx.font = '28px Arial';

        const gradient = this.tipCtx.createLinearGradient(
            0,
            0,
            this.tipCanvas.width,
            0
        );
        gradient.addColorStop(0, '#4CAF50');
        gradient.addColorStop(1, '#2196F3');
        this.tipCtx.fillStyle = gradient;

        const tips = [
            '按空格键加速',
            '方向键控制移动',
            'Enter 键开始/重新开始',
        ];

        tips.forEach((tip, index) => {
            this.tipCtx.fillText(tip, 10, 25 + index * 35);
        });
    }

    // 绘制进度条
    drawProgressBar() {
        const height = this.progressCanvas.height;
        const width = this.progressCanvas.width;
        const blockHeight = height / 10;

        this.progressCtx.clearRect(0, 0, width, height);

        for (let i = 0; i < this.progressLevel; i++) {
            const y = height - (i + 1) * blockHeight;
            const gradient = this.progressCtx.createLinearGradient(0, y, 0, y + blockHeight);
            const progress = i / 9;

            gradient.addColorStop(
                0,
                `rgb(${255 * progress}, ${255 * (1 - progress)}, 0)`
            );
            gradient.addColorStop(
                1,
                `rgb(${255 * progress}, ${255 * (1 - progress)}, 0)`
            );

            this.progressCtx.fillStyle = gradient;
            this.progressCtx.fillRect(0, y, width, blockHeight - 2);
        }
    }

    // 显示彩蛋
    showEasterEgg() {
        this.gameOver = true;
        this.isRunning = false;

        this.clearCanvases();

        const drawEasterEgg = () => {
            const scale = Math.min(
                this.canvas.width / this.easterEggImage.width,
                this.canvas.height / this.easterEggImage.height
            );
            const width = this.easterEggImage.width * scale;
            const height = this.easterEggImage.height * scale;
            const x = (this.canvas.width - width) / 2;
            const y = (this.canvas.height - height) / 2;

            this.ctx.drawImage(this.easterEggImage, x, y, width, height);
        };

        if (this.easterEggImage.complete) {
            drawEasterEgg();
        } else {
            this.easterEggImage.onload = drawEasterEgg;
        }

        const resetHandler = () => {
            this.progressLevel = 0;
            this.resetGame();
            document.removeEventListener('keydown', resetHandler);
        };
        document.addEventListener('keydown', resetHandler);
    }
}

// 页面加载完成后初始化游戏
window.onload = () => {
    const canvas = document.getElementById('game-canvas');
    new Snake(canvas);
};