// 全局资源类型声明（TypeScript 主流做法）
// 让 TS 识别 CSS/模块化 CSS 的导入，避免 TS2882/TS2307 等报错。

declare module "*.css" {
  const css: string;
  export default css;
}

declare module "*.module.css" {
  const classes: Record<string, string>;
  export default classes;
}

