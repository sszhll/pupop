class PomodoroTimer {
    constructor() {
        this.timeLeft = 25 * 60;
        this.isRunning = false;
        this.tasks = [];
        this.tags = [];
        this.currentTask = null;
        this.updateInterval = null;
        this.chart = null;

        this.initializeElements();
        this.setupEventListeners();
        this.loadData();
        this.loadState();
    }

    initializeElements() {
        // Timer elements
        this.timeDisplay = document.getElementById('time');
        this.currentTaskName = document.getElementById('currentTaskName');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');

        // Task elements
        this.taskInput = document.getElementById('taskInput');
        this.timeInput = document.getElementById('timeInput');
        this.taskTag = document.getElementById('taskTag');
        this.addTaskBtn = document.getElementById('addTaskBtn');
        this.taskList = document.getElementById('taskList');

        // Tag elements
        this.tagInput = document.getElementById('tagInput');
        this.tagColor = document.getElementById('tagColor');
        this.addTagBtn = document.getElementById('addTagBtn');
        this.tagList = document.getElementById('tagList');
        this.newTagBtn = document.getElementById('newTagBtn');

        // Stats elements
        this.statsTimeRange = document.getElementById('statsTimeRange');
        this.statsChart = document.getElementById('statsChart');
        this.statsSummary = document.getElementById('statsSummary');

        // Tabs
        this.tabBtns = document.querySelectorAll('.tab-btn');
        this.tabPanels = document.querySelectorAll('.tab-panel');
    }

    setupEventListeners() {
        // Timer controls
        this.startBtn.addEventListener('click', () => this.startTimer());
        this.pauseBtn.addEventListener('click', () => this.pauseTimer());
        this.resetBtn.addEventListener('click', () => this.resetTimer());
        
        // Task management
        this.addTaskBtn.addEventListener('click', () => this.addTask());
        this.newTagBtn.addEventListener('click', () => this.showTagPanel());
        
        // Tag management
        this.addTagBtn.addEventListener('click', () => this.addTag());
        
        // Stats
        this.statsTimeRange.addEventListener('change', () => this.updateStats());
        
        // Tabs
        this.tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });
    }

    async loadData() {
        const data = await chrome.storage.local.get(['tasks', 'tags', 'completedTasks']);
        this.tasks = data.tasks || [];
        this.tags = data.tags || [];
        this.completedTasks = data.completedTasks || [];
        
        this.renderTasks();
        this.renderTags();
        this.updateTagSelect();
        this.updateStats();
    }

    switchTab(tabId) {
        this.tabBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabId);
        });
        this.tabPanels.forEach(panel => {
            panel.classList.toggle('active', panel.id === tabId);
        });
        
        if (tabId === 'stats') {
            this.updateStats();
        }
    }

    showTagPanel() {
        this.switchTab('tags');
    }

    addTag() {
        const name = this.tagInput.value.trim();
        const color = this.tagColor.value;
        
        if (name) {
            const tag = {
                id: Date.now(),
                name,
                color
            };
            
            this.tags.push(tag);
            this.saveTags();
            this.renderTags();
            this.updateTagSelect();
            
            this.tagInput.value = '';
        }
    }

    renderTags() {
        this.tagList.innerHTML = '';
        this.tags.forEach(tag => {
            const div = document.createElement('div');
            div.className = 'tag-item';
            div.style.backgroundColor = tag.color;
            
            const tagName = document.createElement('span');
            tagName.textContent = tag.name;
            
            const deleteButton = document.createElement('button');
            deleteButton.className = 'icon-btn';
            deleteButton.textContent = '×';
            deleteButton.addEventListener('click', () => this.deleteTag(tag.id));
            
            div.appendChild(tagName);
            div.appendChild(deleteButton);
            
            this.tagList.appendChild(div);
        });
    }

    updateTagSelect() {
        this.taskTag.innerHTML = '<option value="">选择标签</option>';
        this.tags.forEach(tag => {
            const option = document.createElement('option');
            option.value = tag.id;
            option.textContent = tag.name;
            this.taskTag.appendChild(option);
        });
    }

    deleteTag(tagId) {
        this.tags = this.tags.filter(tag => tag.id !== tagId);
        this.saveTags();
        this.renderTags();
        this.updateTagSelect();
    }

    addTask() {
        const name = this.taskInput.value.trim();
        const duration = parseInt(this.timeInput.value);
        const tagId = this.taskTag.value;

        if (name && duration > 0) {
            const task = {
                id: Date.now(),
                name,
                duration,
                tagId: tagId ? parseInt(tagId) : null,
                createdAt: new Date().toISOString()
            };

            this.tasks.push(task);
            this.saveTasks();
            this.renderTask(task);
            
            this.taskInput.value = '';
            this.timeInput.value = '25';
            this.taskTag.value = '';
        }
    }

    renderTask(task) {
        const div = document.createElement('div');
        div.className = 'task-item';
        
        const tag = task.tagId ? this.tags.find(t => t.id === task.tagId) : null;
        
        // 创建任务信息区域
        const taskInfo = document.createElement('div');
        taskInfo.className = 'task-info';
        
        const taskName = document.createElement('div');
        taskName.className = 'task-name';
        taskName.textContent = task.name;
        
        const taskMeta = document.createElement('div');
        taskMeta.className = 'task-meta';
        
        const duration = document.createElement('span');
        duration.textContent = `${task.duration} 分钟`;
        taskMeta.appendChild(duration);
        
        if (tag) {
            const tagSpan = document.createElement('span');
            tagSpan.className = 'task-tag';
            tagSpan.style.backgroundColor = tag.color;
            tagSpan.textContent = tag.name;
            taskMeta.appendChild(tagSpan);
        }
        
        taskInfo.appendChild(taskName);
        taskInfo.appendChild(taskMeta);
        
        // 创建任务操作区域
        const taskActions = document.createElement('div');
        taskActions.className = 'task-actions';
        
        const startButton = document.createElement('button');
        startButton.className = 'icon-btn';
        startButton.textContent = '▶';
        startButton.addEventListener('click', () => this.startTaskTimer(task.id));
        
        const deleteButton = document.createElement('button');
        deleteButton.className = 'icon-btn';
        deleteButton.textContent = '×';
        deleteButton.addEventListener('click', () => this.deleteTask(task.id));
        
        taskActions.appendChild(startButton);
        taskActions.appendChild(deleteButton);
        
        div.appendChild(taskInfo);
        div.appendChild(taskActions);
        
        this.taskList.appendChild(div);
    }

    async startTimer() {
        if (!this.isRunning) {
            this.isRunning = true;
            const response = await this.sendMessage({
                action: 'START_TIMER',
                task: this.currentTask,
                duration: this.currentTask ? this.currentTask.duration : (parseInt(this.timeInput.value) || 25)
            });

            if (response && response.success) {
                this.timeLeft = response.timeLeft;
                this.currentTask = response.currentTask;
                if (this.currentTask) {
                    this.currentTaskName.textContent = this.currentTask.name;
                }
                this.startUpdateInterval();
                this.updateButtons();
                this.updateDisplay();
            }
        }
    }

    async startTaskTimer(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            this.currentTask = task;
            this.timeLeft = task.duration * 60;
            this.currentTaskName.textContent = task.name;
            await this.startTimer();
            this.updateDisplay();
            this.updateButtons();
        }
    }

    completeTask(task) {
        const completedTask = {
            ...task,
            completedAt: new Date().toISOString()
        };
        
        this.completedTasks.push(completedTask);
        this.saveCompletedTasks();
        this.updateStats();
    }

    updateStats() {
        const range = this.statsTimeRange.value;
        const stats = this.calculateStats(range);
        this.renderChart(stats);
        this.renderStatsSummary(stats);
    }

    calculateStats(range) {
        const now = new Date();
        let startDate;
        
        switch (range) {
            case 'today':
                startDate = new Date(now.setHours(0, 0, 0, 0));
                break;
            case 'week':
                startDate = new Date(now.setDate(now.getDate() - 7));
                break;
            case 'month':
                startDate = new Date(now.setMonth(now.getMonth() - 1));
                break;
            default:
                startDate = new Date(0);
        }

        const filteredTasks = this.completedTasks.filter(task => 
            new Date(task.completedAt) >= startDate
        );

        const tagStats = {};
        let totalMinutes = 0;

        filteredTasks.forEach(task => {
            const tag = task.tagId ? this.tags.find(t => t.id === task.tagId) : null;
            const tagName = tag ? tag.name : '未分类';
            
            if (!tagStats[tagName]) {
                tagStats[tagName] = {
                    minutes: 0,
                    color: tag ? tag.color : '#999'
                };
            }
            
            tagStats[tagName].minutes += task.duration;
            totalMinutes += task.duration;
        });

        return {
            tagStats,
            totalMinutes,
            taskCount: filteredTasks.length
        };
    }

    renderChart(stats) {
        const ctx = this.statsChart.getContext('2d');
        
        if (this.chart) {
            this.chart.destroy();
        }

        const labels = Object.keys(stats.tagStats);
        const data = labels.map(label => stats.tagStats[label].minutes);
        const colors = labels.map(label => stats.tagStats[label].color);

        this.chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels,
                datasets: [{
                    data,
                    backgroundColor: colors
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    renderStatsSummary(stats) {
        const hours = Math.floor(stats.totalMinutes / 60);
        const minutes = stats.totalMinutes % 60;
        
        this.statsSummary.innerHTML = `
            <div>完成任务数：${stats.taskCount}</div>
            <div>总专注时间：${hours}小时${minutes}分钟</div>
        `;
    }

    async loadState() {
        // 从后台获取当前状态
        const state = await this.sendMessage({ action: 'GET_STATE' });
        if (state) {
            this.isRunning = state.isRunning;
            this.timeLeft = state.timeLeft;
            this.currentTask = state.currentTask;
            this.updateDisplay();
            this.updateButtons();
            
            // 如果计时器正在运行，开始更新显示
            if (this.isRunning) {
                this.startUpdateInterval();
            }
        }
    }

    sendMessage(message) {
        return new Promise((resolve) => {
            chrome.runtime.sendMessage(message, (response) => {
                resolve(response);
            });
        });
    }

    startUpdateInterval() {
        // 清除可能存在的旧计时器
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        // 每秒更新显示
        this.updateInterval = setInterval(async () => {
            const state = await this.sendMessage({ action: 'GET_STATE' });
            if (state) {
                this.timeLeft = state.timeLeft;
                this.isRunning = state.isRunning;
                if (state.currentTask) {
                    this.currentTask = state.currentTask;
                    this.currentTaskName.textContent = state.currentTask.name;
                }
                this.updateDisplay();
                
                // 如果计时结束，停止更新
                if (!state.isRunning || state.timeLeft <= 0) {
                    this.stopUpdateInterval();
                    this.isRunning = false;
                    this.currentTask = null;
                    this.currentTaskName.textContent = '';
                    this.updateButtons();
                }
            }
        }, 1000);
    }

    stopUpdateInterval() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    pauseTimer() {
        if (this.isRunning) {
            this.isRunning = false;
            this.sendMessage({ action: 'PAUSE_TIMER' });
            this.stopUpdateInterval();
            this.updateButtons();
        }
    }

    resetTimer() {
        this.isRunning = false;
        this.currentTask = null;
        this.currentTaskName.textContent = '';
        this.sendMessage({ action: 'RESET_TIMER' });
        this.timeLeft = 25 * 60;
        this.stopUpdateInterval();
        this.updateDisplay();
        this.updateButtons();
    }

    updateButtons() {
        this.startBtn.disabled = this.isRunning;
        this.pauseBtn.disabled = !this.isRunning;
    }

    updateDisplay() {
        if (this.timeDisplay) {
            const minutes = Math.floor(this.timeLeft / 60);
            const seconds = this.timeLeft % 60;
            this.timeDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }
    }

    deleteTask(taskId) {
        this.tasks = this.tasks.filter(task => task.id !== taskId);
        this.saveTasks();
        this.renderTasks();
        
        if (this.currentTask && this.currentTask.id === taskId) {
            this.currentTask = null;
            this.currentTaskName.textContent = '';
            this.resetTimer();
        }
    }

    renderTasks() {
        this.taskList.innerHTML = '';
        this.tasks.forEach(task => this.renderTask(task));
    }

    saveTasks() {
        chrome.storage.local.set({ tasks: this.tasks });
    }

    saveTags() {
        chrome.storage.local.set({ tags: this.tags });
    }

    saveCompletedTasks() {
        chrome.storage.local.set({ completedTasks: this.completedTasks });
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    const pomodoroTimer = new PomodoroTimer();
    window.pomodoroTimer = pomodoroTimer;
}); 