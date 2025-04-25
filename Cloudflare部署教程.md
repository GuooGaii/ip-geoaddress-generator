# Cloudflare Pages 部署教程

## 1. Fork 项目仓库

1. 访问 [GuooGaiiip-geoaddress-generator](https://github.com/GuooGaii/ip-geoaddress-generator)
2. 点击右上角的 "Fork" 按钮创建你自己的副本

## 2. 在 Cloudflare 中部署

### 2.1 前置准备
1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 在左侧菜单找到并点击 "Pages"
3. 点击 "连接到 Git" 按钮
4. 按提示关联你的 GitHub 账号

### 2.2 创建项目
1. 选择你刚才 fork 的仓库
2. 点击 "开始设置"
3. 在项目配置页面:
   - 框架预设: 选择 `Next.js`（**注意：不要选择 Next.js Static HTML Export**）

> 提示：首次部署可能会出现错误提示,这是正常现象。按照步骤 2.3 启用 Node.js 兼容性并重新部署即可解决。

### 2.3 启用 Node.js 兼容性
1. 部署完成后,进入项目设置
2. 在“运行时”类目下找到“兼容性标志”，填入 `nodejs_compat`。

### 2.4 完成部署
1. 回到 "部署" 页面
2. 点击 "重新部署" 按钮
3. 等待部署完成,访问分配的域名即可使用
