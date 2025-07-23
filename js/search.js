// 搜索功能
class SearchManager {
    constructor() {
        this.searchEngines = {
            'Google': 'https://www.google.com/search?q=',
            'GitHub': 'https://github.com/search?q=',
            '百度': 'https://www.baidu.com/s?wd=',
            'DuckDuckGo': 'https://duckduckgo.com/?q=',
            'YouTube': 'https://www.youtube.com/results?search_query='
        };
        
        this.selectedEngine = 'Google';
        this.suggestions = [
            '开发环境', '测试环境', '交付环境', '后台管理', '数据分析',
            '禅道', 'Jenkins', '自动化测试', 'AI助手', 'Figma设计'
        ];
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateSelectedEngine();
    }

    bindEvents() {
        // 搜索引擎选择
        document.querySelectorAll('.engine-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.selectedEngine = link.getAttribute('data-name');
                this.updateSelectedEngine();
                
                // 如果搜索框有内容，立即搜索
                const searchInput = document.getElementById('searchInput');
                if (searchInput && searchInput.value.trim()) {
                    this.performSearch();
                }
                
                // 聚焦搜索框
                searchInput?.focus();
            });
        });

        // 搜索框事件
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            // 回车搜索
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch();
                }
            });

            // 焦点效果
            searchInput.addEventListener('focus', () => {
                this.handleSearchFocus(true);
            });

            searchInput.addEventListener('blur', () => {
                this.handleSearchFocus(false);
            });

            // 搜索建议
            searchInput.addEventListener('input', (e) => {
                this.handleSearchInput(e.target.value);
            });
        }

        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K 聚焦搜索框
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                searchInput?.focus();
            }
        });
    }

    updateSelectedEngine() {
        // 更新选中状态
        document.querySelectorAll('.engine-link').forEach(el => {
            el.classList.remove('selected');
        });
        
        const selectedLink = document.querySelector(`[data-name="${this.selectedEngine}"]`);
        if (selectedLink) {
            selectedLink.classList.add('selected');
        }
    }

    performSearch() {
        const searchInput = document.getElementById('searchInput');
        const query = searchInput?.value.trim();
        
        if (query) {
            const searchUrl = this.searchEngines[this.selectedEngine] + encodeURIComponent(query);
            window.open(searchUrl, '_blank');
        }
    }

    handleSearchFocus(isFocused) {
        const searchBox = document.querySelector('.search-box');
        if (searchBox) {
            if (isFocused) {
                searchBox.style.transform = 'scale(1.02)';
                searchBox.style.boxShadow = '0 15px 50px rgba(0, 0, 0, 0.5)';
            } else {
                searchBox.style.transform = 'scale(1)';
                searchBox.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)';
            }
        }
    }

    handleSearchInput(value) {
        // 这里可以实现搜索建议功能
        // 目前简化处理，可以根据需要扩展
        console.log('搜索输入:', value);
    }
}

// 页面加载完成后初始化搜索管理器
document.addEventListener('DOMContentLoaded', function() {
    new SearchManager();
}); 