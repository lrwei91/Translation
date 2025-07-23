// 自定义分页管理系统
class CustomTabsManager {
    constructor() {
        this.storageKey = 'navigation_custom_data';
        this.customData = this.loadCustomData();
        this.currentTab = 'common';
        this.currentLinkTab = null;
        this.deleteTarget = null;
        this.deleteType = null;
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderCustomTabs();
        this.renderCustomContent();
        this.initializeLinkCards();
        this.setActiveTab('common');
    }

    // 本地存储管理
    loadCustomData() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : { tabs: [], links: {} };
        } catch (e) {
            console.error('加载自定义数据失败:', e);
            return { tabs: [], links: {} };
        }
    }

    saveCustomData() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.customData));
            console.log('自定义数据已保存');
        } catch (e) {
            console.error('保存自定义数据失败:', e);
        }
    }

    // 事件绑定
    bindEvents() {
        this.bindTabEvents();
        this.bindModalEvents();
        this.bindKeyboardEvents();
    }

    bindTabEvents() {
        const tabsNav = document.querySelector('.tabs-nav');
        
        // 分页点击事件（使用事件委托）
        tabsNav.addEventListener('click', (e) => {
            if (e.target.closest('.delete-tab-btn')) {
                // 删除分页按钮
                e.preventDefault();
                e.stopPropagation();
                const tabBtn = e.target.closest('.tab-btn');
                const tabId = tabBtn.getAttribute('data-tab');
                this.showDeleteConfirm('tab', tabId, tabBtn.textContent);
                return;
            }
            
            if (e.target.closest('.add-tab-btn')) {
                // 添加分页按钮
                e.preventDefault();
                e.stopPropagation();
                this.showAddTabModal();
                return;
            }
            
            if (e.target.closest('.tab-btn') && !e.target.closest('.delete-tab-btn')) {
                // 分页切换
                e.preventDefault();
                e.stopPropagation();
                const tabBtn = e.target.closest('.tab-btn');
                const targetTab = tabBtn.getAttribute('data-tab');
                if (targetTab) {
                    this.switchTab(targetTab, tabBtn);
                }
                return;
            }
        });

        // 内容区域点击事件（使用事件委托）
        const tabsContent = document.querySelector('.tabs-content');
        tabsContent.addEventListener('click', (e) => {
            if (e.target.closest('.delete-link-btn')) {
                // 删除链接按钮
                e.preventDefault();
                e.stopPropagation();
                const linkCard = e.target.closest('.link-card');
                const linkId = linkCard.getAttribute('data-link-id');
                const linkName = linkCard.textContent.replace('×', '').trim();
                this.showDeleteConfirm('link', linkId, linkName);
                return;
            }
            
            if (e.target.closest('.add-link-btn')) {
                // 添加链接按钮
                e.preventDefault();
                e.stopPropagation();
                const tabId = e.target.closest('.tab-panel').id;
                this.currentLinkTab = tabId;
                this.showAddLinkModal();
                return;
            }
        });
    }

    bindModalEvents() {
        // 添加分页模态框
        const addTabModal = document.getElementById('addTabModal');
        const closeAddTabModal = document.getElementById('closeAddTabModal');
        const cancelAddTab = document.getElementById('cancelAddTab');
        const confirmAddTab = document.getElementById('confirmAddTab');
        const confirmImportBookmark = document.getElementById('confirmImportBookmark');
        const tabNameInput = document.getElementById('tabNameInput');
        const bookmarkFileInput = document.getElementById('bookmarkFileInput');

        closeAddTabModal.addEventListener('click', () => this.hideModal('addTabModal'));
        cancelAddTab.addEventListener('click', () => this.hideModal('addTabModal'));
        confirmAddTab.addEventListener('click', () => this.addCustomTab());
        confirmImportBookmark.addEventListener('click', () => this.importBookmarks());
        
        tabNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addCustomTab();
        });

        // 方法选择选项卡切换
        const methodTabBtns = document.querySelectorAll('.method-tab-btn');
        methodTabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const method = e.target.closest('.method-tab-btn').getAttribute('data-method');
                this.switchAddMethod(method);
            });
        });

        // 文件选择变化事件
        bookmarkFileInput.addEventListener('change', (e) => {
            const confirmBtn = document.getElementById('confirmImportBookmark');
            confirmBtn.disabled = !e.target.files.length;
        });

        // 添加链接模态框
        const addLinkModal = document.getElementById('addLinkModal');
        const closeAddLinkModal = document.getElementById('closeAddLinkModal');
        const cancelAddLink = document.getElementById('cancelAddLink');
        const confirmAddLink = document.getElementById('confirmAddLink');
        const linkNameInput = document.getElementById('linkNameInput');
        const linkUrlInput = document.getElementById('linkUrlInput');

        closeAddLinkModal.addEventListener('click', () => this.hideModal('addLinkModal'));
        cancelAddLink.addEventListener('click', () => this.hideModal('addLinkModal'));
        confirmAddLink.addEventListener('click', () => this.addCustomLink());
        
        linkUrlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addCustomLink();
        });

        // 确认删除模态框
        const confirmDeleteModal = document.getElementById('confirmDeleteModal');
        const closeConfirmDeleteModal = document.getElementById('closeConfirmDeleteModal');
        const cancelDelete = document.getElementById('cancelDelete');
        const confirmDelete = document.getElementById('confirmDelete');

        closeConfirmDeleteModal.addEventListener('click', () => this.hideModal('confirmDeleteModal'));
        cancelDelete.addEventListener('click', () => this.hideModal('confirmDeleteModal'));
        confirmDelete.addEventListener('click', () => this.executeDelete());

        // 点击遮罩关闭模态框
        [addTabModal, addLinkModal, confirmDeleteModal].forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal(modal.id);
                }
            });
        });
    }

    bindKeyboardEvents() {
        document.addEventListener('keydown', (e) => {
            // ESC 键关闭模态框
            if (e.key === 'Escape') {
                this.hideAllModals();
            }
        });
    }

    // 分页管理
    switchTab(targetTab, clickedButton) {
        if (!targetTab || !clickedButton) return;
        
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabPanels = document.querySelectorAll('.tab-panel');
        
        // 移除所有活动状态
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabPanels.forEach(panel => panel.classList.remove('active'));
        
        // 添加活动状态
        clickedButton.classList.add('active');
        const targetPanel = document.getElementById(targetTab);
        if (targetPanel) {
            targetPanel.classList.add('active');
            this.currentTab = targetTab;
            
            // 添加切换动画
            targetPanel.style.animation = 'none';
            setTimeout(() => {
                targetPanel.style.animation = 'fadeIn 0.3s ease';
            }, 10);
        }
    }

    setActiveTab(tabId) {
        const tabButton = document.querySelector(`[data-tab="${tabId}"]`);
        if (tabButton) {
            this.switchTab(tabId, tabButton);
        }
    }

    // 渲染自定义分页
    renderCustomTabs() {
        const tabsNav = document.querySelector('.tabs-nav');
        const addTabBtn = document.getElementById('addTabBtn');
        
        // 移除现有的自定义分页按钮
        const existingCustomTabs = tabsNav.querySelectorAll('.tab-btn:not([data-default]):not(.add-tab-btn)');
        existingCustomTabs.forEach(tab => tab.remove());
        
        // 添加自定义分页按钮
        this.customData.tabs.forEach(tab => {
            const tabBtn = this.createTabButton(tab);
            tabsNav.insertBefore(tabBtn, addTabBtn);
        });
    }

    createTabButton(tab) {
        const tabBtn = document.createElement('button');
        tabBtn.className = 'tab-btn';
        tabBtn.setAttribute('data-tab', tab.id);
        tabBtn.innerHTML = `
            <span class="tab-icon">📁</span>
            <span>${tab.name}</span>
            <button class="delete-tab-btn" title="删除分页">×</button>
        `;
        return tabBtn;
    }

    // 渲染自定义内容
    renderCustomContent() {
        const tabsContent = document.querySelector('.tabs-content');
        
        // 移除现有的自定义分页内容
        const existingCustomPanels = tabsContent.querySelectorAll('.tab-panel.custom-tab');
        existingCustomPanels.forEach(panel => panel.remove());
        
        // 添加自定义分页内容
        this.customData.tabs.forEach(tab => {
            const tabPanel = this.createTabPanel(tab);
            tabsContent.appendChild(tabPanel);
        });
    }

    createTabPanel(tab) {
        const tabPanel = document.createElement('div');
        tabPanel.className = 'tab-panel custom-tab';
        tabPanel.id = tab.id;
        
        const links = this.customData.links[tab.id] || {};
        const categories = this.groupLinksByCategory(links);
        
        let contentHTML = '<div class="content-grid">';
        
        if (Object.keys(categories).length === 0) {
            // 空分页
            contentHTML += `
                <div class="content-section">
                    <h2 class="section-title">${tab.name}</h2>
                    <div class="link-grid">
                        <button class="add-link-btn">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                            添加链接
                        </button>
                    </div>
                </div>
            `;
        } else {
            // 有内容的分页
            Object.entries(categories).forEach(([category, categoryLinks]) => {
                contentHTML += `
                    <div class="content-section">
                        <h2 class="section-title">${category}</h2>
                        <div class="link-grid">
                `;
                
                Object.entries(categoryLinks).forEach(([linkId, link]) => {
                    contentHTML += `
                        <a href="${link.url}" target="_blank" class="link-card custom-link" data-link-id="${linkId}">
                            <span class="link-icon">🔗</span>
                            <span>${link.name}</span>
                            <button class="delete-link-btn" title="删除链接">×</button>
                        </a>
                    `;
                });
                
                contentHTML += `
                            <button class="add-link-btn">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                                添加链接
                            </button>
                        </div>
                    </div>
                `;
            });
        }
        
        contentHTML += '</div>';
        tabPanel.innerHTML = contentHTML;
        
        return tabPanel;
    }

    groupLinksByCategory(links) {
        const categories = {};
        
        Object.entries(links).forEach(([linkId, link]) => {
            const category = link.category || '默认分类';
            if (!categories[category]) {
                categories[category] = {};
            }
            categories[category][linkId] = link;
        });
        
        return categories;
    }

    // 模态框管理
    showAddTabModal() {
        const modal = document.getElementById('addTabModal');
        const tabNameInput = document.getElementById('tabNameInput');
        const fileInput = document.getElementById('bookmarkFileInput');
        
        // 重置表单
        tabNameInput.value = '';
        fileInput.value = '';
        
        // 切换到手动创建模式
        this.switchAddMethod('manual');
        
        // 聚焦到输入框
        tabNameInput.focus();
        modal.classList.remove('hidden');
    }

    switchAddMethod(method) {
        const methodBtns = document.querySelectorAll('.method-tab-btn');
        const methodPanels = document.querySelectorAll('.method-panel');
        const confirmAddBtn = document.getElementById('confirmAddTab');
        const confirmImportBtn = document.getElementById('confirmImportBookmark');
        
        // 切换选项卡状态
        methodBtns.forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-method') === method);
        });
        
        // 切换面板显示
        methodPanels.forEach(panel => {
            if (method === 'manual' && panel.id === 'manualAddPanel') {
                panel.classList.add('active');
            } else if (method === 'import' && panel.id === 'importBookmarkPanel') {
                panel.classList.add('active');
            } else {
                panel.classList.remove('active');
            }
        });
        
        // 切换按钮显示
        if (method === 'manual') {
            confirmAddBtn.classList.remove('hidden');
            confirmImportBtn.classList.add('hidden');
            // 聚焦到名称输入框
            setTimeout(() => {
                document.getElementById('tabNameInput').focus();
            }, 100);
        } else {
            confirmAddBtn.classList.add('hidden');
            confirmImportBtn.classList.remove('hidden');
            // 重置导入按钮状态
            confirmImportBtn.disabled = true;
        }
    }

    showAddLinkModal() {
        const modal = document.getElementById('addLinkModal');
        const nameInput = document.getElementById('linkNameInput');
        const urlInput = document.getElementById('linkUrlInput');
        const categoryInput = document.getElementById('linkCategoryInput');
        
        nameInput.value = '';
        urlInput.value = '';
        categoryInput.value = '';
        nameInput.focus();
        modal.classList.remove('hidden');
    }

    showDeleteConfirm(type, id, name) {
        this.deleteType = type;
        this.deleteTarget = id;
        
        const modal = document.getElementById('confirmDeleteModal');
        const text = document.getElementById('deleteConfirmText');
        
        if (type === 'tab') {
            text.textContent = `确认要删除分页"${name}"吗？此操作将同时删除该分页下的所有链接，且不可撤销。`;
        } else {
            text.textContent = `确认要删除链接"${name}"吗？此操作不可撤销。`;
        }
        
        modal.classList.remove('hidden');
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.add('hidden');
        
        // 清理状态
        if (modalId === 'addLinkModal') {
            this.currentLinkTab = null;
        }
        if (modalId === 'confirmDeleteModal') {
            this.deleteTarget = null;
            this.deleteType = null;
        }
        if (modalId === 'addTabModal') {
            // 重置到默认状态
            this.switchAddMethod('manual');
        }
    }

    hideAllModals() {
        ['addTabModal', 'addLinkModal', 'confirmDeleteModal'].forEach(modalId => {
            this.hideModal(modalId);
        });
    }

    // 书签导入功能
    async importBookmarks() {
        const fileInput = document.getElementById('bookmarkFileInput');
        const file = fileInput.files[0];
        
        if (!file) {
            alert('请选择书签文件');
            return;
        }
        
        if (!file.name.toLowerCase().endsWith('.html')) {
            alert('请选择HTML格式的书签文件');
            return;
        }
        
        try {
            const content = await this.readFileAsText(file);
            const bookmarkData = this.parseBookmarkFile(content);
            
            if (bookmarkData.length === 0) {
                alert('未找到有效的书签数据');
                return;
            }
            
            // 导入确认
            const importCount = bookmarkData.reduce((count, folder) => count + folder.links.length, 0);
            if (!confirm(`发现 ${bookmarkData.length} 个书签文件夹，共 ${importCount} 个链接。确认导入吗？`)) {
                return;
            }
            
            // 执行导入
            this.executeBookmarkImport(bookmarkData);
            this.hideModal('addTabModal');
            
            alert(`导入成功！已添加 ${bookmarkData.length} 个分页和 ${importCount} 个链接`);
            
        } catch (error) {
            console.error('导入书签失败:', error);
            alert('导入失败：' + error.message);
        }
    }

    readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('文件读取失败'));
            reader.readAsText(file, 'UTF-8');
        });
    }

    parseBookmarkFile(htmlContent) {
        // 创建临时DOM来解析HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        
        const bookmarkData = [];
        
        // 查找所有DT标签（书签文件夹和链接的容器）
        const dtElements = doc.querySelectorAll('dt');
        
        dtElements.forEach(dt => {
            const h3 = dt.querySelector('h3');
            if (h3) {
                // 这是一个文件夹
                const folderName = h3.textContent.trim();
                if (!folderName) return;
                
                // 找到该文件夹下的所有链接
                const nextDl = dt.querySelector('dl');
                const links = [];
                
                if (nextDl) {
                    const linkElements = nextDl.querySelectorAll('a');
                    linkElements.forEach(a => {
                        const name = a.textContent.trim();
                        const url = a.getAttribute('href');
                        
                        if (name && url && (url.startsWith('http://') || url.startsWith('https://'))) {
                            links.push({ name, url });
                        }
                    });
                }
                
                if (links.length > 0) {
                    bookmarkData.push({
                        folderName,
                        links
                    });
                }
            }
        });
        
        return bookmarkData;
    }

    executeBookmarkImport(bookmarkData) {
        let tabCounter = 0;
        let linkCounter = 0;
        
        bookmarkData.forEach(folder => {
            // 生成唯一的分页ID
            const timestamp = Date.now();
            const tabId = `imported_${timestamp}_tab_${tabCounter++}`;
            
            // 检查分页名称是否已存在，如果存在则添加后缀
            let tabName = folder.folderName;
            let suffix = 1;
            while (this.customData.tabs.some(tab => tab.name === tabName)) {
                tabName = `${folder.folderName} (${suffix})`;
                suffix++;
            }
            
            // 添加新分页
            const newTab = { id: tabId, name: tabName };
            this.customData.tabs.push(newTab);
            
            // 添加链接
            this.customData.links[tabId] = {};
            folder.links.forEach(link => {
                const linkId = `imported_${timestamp}_link_${linkCounter++}`;
                this.customData.links[tabId][linkId] = {
                    id: linkId,
                    name: link.name,
                    url: link.url,
                    category: '导入的书签'
                };
            });
        });
        
        // 保存数据并更新UI
        this.saveCustomData();
        this.renderCustomTabs();
        this.renderCustomContent();
        
        console.log('书签导入完成:', bookmarkData);
    }

    // 添加功能
    addCustomTab() {
        const nameInput = document.getElementById('tabNameInput');
        const name = nameInput.value.trim();
        
        if (!name) {
            alert('请输入分页名称');
            nameInput.focus();
            return;
        }
        
        if (name.length > 10) {
            alert('分页名称不能超过10个字符');
            nameInput.focus();
            return;
        }
        
        // 生成唯一ID
        const id = 'custom_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
        
        // 检查是否重名
        const exists = this.customData.tabs.some(tab => tab.name === name);
        if (exists) {
            alert('分页名称已存在，请使用其他名称');
            nameInput.focus();
            return;
        }
        
        // 添加到数据
        const newTab = { id, name };
        this.customData.tabs.push(newTab);
        this.customData.links[id] = {};
        
        // 保存并更新UI
        this.saveCustomData();
        this.renderCustomTabs();
        this.renderCustomContent();
        
        // 关闭模态框并切换到新分页
        this.hideModal('addTabModal');
        setTimeout(() => {
            this.setActiveTab(id);
        }, 100);
        
        console.log('已添加自定义分页:', newTab);
    }

    addCustomLink() {
        if (!this.currentLinkTab) {
            alert('请选择要添加链接的分页');
            return;
        }
        
        const nameInput = document.getElementById('linkNameInput');
        const urlInput = document.getElementById('linkUrlInput');
        const categoryInput = document.getElementById('linkCategoryInput');
        
        const name = nameInput.value.trim();
        const url = urlInput.value.trim();
        const category = categoryInput.value.trim() || '默认分类';
        
        if (!name) {
            alert('请输入链接名称');
            nameInput.focus();
            return;
        }
        
        if (!url) {
            alert('请输入链接地址');
            urlInput.focus();
            return;
        }
        
        // 简单URL验证
        if (!url.match(/^https?:\/\/.+/)) {
            alert('请输入有效的URL地址（必须以http://或https://开头）');
            urlInput.focus();
            return;
        }
        
        // 生成唯一ID
        const id = 'link_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
        
        // 确保链接对象存在
        if (!this.customData.links[this.currentLinkTab]) {
            this.customData.links[this.currentLinkTab] = {};
        }
        
        // 添加到数据
        const newLink = { id, name, url, category };
        this.customData.links[this.currentLinkTab][id] = newLink;
        
        // 保存并更新UI
        this.saveCustomData();
        this.renderCustomContent();
        
        // 关闭模态框
        this.hideModal('addLinkModal');
        
        console.log('已添加自定义链接:', newLink);
    }

    // 删除功能
    executeDelete() {
        if (!this.deleteTarget || !this.deleteType) return;
        
        if (this.deleteType === 'tab') {
            this.deleteCustomTab(this.deleteTarget);
        } else {
            this.deleteCustomLink(this.deleteTarget);
        }
        
        this.hideModal('confirmDeleteModal');
    }

    deleteCustomTab(tabId) {
        // 从数据中移除
        this.customData.tabs = this.customData.tabs.filter(tab => tab.id !== tabId);
        delete this.customData.links[tabId];
        
        // 如果当前正在查看被删除的分页，切换到默认分页
        if (this.currentTab === tabId) {
            this.setActiveTab('common');
        }
        
        // 保存并更新UI
        this.saveCustomData();
        this.renderCustomTabs();
        this.renderCustomContent();
        
        console.log('已删除自定义分页:', tabId);
    }

    deleteCustomLink(linkId) {
        // 找到并删除链接
        let deletedFromTab = null;
        Object.keys(this.customData.links).forEach(tabId => {
            if (this.customData.links[tabId][linkId]) {
                delete this.customData.links[tabId][linkId];
                deletedFromTab = tabId;
                console.log('已删除自定义链接:', linkId);
            }
        });
        
        // 保存并更新UI
        this.saveCustomData();
        this.renderCustomContent();
        
        // 如果删除的链接在当前显示的分页中，重新激活该分页以刷新显示
        if (deletedFromTab && deletedFromTab === this.currentTab) {
            setTimeout(() => {
                this.setActiveTab(this.currentTab);
            }, 50);
        }
    }

    // 初始化链接卡片效果
    initializeLinkCards() {
        // 为所有链接卡片添加点击效果
        document.addEventListener('click', (e) => {
            const target = e.target;
            if (target && target.nodeType === Node.ELEMENT_NODE && 
                target.classList.contains('link-card') && 
                !target.closest('.delete-link-btn')) {
                const card = target;
                
                // 添加点击动画（不阻止默认行为）
                card.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    card.style.transform = '';
                }, 150);
                
                // 记录点击统计
                this.trackLinkClick(card);
            }
        });
        
        // 添加悬停效果
        document.addEventListener('mouseenter', (e) => {
            const target = e.target;
            if (target && target.nodeType === Node.ELEMENT_NODE && 
                target.classList.contains('link-card')) {
                target.style.transform = 'translateY(-2px) scale(1.02)';
            }
        }, true);
        
        document.addEventListener('mouseleave', (e) => {
            const target = e.target;
            if (target && target.nodeType === Node.ELEMENT_NODE && 
                target.classList.contains('link-card')) {
                target.style.transform = '';
            }
        }, true);
    }

    trackLinkClick(linkElement) {
        const linkText = linkElement.textContent.replace('×', '').trim();
        const linkUrl = linkElement.href;
        
        console.log(`链接被点击: ${linkText} -> ${linkUrl}`);
    }

    // 导入导出功能
    exportData() {
        const data = JSON.stringify(this.customData, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'navigation_custom_data.json';
        a.click();
        
        URL.revokeObjectURL(url);
    }

    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            if (data.tabs && data.links) {
                this.customData = data;
                this.saveCustomData();
                this.renderCustomTabs();
                this.renderCustomContent();
                console.log('数据导入成功');
                return true;
            }
        } catch (e) {
            console.error('数据导入失败:', e);
        }
        return false;
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    window.customTabsManager = new CustomTabsManager();
    
    // 暴露导入导出功能到全局，方便调试
    window.exportNavigationData = () => window.customTabsManager.exportData();
    window.importNavigationData = (data) => window.customTabsManager.importData(data);
}); 