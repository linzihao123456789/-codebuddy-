# Network Iris - 网络根因分析可视化系统

一个完整的网络拓扑可视化系统，用于实时监控和分析网络故障。

## 🌟 功能特性

### 📊 网络可视化
- **三层网络拓扑**：CORE → AGG → TOR 架构
- **实时渲染**：417个网络节点的动态可视化
- **交互式界面**：点击节点查看详细信息
- **聚焦视图**：深度分析特定AGG节点的TOR连接

### 🚨 故障模拟
- **TOR故障**：单台接入交换机故障模拟
- **AGG故障**：聚合层故障影响分析
- **CORE故障**：核心层关键故障场景
- **高负载**：流量超载状态模拟

### 📈 实时监控
- **网络指标**：总节点数、平均流量、丢包率
- **告警系统**：自动检测异常并生成告警
- **连接状态**：实时显示后端连接状态
- **节点详情**：IP地址、状态、温度、CPU使用率等

### 🔄 后端集成
- **RESTful API**：完整的网络数据接口
- **实时更新**：每2秒自动刷新数据
- **故障注入**：通过API动态注入故障场景

## 🚀 快速开始

### 前置要求
- Node.js 18+
- 现代浏览器（支持Canvas和ES6）

### 安装步骤

1. **克隆仓库**
```bash
git clone https://github.com/linzihao123456789/-codebuddy-.git
cd -codebuddy-
```

2. **安装依赖**
```bash
npm install
```

3. **启动后端服务器**
```bash
node server.cjs
```
后端将在 `http://localhost:3001` 运行

4. **启动前端开发服务器**
```bash
npm run dev
```
前端将在 `http://localhost:3000` 运行

### 直接运行（已构建版本）

直接打开 `index-backend.html` 文件即可使用完整功能（需要后端服务器运行）

## 📁 项目结构

```
├── server.cjs              # 后端服务器
├── index-backend.html       # 主界面（带后端集成）
├── index.html             # 简化版界面
├── components/            # React组件
│   ├── NetworkIris.tsx   # 网络可视化组件
│   ├── Sidebar.tsx        # 侧边栏组件
│   └── Controls.tsx      # 控制面板组件
├── utils/               # 工具函数
│   └── networkGenerator.ts # 网络拓扑生成器
├── types.ts             # TypeScript类型定义
├── constants.ts         # 常量配置
└── style.css           # 样式文件
```

## 🔧 API 接口

### 网络数据
- `GET /api/network` - 获取完整网络拓扑
- `GET /api/metrics` - 获取网络指标
- `GET /api/alerts` - 获取告警信息
- `GET /api/node/:id` - 获取单个节点详情

### 故障注入
- `POST /api/inject-fault` - 注入网络故障

```json
{
  "type": "TOR_FAILURE | AGG_FAILURE | CORE_FAILURE | HIGH_LOAD | RESET",
  "targetNodeId": "NODE-123"  // 可选，指定目标节点
}
```

## 🎮 使用指南

### 基础操作
1. **查看网络拓扑**：打开主界面查看完整网络图
2. **节点交互**：点击任意节点查看详细信息
3. **故障模拟**：使用左下角控制面板模拟不同故障场景

### 高级功能
1. **聚焦视图**：点击AGG节点进入聚焦模式，查看其连接的TOR节点
2. **实时监控**：右侧面板显示实时网络指标和告警
3. **数据刷新**：数据每3秒自动更新，确保看到最新状态

## 🛠️ 技术栈

- **前端**：React 18, Canvas API, CSS3
- **后端**：Node.js, HTTP API
- **数据**：实时网络模拟算法
- **可视化**：Canvas 2D渲染，粒子动画效果

## 📊 性能特性

- **高性能渲染**：使用Canvas 2D实现流畅动画
- **内存优化**：智能节点更新策略
- **响应式设计**：自适应不同屏幕尺寸
- **实时通信**：高效的API数据交换

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

---

**网络虹形系统** - 让网络故障分析变得直观和高效！