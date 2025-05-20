// 通用功能
document.addEventListener('DOMContentLoaded', function() {
    // 初始化Intersection Observer动画
    initAnimations();

    // 初始化侧边栏激活状态
    initSidebar();

    // 初始化文件上传功能
    initFileUpload();

    // 初始化语言选择
    initLanguageSelection();

    // 初始化输出格式选择
    initOutputFormat();

    // 初始化翻译按钮
    initTranslationButtons();

    // 初始化分页
    initPagination();

    // 初始化应用卡片
    initAppCards();

    // 初始化应用分类
    initAppCategories();

    // 初始化详情页功能
    initDetailPage();

    // 初始化图表（如果在完成页面）
    if (document.getElementById('statsChart')) {
        initCharts();
    }
});

// 初始化动画
function initAnimations() {
    // 获取所有需要动画的元素
    const animatedElements = document.querySelectorAll('.animate-on-scroll');

    // 创建Intersection Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            // 如果元素进入视口
            if (entry.isIntersecting) {
                // 添加延迟以创建交错效果
                setTimeout(() => {
                    entry.target.classList.add('animate-visible');
                }, index * 100); // 每个元素延迟100ms

                // 元素已经显示，不再需要观察
                observer.unobserve(entry.target);
            }
        });
    }, {
        root: null, // 使用视口作为根
        rootMargin: '0px', // 无边距
        threshold: 0.1 // 当10%的元素可见时触发
    });

    // 开始观察所有元素
    animatedElements.forEach(element => {
        observer.observe(element);
    });
}

// 初始化侧边栏激活状态
function initSidebar() {
    const currentPage = window.location.pathname.split('/').pop();
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        const link = item.getAttribute('data-link');
        if (link === currentPage) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // 添加点击事件
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const link = this.getAttribute('data-link');
            if (link) {
                window.location.href = link;
            }
        });
    });
}

// 初始化文件上传功能
function initFileUpload() {
    const dropArea = document.getElementById('dropArea');
    const fileInput = document.getElementById('fileInput');
    const fileList = document.getElementById('fileList');
    const emptyFileMessage = document.getElementById('emptyFileMessage');

    if (!dropArea || !fileInput) return;

    // 从localStorage加载已上传的文件
    loadFilesFromStorage();

    // 阻止默认拖放行为
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // 高亮显示拖放区域
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });

    function highlight() {
        dropArea.classList.add('border-indigo-500');
        dropArea.classList.remove('border-gray-300');
    }

    function unhighlight() {
        dropArea.classList.remove('border-indigo-500');
        dropArea.classList.add('border-gray-300');
    }

    // 处理文件上传
    dropArea.addEventListener('drop', handleDrop, false);
    dropArea.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFiles);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles({ files: files });
    }

    function handleFiles(e) {
        let files;
        if (e.target && e.target.files) {
            files = e.target.files;
        } else if (e.files) {
            files = e.files;
        } else {
            return;
        }

        if (files && files.length > 0) {
            // 处理上传的文件
            Array.from(files).forEach(file => {
                // 创建文件对象
                const fileObj = {
                    id: Date.now() + Math.random().toString(36).substr(2, 9),
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    date: new Date().toISOString(),
                    selected: false
                };

                // 保存文件信息到localStorage
                saveFileToStorage(fileObj);

                // 添加文件到列表
                addFileToList(fileObj);
            });

            // 显示上传成功消息
            alert('文件上传成功！');

            // 隐藏空文件消息
            if (emptyFileMessage) {
                emptyFileMessage.style.display = 'none';
            }
        }
    }

    // 从localStorage加载文件
    function loadFilesFromStorage() {
        const files = JSON.parse(localStorage.getItem('uploadedFiles')) || [];

        if (files.length > 0 && emptyFileMessage) {
            emptyFileMessage.style.display = 'none';
        }

        files.forEach(file => {
            addFileToList(file);
        });

        // 更新当前翻译文件显示
        updateCurrentFileDisplay();
    }

    // 更新当前翻译文件显示
    function updateCurrentFileDisplay() {
        const currentFileSpan = document.querySelector('.current-file');
        if (!currentFileSpan) return;

        const files = JSON.parse(localStorage.getItem('uploadedFiles')) || [];
        const selectedFile = files.find(file => file.selected);

        if (selectedFile) {
            currentFileSpan.textContent = `当前翻译文件：${selectedFile.name}`;
        } else {
            currentFileSpan.textContent = '当前翻译文件：未选择';
        }
    }

    // 保存文件到localStorage
    function saveFileToStorage(fileObj) {
        const files = JSON.parse(localStorage.getItem('uploadedFiles')) || [];
        files.push(fileObj);
        localStorage.setItem('uploadedFiles', JSON.stringify(files));
    }

    // 从localStorage删除文件
    function removeFileFromStorage(fileId) {
        let files = JSON.parse(localStorage.getItem('uploadedFiles')) || [];

        // 检查被删除的文件是否被选中
        const deletedFile = files.find(file => file.id === fileId);
        const wasSelected = deletedFile && deletedFile.selected;

        // 过滤掉要删除的文件
        files = files.filter(file => file.id !== fileId);
        localStorage.setItem('uploadedFiles', JSON.stringify(files));

        // 如果没有文件了，显示空文件消息
        if (files.length === 0 && emptyFileMessage) {
            emptyFileMessage.style.display = 'block';
        }

        // 如果删除的是选中的文件，更新当前翻译文件显示
        if (wasSelected) {
            updateCurrentFileDisplay();
        }
    }

    // 更新localStorage中的文件
    function updateFileInStorage(fileId, newName) {
        let files = JSON.parse(localStorage.getItem('uploadedFiles')) || [];
        const fileIndex = files.findIndex(file => file.id === fileId);

        if (fileIndex !== -1) {
            files[fileIndex].name = newName;
            localStorage.setItem('uploadedFiles', JSON.stringify(files));
        }
    }

    // 添加文件到列表
    function addFileToList(fileObj) {
        if (!fileList) return;

        // 创建文件列表项
        const fileItem = document.createElement('div');
        fileItem.className = 'grid grid-cols-12 py-2 border-b border-gray-200 items-center file-list-item';
        fileItem.dataset.fileId = fileObj.id;

        // 格式化日期
        const date = new Date(fileObj.date);
        const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;

        fileItem.innerHTML = `
            <div class="col-span-1 flex justify-center">
                <input type="checkbox" class="form-checkbox" ${fileObj.selected ? 'checked' : ''}>
            </div>
            <div class="col-span-5 truncate file-name">${fileObj.name}</div>
            <div class="col-span-4 text-gray-500 text-sm">${formattedDate}</div>
            <div class="col-span-2 flex">
                <span class="text-blue-500 cursor-pointer mr-2 action-btn">编辑</span>
                <span class="text-red-500 cursor-pointer delete-btn">删除</span>
            </div>
        `;

        // 添加到文件列表
        fileList.appendChild(fileItem);

        // 添加编辑按钮事件
        const editBtn = fileItem.querySelector('.action-btn');
        if (editBtn) {
            editBtn.addEventListener('click', function() {
                const fileName = fileItem.querySelector('.file-name').textContent;
                const newName = prompt('请输入新的文件名:', fileName);

                if (newName && newName.trim() !== '') {
                    // 更新UI
                    fileItem.querySelector('.file-name').textContent = newName;

                    // 更新存储
                    updateFileInStorage(fileObj.id, newName);
                }
            });
        }

        // 添加删除按钮事件
        const deleteBtn = fileItem.querySelector('.delete-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', function() {
                const fileName = fileItem.querySelector('.file-name').textContent;

                if (confirm(`确定要删除文件 "${fileName}" 吗？`)) {
                    // 从UI中移除
                    fileItem.remove();

                    // 从存储中移除
                    removeFileFromStorage(fileObj.id);
                }
            });
        }

        // 添加复选框事件
        const checkbox = fileItem.querySelector('input[type="checkbox"]');
        if (checkbox) {
            checkbox.addEventListener('change', function() {
                // 更新文件选中状态
                let files = JSON.parse(localStorage.getItem('uploadedFiles')) || [];
                const fileIndex = files.findIndex(file => file.id === fileObj.id);

                if (fileIndex !== -1) {
                    files[fileIndex].selected = this.checked;
                    localStorage.setItem('uploadedFiles', JSON.stringify(files));

                    // 更新当前翻译文件显示
                    updateCurrentFileDisplay();
                }
            });
        }
    }
}

// 初始化语言选择
function initLanguageSelection() {
    const sourceTags = document.querySelectorAll('.language-tag.source');
    const targetTags = document.querySelectorAll('.language-tag.target');

    if (sourceTags.length === 0 && targetTags.length === 0) return;

    // 处理源语言选择
    sourceTags.forEach(tag => {
        // 点击语言按钮
        tag.addEventListener('click', function() {
            // 移除其他源语言的激活状态
            sourceTags.forEach(sourceTag => {
                sourceTag.classList.remove('active');
                sourceTag.classList.remove('bg-indigo-500', 'hover:bg-indigo-600', 'text-white');
                sourceTag.classList.add('bg-gray-100', 'hover:bg-gray-200', 'text-gray-700');
            });

            // 激活当前源语言
            this.classList.add('active');
            this.classList.remove('bg-gray-100', 'hover:bg-gray-200', 'text-gray-700');
            this.classList.add('bg-indigo-500', 'hover:bg-indigo-600', 'text-white');
        });
    });

    // 处理目标语言选择
    targetTags.forEach(tag => {
        // 点击语言按钮
        tag.addEventListener('click', function() {
            // 移除其他目标语言的激活状态
            targetTags.forEach(targetTag => {
                targetTag.classList.remove('active');
                targetTag.classList.remove('bg-indigo-500', 'hover:bg-indigo-600', 'text-white');
                targetTag.classList.add('bg-gray-100', 'hover:bg-gray-200', 'text-gray-700');
            });

            // 激活当前目标语言
            this.classList.add('active');
            this.classList.remove('bg-gray-100', 'hover:bg-gray-200', 'text-gray-700');
            this.classList.add('bg-indigo-500', 'hover:bg-indigo-600', 'text-white');
        });
    });

    // 清除选择按钮
    const clearButton = document.querySelector('button:has(.fa-undo-alt)');
    if (clearButton) {
        clearButton.addEventListener('click', function() {
            // 重置为默认选择（英语 -> 中文）
            sourceTags.forEach(sourceTag => {
                if (sourceTag.textContent.trim().startsWith('英语')) {
                    sourceTag.classList.add('active');
                    sourceTag.classList.remove('bg-gray-100', 'hover:bg-gray-200', 'text-gray-700');
                    sourceTag.classList.add('bg-indigo-500', 'hover:bg-indigo-600', 'text-white');
                } else {
                    sourceTag.classList.remove('active');
                    sourceTag.classList.remove('bg-indigo-500', 'hover:bg-indigo-600', 'text-white');
                    sourceTag.classList.add('bg-gray-100', 'hover:bg-gray-200', 'text-gray-700');
                }
            });

            targetTags.forEach(targetTag => {
                if (targetTag.textContent.trim().startsWith('简体中文')) {
                    targetTag.classList.add('active');
                    targetTag.classList.remove('bg-gray-100', 'hover:bg-gray-200', 'text-gray-700');
                    targetTag.classList.add('bg-indigo-500', 'hover:bg-indigo-600', 'text-white');
                } else {
                    targetTag.classList.remove('active');
                    targetTag.classList.remove('bg-indigo-500', 'hover:bg-indigo-600', 'text-white');
                    targetTag.classList.add('bg-gray-100', 'hover:bg-gray-200', 'text-gray-700');
                }
            });
        });
    }
}

// 初始化输出格式选择
function initOutputFormat() {
    const formatOptions = document.querySelectorAll('.format-option input[type="radio"]');

    if (formatOptions.length === 0) return;

    formatOptions.forEach(option => {
        option.addEventListener('change', function() {
            // 处理输出格式变更
            console.log('输出格式已更改为:', this.value);
        });
    });
}

// 初始化翻译按钮
function initTranslationButtons() {
    const translationButtons = document.querySelectorAll('.translation-btn');

    if (translationButtons.length === 0) return;

    translationButtons.forEach(button => {
        button.addEventListener('click', function() {
            console.log('点击了翻译按钮:', this.querySelector('span')?.textContent);

            // 激活当前按钮
            translationButtons.forEach(btn => {
                const icon = btn.querySelector('.btn-icon');
                if (icon) {
                    icon.classList.remove('active');
                    icon.classList.add('inactive');
                }
            });

            const currentIcon = this.querySelector('.btn-icon');
            if (currentIcon) {
                currentIcon.classList.remove('inactive');
                currentIcon.classList.add('active');
            }

            // 如果是开始翻译按钮
            if (this.id === 'startTranslationBtn') {
                startTranslation();
            }
        });
    });

    // 切换开关
    const toggleSwitch = document.querySelector('.switch input');
    if (toggleSwitch) {
        toggleSwitch.addEventListener('change', function() {
            console.log('自动转换:', this.checked ? '开启' : '关闭');
            // 这里可以添加切换自动转换的代码
        });
    }

    // 下载按钮
    const downloadButton = document.querySelector('.download-btn');
    if (downloadButton) {
        downloadButton.addEventListener('click', function() {
            console.log('点击了下载按钮');
            // 这里可以添加下载功能的代码
        });
    }

    // 设置按钮
    const settingsButton = document.querySelector('.settings-btn');
    if (settingsButton) {
        settingsButton.addEventListener('click', function() {
            console.log('点击了设置按钮');
            // 这里可以添加设置功能的代码
        });
    }

    // 上传至云端按钮
    const uploadCloudButton = document.querySelector('.upload-cloud-btn');
    if (uploadCloudButton) {
        uploadCloudButton.addEventListener('click', function() {
            console.log('点击了上传至云端按钮');
            // 这里可以添加上传至云端的代码
        });
    }
}

// 初始化分页
function initPagination() {
    // 获取所有页码按钮（包括数字和箭头）
    const pageButtons = document.querySelectorAll('.flex.items-center button');

    if (pageButtons.length === 0) return;

    // 当前页码
    let currentPage = 1; // 默认第1页是活动的

    // 获取所有应用卡片
    const appCards = document.querySelectorAll('.app-card');

    // 每页显示的应用数量
    const perPage = 8;

    // 计算总页数
    const totalPages = Math.ceil(appCards.length / perPage);

    // 更新总应用数显示
    const totalInfo = document.querySelector('.text-sm.text-gray-500 span:last-child');
    if (totalInfo) {
        totalInfo.textContent = appCards.length;
    }

    // 初始化分页UI
    updatePaginationUI();

    // 为所有页码按钮添加点击事件
    pageButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 如果是数字页码按钮
            if (!isNaN(this.textContent) && !this.classList.contains('btn-primary')) {
                // 获取点击的页码
                const page = parseInt(this.textContent);

                // 更新当前页码
                currentPage = page;

                // 更新分页UI
                updatePaginationUI();

                // 显示当前页的应用
                showCurrentPageApps();
            }
            // 如果是上一页按钮
            else if (this.querySelector('.fa-chevron-left')) {
                if (currentPage > 1) {
                    currentPage--;
                    updatePaginationUI();
                    showCurrentPageApps();
                }
            }
            // 如果是下一页按钮
            else if (this.querySelector('.fa-chevron-right')) {
                if (currentPage < totalPages) {
                    currentPage++;
                    updatePaginationUI();
                    showCurrentPageApps();
                }
            }
        });
    });

    // 初始显示第一页的应用
    showCurrentPageApps();

    // 更新分页UI
    function updatePaginationUI() {
        // 更新页码按钮状态
        pageButtons.forEach(button => {
            if (!isNaN(button.textContent)) {
                const buttonPage = parseInt(button.textContent);
                if (buttonPage === currentPage) {
                    button.classList.remove('btn-light');
                    button.classList.add('btn-primary');
                } else {
                    button.classList.remove('btn-primary');
                    button.classList.add('btn-light');
                }
            }
        });

        // 更新显示信息
        const startItem = (currentPage - 1) * perPage + 1;
        const endItem = Math.min(currentPage * perPage, appCards.length);
        const displayInfo = document.querySelector('.text-sm.text-gray-500 span:first-child');
        if (displayInfo) {
            displayInfo.textContent = `${startItem}-${endItem}`;
        }
    }

    // 显示当前页的应用
    function showCurrentPageApps() {
        // 计算当前页应该显示的应用索引范围
        const startIndex = (currentPage - 1) * perPage;
        const endIndex = Math.min(startIndex + perPage, appCards.length);

        // 隐藏所有应用
        appCards.forEach((card, index) => {
            if (index >= startIndex && index < endIndex) {
                card.style.display = '';
                // 重新触发动画
                card.classList.remove('animate-visible');
                setTimeout(() => {
                    card.classList.add('animate-visible');
                }, 50);
            } else {
                card.style.display = 'none';
            }
        });
    }
}

// 初始化应用卡片
function initAppCards() {
    const appCards = document.querySelectorAll('.app-card');

    if (appCards.length === 0) return;

    appCards.forEach(card => {
        // 为整个卡片添加点击事件
        card.addEventListener('click', function(e) {
            // 如果点击的是卡片内的按钮，不触发卡片的点击事件
            if (e.target.closest('.btn-icon') || e.target.closest('button')) {
                return;
            }

            const appId = this.getAttribute('data-id');
            if (appId) {
                navigateToAppDetail(appId);
            }
        });

        // 为卡片内的箭头按钮单独添加点击事件
        const arrowButton = card.querySelector('.btn-icon');
        if (arrowButton) {
            arrowButton.addEventListener('click', function(e) {
                e.stopPropagation(); // 阻止事件冒泡，避免触发卡片的点击事件
                const appId = card.getAttribute('data-id');
                if (appId) {
                    navigateToAppDetail(appId);
                }
            });
        }
    });
}

// 初始化应用分类
function initAppCategories() {
    const categoryButtons = document.querySelectorAll('.category-btn');
    const appCards = document.querySelectorAll('.app-card');

    if (categoryButtons.length === 0 || appCards.length === 0) return;

    // 为每个分类按钮添加点击事件
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 更新按钮状态
            categoryButtons.forEach(btn => {
                btn.classList.remove('btn-primary');
                btn.classList.add('btn-light');
            });

            this.classList.remove('btn-light');
            this.classList.add('btn-primary');

            // 获取选中的分类
            const selectedCategory = this.getAttribute('data-category');

            // 过滤应用卡片
            filterAppCards(selectedCategory);
        });
    });

    // 过滤应用卡片
    function filterAppCards(category) {
        let visibleCards = 0;

        appCards.forEach(card => {
            const cardCategories = card.getAttribute('data-category')?.split(',') || [];

            if (category === 'all' || cardCategories.includes(category)) {
                card.style.display = '';
                visibleCards++;
                // 重新触发动画
                card.classList.remove('animate-visible');
                setTimeout(() => {
                    card.classList.add('animate-visible');
                }, 50);
            } else {
                card.style.display = 'none';
            }
        });

        // 更新分页信息
        updatePaginationInfo(visibleCards);

        // 重新初始化分页
        initPagination();
    }

    // 更新分页信息
    function updatePaginationInfo(visibleCards) {
        // 更新显示信息
        const displayInfo = document.querySelector('.text-sm.text-gray-500 span:first-child');
        if (displayInfo) {
            displayInfo.textContent = `1-${Math.min(8, visibleCards)}`;
        }

        // 更新总数
        const totalInfo = document.querySelector('.text-sm.text-gray-500 span:last-child');
        if (totalInfo) {
            totalInfo.textContent = visibleCards;
        }
    }
}

// 初始化详情页功能
function initDetailPage() {
    // 开始翻译按钮
    const startBtn = document.getElementById('startTranslationBtn');
    if (startBtn) {
        startBtn.addEventListener('click', startTranslation);
    }

    // 导出翻译结果按钮
    const exportBtn = document.getElementById('exportTranslationBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            exportTranslation('csv');
        });
    }

    // 如果是翻译完成页面，显示翻译结果
    if (window.location.pathname.includes('detail-complete')) {
        displayTranslationResults();
    }
}

// 显示翻译结果
function displayTranslationResults() {
    // 获取选中的文件
    const files = JSON.parse(localStorage.getItem('uploadedFiles')) || [];
    const selectedFile = files.find(file => file.selected);

    if (!selectedFile) {
        console.error('没有选中的文件');
        return;
    }

    // 获取翻译结果
    const translationResults = JSON.parse(localStorage.getItem('translationResults')) || {};
    const result = translationResults[selectedFile.id];

    if (!result) {
        console.error('没有找到翻译结果');
        return;
    }

    // 更新统计数据
    updateTranslationStats(result);

    // 更新翻译表格
    updateTranslationTable(result);
}

// 更新翻译统计数据
function updateTranslationStats(result) {
    const statsCards = document.querySelectorAll('.stat-card .stat-value');
    if (statsCards.length < 4) return;

    // 计算统计数据
    const totalChars = result.sourceText.length;
    const totalWords = result.sourceText.trim().split(/\s+/).length;
    const repeatedWords = 0; // 这里需要实际计算重复词数
    const inconsistencies = 0; // 这里需要实际计算不一致数

    // 更新统计卡片
    statsCards[0].textContent = totalWords;
    statsCards[1].textContent = totalChars;
    statsCards[2].textContent = repeatedWords;
    statsCards[3].textContent = inconsistencies;

    // 更新进度条数据
    const progressActions = document.querySelectorAll('.progress-bar .progress-actions .progress-action');
    if (progressActions.length >= 4) {
        progressActions[0].textContent = totalWords;
        progressActions[1].textContent = totalChars;
        progressActions[2].textContent = repeatedWords;
        progressActions[3].textContent = inconsistencies;
    }
}

// 更新翻译表格
function updateTranslationTable(result) {
    const tableBody = document.querySelector('.translation-table tbody');
    if (!tableBody) return;

    // 清空表格
    tableBody.innerHTML = '';

    // 将文本分割成行
    const sourceLines = result.sourceText.split('\n');
    const targetLines = result.translatedText.split('\n');

    // 确保两个数组长度相同
    const maxLength = Math.max(sourceLines.length, targetLines.length);

    // 添加表格行
    for (let i = 0; i < maxLength; i++) {
        const sourceLine = sourceLines[i] || '';
        const targetLine = targetLines[i] || '';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="checkbox"></td>
            <td>General</td>
            <td>${sourceLine}</td>
            <td>${targetLine}</td>
            <td>-</td>
            <td>-</td>
            <td>-</td>
            <td><span class="bg-green-100 text-green-600 text-xs px-2 py-0.5 rounded">翻译成功</span></td>
        `;

        tableBody.appendChild(row);
    }
}

// LLM API配置
const API_CONFIG = {
    url: 'https://xiaohumini.site/v1/chat/completions',
    apiKey: 'sk-cUzgmE80oS3SGpOyLxLz7kRo6sRaC0ND1IvVMcZanObBhyzg',
    model: 'gemini-2.5-flash-preview-04-17'
};

// 调用LLM API进行翻译
async function callTranslationAPI(text, sourceLang, targetLang) {
    try {
        // 构建提示词
        const prompt = `请将以下${sourceLang}文本翻译成${targetLang}，只返回翻译结果，不要添加任何解释或额外内容：\n\n${text}`;

        // 构建API请求
        const response = await fetch(API_CONFIG.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_CONFIG.apiKey}`
            },
            body: JSON.stringify({
                model: API_CONFIG.model,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.3
            })
        });

        // 检查响应状态
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API错误: ${errorData.error?.message || '未知错误'}`);
        }

        // 解析响应
        const data = await response.json();
        const translatedText = data.choices[0].message.content.trim();

        return translatedText;
    } catch (error) {
        console.error('翻译API调用失败:', error);
        throw error;
    }
}

// 文本翻译相关函数
async function translateText() {
    const inputText = document.querySelector('.text-input')?.value;
    if (!inputText || inputText.trim() === '') return;

    // 获取翻译结果容器
    const translationResult = document.querySelector('.translation-result');
    if (!translationResult) return;

    // 显示加载状态
    translationResult.innerHTML = '<div class="flex justify-center items-center h-full"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div></div>';

    try {
        // 获取选中的语言
        const selectedSourceLang = document.querySelector('.language-tag.source.active')?.textContent.trim() || '英语';
        const selectedTargetLang = document.querySelector('.language-tag.target.active')?.textContent.trim() || '简体中文';

        // 调用翻译API
        const translatedText = await callTranslationAPI(inputText, selectedSourceLang, selectedTargetLang);

        // 构建结果对象
        const results = [
            {
                source: selectedSourceLang,
                text: inputText,
                target: selectedTargetLang,
                translation: translatedText
            }
        ];

        // 更新翻译结果
        updateTranslationResult(results);
    } catch (error) {
        // 显示错误信息
        translationResult.innerHTML = `<div class="text-red-500 p-4">翻译失败: ${error.message}</div>`;
    }
}

// 更新翻译结果
function updateTranslationResult(results) {
    const resultContainer = document.querySelector('.translation-result');
    if (!resultContainer) return;

    // 获取选中的输出格式
    const outputFormat = document.querySelector('input[name="format"]:checked')?.value || 'paragraph';

    let html = '';

    if (outputFormat === 'paragraph') {
        // 段落翻译格式
        results.forEach(item => {
            html += `
            <div class="mb-4">
                <div class="flex items-center justify-between mb-2">
                    <div class="text-xs text-gray-500">${item.source} → ${item.target}</div>
                    <div class="text-xs text-indigo-500">翻译完成</div>
                </div>
                <div class="p-3 bg-gray-50 rounded-md mb-2 text-gray-700">${item.text}</div>
                <div class="p-3 bg-indigo-50 rounded-md text-indigo-700">${item.translation}</div>
            </div>`;
        });
    } else {
        // 行对行翻译格式
        html += '<div class="border rounded-md overflow-hidden">';
        html += '<div class="grid grid-cols-2 bg-gray-100 text-xs text-gray-500 p-2 border-b">';
        html += `<div>${results[0].source}</div><div>${results[0].target}</div>`;
        html += '</div>';

        results.forEach(item => {
            const sourceLines = item.text.split('\n');
            const targetLines = item.translation.split('\n');

            // 确保两个数组长度相同
            const maxLength = Math.max(sourceLines.length, targetLines.length);

            for (let i = 0; i < maxLength; i++) {
                const sourceLine = sourceLines[i] || '';
                const targetLine = targetLines[i] || '';

                html += '<div class="grid grid-cols-2 border-b last:border-b-0">';
                html += `<div class="p-2 border-r">${sourceLine}</div>`;
                html += `<div class="p-2 text-indigo-600">${targetLine}</div>`;
                html += '</div>';
            }
        });

        html += '</div>';
    }

    resultContainer.innerHTML = html;

    // 更新字数统计
    updateWordCount(results);
}

// 更新输入框字数统计
function updateInputCount(textarea) {
    const countElement = textarea.nextElementSibling;
    if (!countElement) return;

    const text = textarea.value;
    const charCount = text.length;
    const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

    countElement.textContent = `${charCount}/500 字符 | ${wordCount} 词`;

    // 超出字数限制时添加红色提示
    if (charCount > 500) {
        countElement.classList.add('text-red-500');
        countElement.classList.remove('text-gray-400');
    } else {
        countElement.classList.add('text-gray-400');
        countElement.classList.remove('text-red-500');
    }
}

// 更新字数统计
function updateWordCount(results) {
    const wordCountElement = document.querySelector('.text-input + .text-right');
    if (!wordCountElement) return;

    let totalChars = 0;
    let totalWords = 0;

    results.forEach(item => {
        // 计算字符数
        totalChars += item.text.length;

        // 估算词数（简单实现，按空格分割）
        const words = item.text.trim().split(/\s+/);
        totalWords += words.length;
    });

    wordCountElement.textContent = `${totalChars}/500 字符 | ${totalWords} 词`;
}

// 应用页面相关函数
function navigateToAppDetail(appId) {
    // 导航到应用详情页
    window.location.href = `detail-start.html?id=${appId}`;
}

// 详情页相关函数
async function startTranslation() {
    // 获取选中的文件
    const files = JSON.parse(localStorage.getItem('uploadedFiles')) || [];
    const selectedFile = files.find(file => file.selected);

    if (!selectedFile) {
        alert('请先选择一个文件进行翻译');
        return;
    }

    // 显示加载状态
    const progressBar = document.querySelector('.progress-bar');
    if (progressBar) {
        const progressIcon = progressBar.querySelector('.progress-icon i');
        const progressText = progressBar.querySelector('.progress-text');

        if (progressIcon) progressIcon.className = 'fas fa-spinner fa-spin';
        if (progressText) progressText.textContent = '翻译中...';
    }

    try {
        // 模拟文件内容（实际应该从文件中读取）
        const fileContent = "Hello world\nThis is a test\nWelcome to the translation app";

        // 获取选中的语言（实际应该从界面中获取）
        const sourceLang = '英语';
        const targetLang = '简体中文';

        // 调用翻译API
        const translatedText = await callTranslationAPI(fileContent, sourceLang, targetLang);

        // 保存翻译结果到localStorage
        saveTranslationResult(selectedFile.id, {
            sourceText: fileContent,
            translatedText: translatedText,
            sourceLang: sourceLang,
            targetLang: targetLang,
            date: new Date().toISOString()
        });

        // 跳转到完成页面
        window.location.href = 'detail-complete.html';
    } catch (error) {
        console.error('翻译失败:', error);
        alert(`翻译失败: ${error.message}`);

        // 恢复进度条状态
        if (progressBar) {
            const progressIcon = progressBar.querySelector('.progress-icon i');
            const progressText = progressBar.querySelector('.progress-text');

            if (progressIcon) progressIcon.className = 'fas fa-play';
            if (progressText) progressText.textContent = '未开始';
        }
    }
}

// 保存翻译结果
function saveTranslationResult(fileId, result) {
    const translationResults = JSON.parse(localStorage.getItem('translationResults')) || {};
    translationResults[fileId] = result;
    localStorage.setItem('translationResults', JSON.stringify(translationResults));
}

// 导出翻译结果
function exportTranslation(format) {
    // 获取选中的文件
    const files = JSON.parse(localStorage.getItem('uploadedFiles')) || [];
    const selectedFile = files.find(file => file.selected);

    if (!selectedFile) {
        alert('请先选择一个文件');
        return;
    }

    // 获取翻译结果
    const translationResults = JSON.parse(localStorage.getItem('translationResults')) || {};
    const result = translationResults[selectedFile.id];

    if (!result) {
        alert('没有找到翻译结果');
        return;
    }

    // 根据格式导出
    if (format === 'csv') {
        exportAsCSV(selectedFile.name, result);
    } else if (format === 'txt') {
        exportAsTXT(selectedFile.name, result);
    } else {
        alert('不支持的导出格式');
    }
}

// 导出为CSV
function exportAsCSV(fileName, result) {
    // 准备CSV内容
    let csvContent = 'Source,Target\n';

    // 将文本分割成行
    const sourceLines = result.sourceText.split('\n');
    const targetLines = result.translatedText.split('\n');

    // 确保两个数组长度相同
    const maxLength = Math.max(sourceLines.length, targetLines.length);

    // 添加每一行
    for (let i = 0; i < maxLength; i++) {
        const sourceLine = sourceLines[i] || '';
        const targetLine = targetLines[i] || '';

        // 处理CSV中的特殊字符
        const escapedSource = sourceLine.replace(/"/g, '""');
        const escapedTarget = targetLine.replace(/"/g, '""');

        csvContent += `"${escapedSource}","${escapedTarget}"\n`;
    }

    // 创建Blob并下载
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    // 创建下载链接
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${fileName.split('.')[0]}_translated.csv`);
    document.body.appendChild(link);

    // 触发下载
    link.click();

    // 清理
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// 导出为TXT
function exportAsTXT(fileName, result) {
    // 准备TXT内容
    let txtContent = `源语言: ${result.sourceLang}\n`;
    txtContent += `目标语言: ${result.targetLang}\n`;
    txtContent += `翻译日期: ${new Date(result.date).toLocaleString()}\n\n`;
    txtContent += `原文:\n${result.sourceText}\n\n`;
    txtContent += `译文:\n${result.translatedText}`;

    // 创建Blob并下载
    const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    // 创建下载链接
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${fileName.split('.')[0]}_translated.txt`);
    document.body.appendChild(link);

    // 触发下载
    link.click();

    // 清理
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// 初始化图表
function initCharts() {
    const statsChart = document.getElementById('statsChart');
    if (!statsChart) return;

    // 使用Chart.js创建图表
    const ctx = statsChart.getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['总词', '总字符数', '重复', '不一致数'],
            datasets: [{
                label: '翻译统计',
                data: [123456, 595959, 33, 0],
                backgroundColor: [
                    'rgba(99, 102, 241, 0.6)',
                    'rgba(59, 130, 246, 0.6)',
                    'rgba(16, 185, 129, 0.6)',
                    'rgba(239, 68, 68, 0.6)'
                ],
                borderColor: [
                    'rgba(99, 102, 241, 1)',
                    'rgba(59, 130, 246, 1)',
                    'rgba(16, 185, 129, 1)',
                    'rgba(239, 68, 68, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}