let timer = null;
let timeLeft = 0;
let totalTime = 0;
let isRunning = false;
let currentTask = null;

// 更新扩展图标上的倒计时
function updateBadge() {
    if (timeLeft > 0) {
        // 计算进度百分比
        const progress = Math.round((timeLeft / totalTime) * 100);
        const minutes = Math.floor(timeLeft / 60);
        
        // 显示剩余分钟数和进度百分比
        chrome.action.setBadgeText({ 
            text: `${minutes}′`
        });
        
        // 根据剩余时间设置不同的颜色
        let color;
        if (progress > 60) {
            color = [76, 175, 80, 255];  // 绿色
        } else if (progress > 30) {
            color = [255, 152, 0, 255];  // 橙色
        } else {
            color = [244, 67, 54, 255];  // 红色
        }
        
        chrome.action.setBadgeBackgroundColor({ color });
        
        // 更新图标标题，显示详细信息
        const seconds = timeLeft % 60;
        const taskInfo = currentTask ? `${currentTask.name} - ` : '';
        chrome.action.setTitle({
            title: `${taskInfo}${minutes}:${String(seconds).padStart(2, '0')} (${progress}%)`
        });
    } else {
        chrome.action.setBadgeText({ text: '' });
        chrome.action.setTitle({ title: 'Pomodoro Timer' });
    }
}

// 处理计时器
function handleTimer() {
    if (timeLeft > 0) {
        timeLeft--;
        updateBadge();
        
        if (timeLeft === 0) {
            isRunning = false;
            showNotification();
            if (currentTask) {
                saveCompletedTask(currentTask);
                currentTask = null;
            }
            chrome.storage.local.remove(['currentTask', 'timeLeft', 'totalTime', 'isRunning']);
            updateBadge();
        } else {
            saveState();
        }
    }
}

// 保存完成的任务
function saveCompletedTask(task) {
    chrome.storage.local.get(['completedTasks'], (result) => {
        const completedTasks = result.completedTasks || [];
        const completedTask = {
            ...task,
            completedAt: new Date().toISOString()
        };
        completedTasks.push(completedTask);
        chrome.storage.local.set({ completedTasks });
    });
}

// 显示通知
function showNotification() {
    chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: '番茄钟提醒',
        message: currentTask ? 
            `任务 "${currentTask.name}" 已完成！` : 
            '时间到！'
    });
}

// 保存当前状态
function saveState() {
    chrome.storage.local.set({
        currentTask,
        timeLeft,
        totalTime,
        isRunning
    });
}

// 启动计时器
function startTimer(task, duration) {
    stopTimer();
    currentTask = task;
    timeLeft = duration * 60;
    totalTime = timeLeft;
    isRunning = true;
    timer = setInterval(handleTimer, 1000);
    updateBadge();
    saveState();
    return {
        success: true,
        timeLeft,
        totalTime,
        isRunning,
        currentTask
    };
}

// 停止计时器
function stopTimer() {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
    isRunning = false;
    saveState();
}

// 暂停计时器
function pauseTimer() {
    stopTimer();
    updateBadge();
    saveState();
}

// 重置计时器
function resetTimer() {
    stopTimer();
    timeLeft = 0;
    totalTime = 0;
    currentTask = null;
    updateBadge();
    chrome.storage.local.remove(['currentTask', 'timeLeft', 'totalTime', 'isRunning']);
}

// 监听来自 popup 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    let response;
    
    switch (request.action) {
        case 'START_TIMER':
            response = startTimer(request.task, request.duration);
            break;
        case 'PAUSE_TIMER':
            pauseTimer();
            response = {
                success: true,
                timeLeft,
                totalTime,
                isRunning,
                currentTask
            };
            break;
        case 'RESET_TIMER':
            resetTimer();
            response = {
                success: true,
                timeLeft: 0,
                totalTime: 0,
                isRunning: false,
                currentTask: null
            };
            break;
        case 'GET_STATE':
            response = {
                currentTask,
                timeLeft,
                totalTime,
                isRunning
            };
            break;
    }
    
    sendResponse(response);
    return true;
});

// 初始化：恢复保存的状态
chrome.storage.local.get(['currentTask', 'timeLeft', 'totalTime', 'isRunning'], (result) => {
    if (result.isRunning && result.timeLeft > 0) {
        currentTask = result.currentTask;
        timeLeft = result.timeLeft;
        totalTime = result.totalTime;
        isRunning = result.isRunning;
        timer = setInterval(handleTimer, 1000);
        updateBadge();
    }
}); 