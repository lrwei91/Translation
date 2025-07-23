// 时钟和日历功能
class ClockManager {
    constructor() {
        this.init();
    }

    init() {
        this.createCalendarModal();
        this.bindEvents();
        this.updateTime();
        this.startClock();
    }

    createCalendarModal() {
        const modal = document.createElement('div');
        modal.id = 'calendar-modal';
        modal.className = 'calendar-modal hidden';
        modal.innerHTML = `
            <div class="calendar-modal-content">
                <div class="calendar-header">
                    <button id="prev-month" class="calendar-nav-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                    </button>
                    <h2 id="calendar-month-year">2025年5月</h2>
                    <button id="next-month" class="calendar-nav-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </button>
                </div>
                <div class="calendar-body">
                    <div class="calendar-weekdays">
                        <div>一</div>
                        <div>二</div>
                        <div>三</div>
                        <div>四</div>
                        <div>五</div>
                        <div>六</div>
                        <div>日</div>
                    </div>
                    <div id="calendar-days" class="calendar-days"></div>
                </div>
                
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    bindEvents() {
        // 时钟点击事件
        const clockWidget = document.querySelector('.clock-widget');
        if (clockWidget) {
            clockWidget.addEventListener('click', () => {
                this.showCalendar();
            });
            clockWidget.style.cursor = 'pointer';
        }

        // 日历导航事件
        document.getElementById('prev-month')?.addEventListener('click', () => {
            this.changeMonth(-1);
        });

        document.getElementById('next-month')?.addEventListener('click', () => {
            this.changeMonth(1);
        });

        // 点击外部关闭
        document.getElementById('calendar-modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'calendar-modal') {
                this.hideCalendar();
            }
        });

        // ESC键关闭
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideCalendar();
            }
        });
    }

    updateTime() {
        const now = new Date();
        
        // 更新时间
        const timeElement = document.getElementById('currentTime');
        if (timeElement) {
            const time = now.toLocaleTimeString('zh-CN', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            timeElement.textContent = time;
        }
        
        // 更新日期
        const dateElement = document.getElementById('currentDate');
        if (dateElement) {
            const date = now.toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
            const weekday = now.toLocaleDateString('zh-CN', {
                weekday: 'short'
            });
            dateElement.textContent = `${date} ${weekday}`;
        }
    }

    startClock() {
        // 立即更新一次
        this.updateTime();
        
        // 每秒更新
        setInterval(() => {
            this.updateTime();
        }, 1000);
    }

    showCalendar() {
        const modal = document.getElementById('calendar-modal');
        if (modal) {
            modal.classList.remove('hidden');
            this.renderCalendar();
        }
    }

    hideCalendar() {
        const modal = document.getElementById('calendar-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    changeMonth(delta) {
        this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + delta, 1);
        this.renderCalendar();
    }

    renderCalendar() {
        if (!this.currentDate) {
            this.currentDate = new Date();
        }

        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // 更新标题
        const titleElement = document.getElementById('calendar-month-year');
        if (titleElement) {
            titleElement.textContent = `${year}年${month + 1}月`;
        }

        // 获取当月第一天和最后一天
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay() + 1);

        // 渲染日历
        const daysContainer = document.getElementById('calendar-days');
        if (daysContainer) {
            daysContainer.innerHTML = '';
            
            for (let i = 0; i < 42; i++) {
                const date = new Date(startDate);
                date.setDate(startDate.getDate() + i);
                
                const dayElement = document.createElement('div');
                dayElement.className = 'calendar-day';
                
                if (date.getMonth() === month) {
                    dayElement.classList.add('current-month');
                    if (date.toDateString() === new Date().toDateString()) {
                        dayElement.classList.add('today');
                    }
                } else {
                    dayElement.classList.add('other-month');
                }
                
                dayElement.textContent = date.getDate();
                daysContainer.appendChild(dayElement);
            }
        }
    }
}

// 页面加载完成后初始化时钟管理器
document.addEventListener('DOMContentLoaded', function() {
    new ClockManager();
}); 