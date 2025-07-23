/**
 * 计算器功能
 * 提供基础计算功能和历史记录管理
 */
class Calculator {
    constructor() {
        this.currentInput = '0';
        this.expression = '';
        this.result = '0';
        this.isNewCalculation = true;
        this.shouldResetDisplay = false;
        this.history = this.loadHistory();
        this.clipboardPermission = null; // 缓存剪贴板权限状态
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadHistoryDisplay();
    }

    bindEvents() {
        // 计算器按钮点击事件
        const calculatorBtn = document.getElementById('calculatorBtn');
        if (calculatorBtn) {
            calculatorBtn.addEventListener('click', () => this.openCalculator());
        }

        // 关闭计算器按钮
        const closeBtn = document.getElementById('closeCalculatorModal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeCalculator());
        }

        // 历史记录切换按钮
        const historyToggleBtn = document.getElementById('historyToggleBtn');
        if (historyToggleBtn) {
            historyToggleBtn.addEventListener('click', () => this.toggleHistory());
        }

        // 清空历史记录按钮
        const clearHistoryBtn = document.getElementById('clearHistoryBtn');
        if (clearHistoryBtn) {
            clearHistoryBtn.addEventListener('click', () => this.clearHistory());
        }

        // 计算器按键事件
        const calculatorButtons = document.querySelectorAll('.calc-btn');
        calculatorButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleButtonClick(btn);
            });
        });

        // 键盘事件
        document.addEventListener('keydown', (e) => {
            if (this.isCalculatorOpen()) {
                this.handleKeyPress(e);
            }
        });

        // 模态框背景点击关闭
        const calculatorModal = document.getElementById('calculatorModal');
        if (calculatorModal) {
            calculatorModal.addEventListener('click', (e) => {
                if (e.target === calculatorModal) {
                    this.closeCalculator();
                }
            });
        }
    }

    openCalculator() {
        const modal = document.getElementById('calculatorModal');
        if (modal) {
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    }

    closeCalculator() {
        const modal = document.getElementById('calculatorModal');
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        }
    }

    isCalculatorOpen() {
        const modal = document.getElementById('calculatorModal');
        return modal && !modal.classList.contains('hidden');
    }

    toggleHistory() {
        const historyPanel = document.getElementById('calculatorHistory');
        if (historyPanel) {
            historyPanel.classList.toggle('hidden');
        }
    }

    handleButtonClick(button) {
        const action = button.dataset.action;
        const value = button.dataset.value;

        if (action) {
            switch (action) {
                case 'clear':
                    this.clear();
                    break;
                case 'backspace':
                    this.backspace();
                    break;
                case 'equals':
                    this.calculate();
                    break;
                case 'percent':
                    this.applyPercent();
                    break;
            }
        } else if (value) {
            if (['+', '-', '*', '/'].includes(value)) {
                this.addOperator(value);
            } else {
                this.addNumber(value);
            }
        }
    }

    handleKeyPress(e) {
        // 处理粘贴快捷键
        if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
            e.preventDefault();
            this.pasteValue();
            return;
        }
        
        e.preventDefault();
        
        const key = e.key;
        
        if (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.'].includes(key)) {
            this.addNumber(key);
        } else if (['+', '-', '*', '/'].includes(key)) {
            this.addOperator(key);
        } else if (key === 'Enter' || key === '=') {
            this.calculate();
        } else if (key === 'Escape' || key === 'c' || key === 'C') {
            this.clear();
        } else if (key === 'Backspace') {
            this.backspace();
        } else if (key === '%') {
            this.applyPercent();
        }
    }

    addNumber(num) {
        if (this.shouldResetDisplay) {
            this.currentInput = '';
            this.shouldResetDisplay = false;
        }

        if (this.isNewCalculation && this.currentInput === '0') {
            this.currentInput = '';
        }

        // 处理小数点
        if (num === '.') {
            if (this.currentInput === '') {
                this.currentInput = '0';
            }
            if (this.currentInput.includes('.')) {
                return; // 已有小数点，忽略
            }
        }

        // 处理数字0
        if (num === '0' && this.currentInput === '0') {
            return; // 避免多个前置0
        }

        this.currentInput += num;
        this.isNewCalculation = false;
        this.updateDisplay();
    }

    addOperator(operator) {
        // 如果刚输入完结果，使用结果继续计算
        if (this.shouldResetDisplay) {
            this.expression = this.result;
            this.shouldResetDisplay = false;
        } else if (this.currentInput !== '') {
            this.expression += this.currentInput;
        }

        // 处理乘号显示
        const displayOperator = operator === '*' ? '×' : operator;
        
        // 如果表达式末尾已经是运算符，替换它
        if (['+', '-', '×', '/'].includes(this.expression.slice(-1))) {
            this.expression = this.expression.slice(0, -1) + displayOperator;
        } else {
            this.expression += displayOperator;
        }

        this.currentInput = '';
        this.isNewCalculation = false;
        this.updateDisplay();
    }

    calculate() {
        if (this.currentInput !== '' && this.expression !== '') {
            const fullExpression = this.expression + this.currentInput;
            
            try {
                // 将×替换为*进行计算
                const calculationExpression = fullExpression.replace(/×/g, '*');
                const calculationResult = this.evaluateExpression(calculationExpression);
                
                if (calculationResult !== null && isFinite(calculationResult)) {
                    this.result = this.formatResult(calculationResult);
                    this.addToHistory(fullExpression, this.result);
                    
                    // 重置状态
                    this.expression = '';
                    this.currentInput = '';
                    this.shouldResetDisplay = true;
                    this.isNewCalculation = true;
                } else {
                    this.result = '错误';
                    this.shouldResetDisplay = true;
                }
            } catch (error) {
                this.result = '错误';
                this.shouldResetDisplay = true;
            }
            
            this.updateDisplay();
        }
    }

    evaluateExpression(expression) {
        try {
            // 安全的数学表达式计算
            // 只允许数字、基本运算符和小数点
            if (!/^[0-9+\-*/.()\s]+$/.test(expression)) {
                throw new Error('无效表达式');
            }
            
            // 使用Function构造器安全计算
            return Function('"use strict"; return (' + expression + ')')();
        } catch (error) {
            return null;
        }
    }

    formatResult(result) {
        // 格式化结果，处理精度问题
        if (Number.isInteger(result)) {
            return result.toString();
        } else {
            // 最多保留10位小数，去除多余的0
            return parseFloat(result.toFixed(10)).toString();
        }
    }

    clear() {
        this.currentInput = '0';
        this.expression = '';
        this.result = '0';
        this.isNewCalculation = true;
        this.shouldResetDisplay = false;
        this.updateDisplay();
    }

    backspace() {
        if (this.shouldResetDisplay) {
            this.clear();
            return;
        }

        if (this.currentInput.length > 1) {
            this.currentInput = this.currentInput.slice(0, -1);
        } else if (this.currentInput.length === 1) {
            this.currentInput = '0';
            this.isNewCalculation = true;
        }
        
        this.updateDisplay();
    }

    updateDisplay() {
        const expressionElement = document.getElementById('calculationExpression');
        const resultElement = document.getElementById('calculationResult');

        if (expressionElement) {
            expressionElement.textContent = this.expression;
        }

        if (resultElement) {
            if (this.shouldResetDisplay) {
                resultElement.textContent = this.result;
            } else {
                resultElement.textContent = this.currentInput || '0';
            }
        }
    }

    addToHistory(expression, result) {
        const historyItem = {
            id: Date.now(),
            expression: expression,
            result: result,
            timestamp: new Date().toLocaleString('zh-CN')
        };

        this.history.unshift(historyItem);
        
        // 限制历史记录数量为100条
        if (this.history.length > 100) {
            this.history = this.history.slice(0, 100);
        }

        this.saveHistory();
        this.loadHistoryDisplay();
    }

    loadHistoryDisplay() {
        const historyList = document.getElementById('historyList');
        if (!historyList) return;

        if (this.history.length === 0) {
            historyList.innerHTML = '<div class="history-empty">暂无计算记录</div>';
            return;
        }

        historyList.innerHTML = this.history.map(item => `
            <div class="history-item" data-expression="${item.expression}" data-result="${item.result}">
                <div class="history-expression">${item.expression}</div>
                <div class="history-result">= ${item.result}</div>
                <div class="history-time">${item.timestamp}</div>
            </div>
        `).join('');

        // 为历史记录项添加点击事件
        const historyItems = historyList.querySelectorAll('.history-item');
        historyItems.forEach(item => {
            item.addEventListener('click', () => {
                const result = item.dataset.result;
                this.currentInput = result;
                this.expression = '';
                this.result = result;
                this.shouldResetDisplay = false;
                this.isNewCalculation = false;
                this.updateDisplay();
            });
        });
    }

    clearHistory() {
        if (confirm('确定要清空所有计算历史记录吗？')) {
            this.history = [];
            this.saveHistory();
            this.loadHistoryDisplay();
        }
    }

    saveHistory() {
        try {
            localStorage.setItem('calculator-history', JSON.stringify(this.history));
        } catch (error) {
            console.warn('无法保存计算历史记录:', error);
        }
    }

    loadHistory() {
        try {
            const saved = localStorage.getItem('calculator-history');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.warn('无法加载计算历史记录:', error);
            return [];
        }
    }

    /**
     * 应用百分号功能
     * 将当前输入的数字转换为百分比（除以100）
     */
    applyPercent() {
        if (this.currentInput && this.currentInput !== '0') {
            const currentValue = parseFloat(this.currentInput);
            if (!isNaN(currentValue)) {
                this.currentInput = this.formatResult(currentValue / 100);
                this.updateDisplay();
            }
        } else if (this.shouldResetDisplay && this.result !== '0') {
            const resultValue = parseFloat(this.result);
            if (!isNaN(resultValue)) {
                this.result = this.formatResult(resultValue / 100);
                this.currentInput = this.result;
                this.shouldResetDisplay = false;
                this.updateDisplay();
            }
        }
    }



    /**
     * 从剪贴板粘贴数值
     */
    async pasteValue() {
        try {
            // 检查是否支持剪贴板API
            if (!navigator.clipboard || !window.isSecureContext) {
                this.showCopyMessage('当前环境不支持剪贴板功能');
                return;
            }

            // 如果已经检查过权限且被拒绝，直接返回
            if (this.clipboardPermission === 'denied') {
                this.showCopyMessage('剪贴板权限被拒绝');
                return;
            }

            let pastedText = '';

            // 首次使用或权限未知时，检查权限
            if (this.clipboardPermission === null) {
                try {
                    // 检查剪贴板读取权限
                    const permission = await navigator.permissions.query({name: 'clipboard-read'});
                    this.clipboardPermission = permission.state;
                    
                    // 监听权限变化
                    permission.addEventListener('change', () => {
                        this.clipboardPermission = permission.state;
                    });
                } catch (error) {
                    // 某些浏览器可能不支持权限查询，直接尝试读取
                    console.log('权限查询不支持，直接尝试读取剪贴板');
                }
            }

            // 尝试读取剪贴板内容
            try {
                pastedText = await navigator.clipboard.readText();
                // 读取成功，更新权限状态
                if (this.clipboardPermission !== 'granted') {
                    this.clipboardPermission = 'granted';
                }
            } catch (error) {
                // 读取失败，可能是权限被拒绝
                this.clipboardPermission = 'denied';
                
                if (error.name === 'NotAllowedError') {
                    this.showCopyMessage('需要授权剪贴板权限才能粘贴');
                } else {
                    this.showCopyMessage('读取剪贴板失败');
                }
                return;
            }

            // 验证粘贴的内容是否为有效数字
            const trimmedText = pastedText.trim();
            
            // 检查是否为有效的数字格式
            if (/^-?\d*\.?\d+$/.test(trimmedText)) {
                const pastedValue = parseFloat(trimmedText);
                if (!isNaN(pastedValue) && isFinite(pastedValue)) {
                    // 清除当前输入并设置新值
                    this.currentInput = trimmedText;
                    this.expression = '';
                    this.shouldResetDisplay = false;
                    this.isNewCalculation = false;
                    this.updateDisplay();
                    this.showCopyMessage('已粘贴数值: ' + trimmedText);
                } else {
                    this.showCopyMessage('粘贴的内容不是有效数字');
                }
            } else {
                this.showCopyMessage('粘贴的内容不是有效数字');
            }
        } catch (error) {
            console.error('粘贴失败:', error);
            this.showCopyMessage('粘贴操作失败');
        }
    }

    /**
     * 显示复制/粘贴操作的提示消息
     */
    showCopyMessage(message) {
        // 创建临时提示元素
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 8px 16px;
            border-radius: 4px;
            font-size: 14px;
            z-index: 10000;
            pointer-events: none;
        `;
        
        document.body.appendChild(toast);
        
        // 2秒后移除提示
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 2000);
    }
}

// 页面加载完成后初始化计算器
document.addEventListener('DOMContentLoaded', () => {
    window.calculator = new Calculator();
}); 
