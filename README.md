# Pomodoro Timer Chrome Extension

一个功能强大的番茄钟 Chrome 扩展，具有任务管理、标签分类和数据统计功能。采用现代化的 UI 设计，提供流畅的用户体验。

## 功能特点

- 🎯 任务管理
  - 创建自定义任务
  - 为每个任务设置独立的时长
  - 任务标签分类
  - 任务的开始、暂停、重置功能

- 🏷️ 标签系统
  - 创建自定义标签
  - 为标签设置颜色
  - 为任务分配标签
  - 标签管理（添加/删除）

- 📊 数据统计
  - 按时间范围查看统计（今天/本周/本月/全部）
  - 标签时间分布饼图
  - 总专注时间统计
  - 完成任务数量统计

- 🔔 通知提醒
  - 任务完成通知
  - 浏览器图标实时显示剩余时间
  - 进度颜色指示（绿色 > 60%，橙色 30-60%，红色 < 30%）

## 项目结构

```
pomodoro-timer/
├── manifest.json          # 扩展配置文件
├── popup.html            # 主界面 HTML
├── popup.js              # 主要业务逻辑
├── background.js         # 后台服务脚本
├── styles.css            # 样式文件
└── icons/               # 图标资源目录
    ├── icon16.png       # 16x16 图标
    ├── icon48.png       # 48x48 图标
    ├── icon128.png      # 128x128 图标
    └── icon.svg         # SVG 源文件
```

## 技术实现

### 主要组件

1. **popup.js (前端逻辑)**
   - `PomodoroTimer` 类：管理整个应用的核心类
   - 主要方法：
     - `startTimer()`: 启动计时器
     - `pauseTimer()`: 暂停计时器
     - `resetTimer()`: 重置计时器
     - `addTask()`: 添加新任务
     - `deleteTask()`: 删除任务
     - `addTag()`: 添加新标签
     - `updateStats()`: 更新统计数据

2. **background.js (后台服务)**
   - 计时器核心逻辑
   - 状态管理
   - 通知系统
   - 数据持久化

### API 接口

1. **消息通信接口**
   ```javascript
   chrome.runtime.sendMessage({
     action: string,    // 'START_TIMER' | 'PAUSE_TIMER' | 'RESET_TIMER' | 'GET_STATE'
     task?: object,     // 可选，任务对象
     duration?: number  // 可选，持续时间（分钟）
   })
   ```

2. **数据存储接口**
   ```javascript
   // 保存数据
   chrome.storage.local.set({
     tasks: Task[],
     tags: Tag[],
     completedTasks: CompletedTask[]
   })

   // 读取数据
   chrome.storage.local.get(['tasks', 'tags', 'completedTasks'])
   ```

### 数据结构

1. **Task (任务)**
   ```typescript
   interface Task {
     id: number;
     name: string;
     duration: number;
     tagId: number | null;
     createdAt: string;
   }
   ```

2. **Tag (标签)**
   ```typescript
   interface Tag {
     id: number;
     name: string;
     color: string;
   }
   ```

3. **CompletedTask (已完成任务)**
   ```typescript
   interface CompletedTask extends Task {
     completedAt: string;
   }
   ```

## 安装说明

1. 克隆仓库到本地
2. 打开 Chrome 浏览器，访问 `chrome://extensions/`
3. 开启右上角的"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择项目目录

## 使用指南

1. **任务管理**
   - 点击扩展图标打开主界面
   - 输入任务名称和时长
   - 选择标签（可选）
   - 点击"添加"按钮创建任务

2. **标签管理**
   - 切换到"标签"标签页
   - 输入标签名称
   - 选择标签颜色
   - 点击"添加标签"按钮

3. **统计查看**
   - 切换到"统计"标签页
   - 选择时间范围
   - 查看饼图和统计数据

## 开发说明

### 环境要求
- Chrome 浏览器 (版本 88+)
- 支持 ES6+ 的 JavaScript 环境

### 开发模式
1. 修改代码后，在扩展管理页面点击刷新按钮
2. 查看 Chrome 开发者工具的 Console 面板获取调试信息

### 构建说明
项目使用原生 JavaScript，无需构建步骤。直接加载到 Chrome 即可使用。

## 注意事项

1. 使用 `chrome.storage.local` 存储数据，容量限制为 5MB
2. 后台脚本使用 Service Worker，需要注意兼容性
3. 计时器在关闭弹窗后仍会继续运行
4. 任务数据会在浏览器中保存，清除浏览器数据会导致数据丢失

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 许可证

[MIT License](LICENSE) 