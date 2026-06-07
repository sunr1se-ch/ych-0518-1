# 青藏高原草甸科考点 - 冻土活动层厚度与地温梯度剖面对比看板

## 项目简介

本项目为青藏高原草甸科考点的冻土监测数据可视化看板，用于科研人员分析不同坡向、不同海拔的冻土活动层厚度与地温梯度数据对比。

## 功能特性

- 🔍 **多维度筛选**：支持坡向多选、日期范围筛选
- 📊 **数据可视化**：
  - 活动层厚度柱状图（各剖面对比）
  - 地温差折线图（50cm-20cm 日均值趋势）
  - 邻剖面厚度差散点图（同坡向相邻海拔对比）
  - 剖面布设示意图（按坡向分组展示）
- 📈 **统计指标**：实时展示剖面数量、平均厚度、平均温差、采样记录数
- 📥 **数据导入**：支持CSV格式批量导入新采样数据
- 📤 **数据导出**：一键导出当前筛选条件下的分析结果
- 🐳 **Docker部署**：一键启动，无需复杂配置

## 技术栈

### 后端
- Python 3.11 + Flask 3.x
- SQLAlchemy ORM + SQLite
- pandas 数据处理
- Gunicorn WSGI服务器

### 前端
- React 18 + TypeScript
- Vite 构建工具
- TailwindCSS 3 样式
- ECharts 5 图表库
- Zustand 状态管理
- Lucide React 图标

## 快速开始

### 方式一：Docker 一键部署（推荐）

```bash
# 克隆项目
git clone <repository-url>
cd ych-0518-1

# 构建并启动
docker-compose up -d --build

# 访问看板
# 打开浏览器访问: http://localhost:8080
```

### 方式二：本地开发模式

#### 启动后端服务
```bash
cd backend
pip install -r requirements.txt
python run.py
# 后端服务运行在: http://localhost:5000
```

#### 启动前端服务
```bash
cd frontend
npm install
npm run dev
# 前端服务运行在: http://localhost:5173
```

## 数据说明

### 种子数据
系统预置了10个监测剖面（北坡、南坡、东坡、西坡各2-3个）以及2024年5月-9月的采样数据，共计310条记录。

### 数据格式

#### 监测剖面
| 字段 | 说明 | 示例 |
|------|------|------|
| profile_no | 剖面号 | P001 |
| altitude | 海拔(米) | 4200 |
| aspect | 坡向 | 北坡 |

#### 采样记录
| 字段 | 说明 | 示例 |
|------|------|------|
| profile_no | 剖面号 | P001 |
| sample_date | 采样日期 | 2024-05-01 |
| active_layer_thickness | 活动层厚度(cm) | 80.5 |
| temp_20cm | 地表下20cm地温(℃) | 3.2 |
| temp_50cm | 地表下50cm地温(℃) | 5.0 |

### 核心计算逻辑
1. **活动层厚度日均值**：按剖面号+日期分组，计算活动层厚度平均值
2. **地温差日均值**：按剖面号+日期分组，计算(50cm - 20cm)地温差的平均值
3. **邻剖面判定**：同坡向内按海拔排序，相邻海拔的剖面互为邻剖面
4. **邻剖面厚度差**：同一时段内，两邻剖面的时段平均厚度差值

## 数据导入

### CSV文件格式
```csv
profile_no,sample_date,active_layer_thickness,temp_20cm,temp_50cm
P001,2024-10-01,93.5,4.5,7.2
P001,2024-10-02,92.0,4.3,6.9
P002,2024-10-01,89.0,4.0,6.5
```

### 注意事项
- 剖面号必须在系统中已存在
- 日期格式必须为 YYYY-MM-DD
- 数值字段不允许为空

## 项目结构

```
ych-0518-1/
├── backend/                    # 后端服务
│   ├── app/
│   │   ├── __init__.py
│   │   ├── models.py          # 数据模型
│   │   ├── routes.py          # API路由
│   │   ├── services.py        # 业务逻辑
│   │   ├── schemas.py         # 数据结构
│   │   └── seed_data/         # 种子数据
│   ├── data/                  # SQLite数据库
│   ├── requirements.txt
│   ├── config.py
│   ├── run.py
│   └── Dockerfile
├── frontend/                   # 前端应用
│   ├── src/
│   │   ├── components/        # 图表组件
│   │   ├── pages/             # 页面组件
│   │   ├── store/             # 状态管理
│   │   ├── services/          # API服务
│   │   ├── types/             # TypeScript类型
│   │   ├── utils/             # 工具函数
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   ├── nginx.conf
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## API接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/health | 健康检查 |
| GET | /api/aspects | 获取坡向列表 |
| GET | /api/date-range | 获取数据日期范围 |
| GET | /api/profiles | 获取剖面列表 |
| GET | /api/samples | 获取采样记录 |
| GET | /api/statistics/summary | 获取统计摘要 |
| GET | /api/statistics/daily | 获取日均值统计 |
| GET | /api/statistics/neighbor-diff | 获取邻剖面差值 |
| POST | /api/samples/import | 导入采样数据 |
| GET | /api/export | 导出分析结果 |

## 常用命令

```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 查看日志
docker-compose logs -f

# 重启服务
docker-compose restart

# 重建并启动
docker-compose up -d --build
```

## 数据持久化

SQLite数据库文件存储在 `backend/data/permafrost.db`，Docker部署时通过volume挂载，容器销毁后数据不会丢失。

## License

MIT License
