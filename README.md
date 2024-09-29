# 基于IP的真实地址生成器 🌍

这是一个基于Web的应用程序，可以根据IP地址生成真实的随机地址信息。它使用多个API来获取位置数据和随机用户信息，为用户提供一个完整的虚拟身份。

## 访问地址

https://ip-geoaddress-generator.pages.dev/

## 功能特点

- 自动检测用户当前IP地址
- 支持手动输入IP地址
- 生成随机的真实地址信息，包括：
  - 姓名
  - 电话号码
  - 街道地址
  - 城市
  - 州/省
  - 邮政编码
  - 国家
- 显示生成地址的Google地图
- 一键复制各项信息
- 保存生成的地址
- 搜索保存的地址
- 删除单个或所有保存的地址
- 将保存的地址导出为TXT文件
- 响应式设计，适配各种设备
- 支持浅色/深色主题切换

## 一键部署到cloudflare

[![Deploy to Cloudflare Pages](https://deploy.workers.cloudflare.com/button)](https://deploy.cloudflare.dev/?url=https://github.com/GuooGaii/ip-geoaddress-generator)

## 本地开发

1. 克隆仓库：
   ```bash
   git clone https://github.com/GuooGaii/ip-geoaddress-generator.git
   ```

2. 安装依赖：
   ```bash
   cd ip-geoaddress-generator
   pnpm install
   ```

3. 运行开发服务器：
   ```bash
   pnpm dev
   ```

4. 在浏览器中打开 `http://localhost:3000`

## 注意事项

- 本项目仅用于教育和娱乐目的
- 生成的地址信息是随机的，不应用于任何实际或法律用途
- 请遵守API使用条款和限制

## 贡献

欢迎提交问题和拉取请求。对于重大更改，请先开issue讨论您想要更改的内容。

## 许可证

[MIT](https://choosealicense.com/licenses/mit/)