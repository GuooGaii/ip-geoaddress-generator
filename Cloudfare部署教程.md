1. **Fork GitHub 仓库**：  
   访问并 fork 我的 GitHub 仓库：[GuooGaii/ip-geoaddress-generator](https://github.com/GuooGaii/ip-geoaddress-generator)。
   
2. **关联 GitHub 账号**：  
   在 Cloudflare 中关联自己的 GitHub 账号。

3. **创建 Page 项目**：  
   使用 Git 方式创建 Cloudflare Page 项目，选择你 fork 的仓库。

4. **设置框架与构建命令**：  
   在框架预设中选择 Next.js（不要选择 Next.js (Static HTML Export)），构建命令为：`pnpm dlx @cloudflare/next-on-pages@1`。

5. **保存并部署**：  
   初次部署会出现网页报错，这是正常的，点击“继续设置”。

6. **启用 Node.js 兼容性**：  
   进入对应的 Page 项目设置，在“运行时”类目下找到“兼容性标志”，填入 `nodejs_compat`。

7. **重新部署**：  
   回到 Page 页面，选择“重新部署”，部署完成后，网页将可以正常访问。