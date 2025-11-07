// Version: 2.0.0 - 完全移除 ipify，使用 Cloudflare 服务
export interface IPResponse {
  ip: string;
}

class IPService {
  private readonly VERSION = "2.0.0";

  async fetchIP(): Promise<IPResponse> {
    console.log(`=== IP Service v${this.VERSION}: 开始获取 IP ===`);
    console.log("时间:", new Date().toISOString());

    // 方法 1: 优先使用本地 API（后端已验证可用）
    try {
      console.log("尝试方法 1: 本地 API (/api/ip)");
      const response = await fetch("/api/ip", {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store", // 强制禁用缓存
      });

      if (response.ok) {
        const data = await response.json();
        if (data?.ip) {
          console.log("✅ 方法 1 成功:", data.ip);
          console.log("调试信息:", data.debug);
          return { ip: data.ip };
        }
      }
      console.warn("⚠️ 方法 1 失败: 响应无效", {
        status: response.status,
        statusText: response.statusText,
      });
    } catch (error) {
      console.warn("⚠️ 方法 1 失败:", error);
    }

    // 方法 2: 使用 Cloudflare 同源 trace 服务
    try {
      console.log("尝试方法 2: Cloudflare 同源 trace (/cdn-cgi/trace)");
      const response = await fetch("/cdn-cgi/trace", {
        method: "GET",
        cache: "no-store",
      });

      if (response.ok) {
        const text = await response.text();
        console.log("trace 响应:", text.substring(0, 200));
        const match = text.match(/ip=([^\n]+)/);
        if (match && match[1]) {
          const ip = match[1].trim();
          console.log("✅ 方法 2 成功:", ip);
          return { ip };
        }
      }
      console.warn("⚠️ 方法 2 失败: 无法解析 IP");
    } catch (error) {
      console.warn("⚠️ 方法 2 失败:", error);
    }

    // 方法 3: 使用 Cloudflare 公网 trace 服务（兜底）
    try {
      console.log(
        "尝试方法 3: Cloudflare 公网 trace (https://1.1.1.1/cdn-cgi/trace)"
      );
      const response = await fetch("https://1.1.1.1/cdn-cgi/trace", {
        method: "GET",
        cache: "no-store",
      });

      if (response.ok) {
        const text = await response.text();
        console.log("公网 trace 响应:", text.substring(0, 200));
        const match = text.match(/ip=([^\n]+)/);
        if (match && match[1]) {
          const ip = match[1].trim();
          console.log("✅ 方法 3 成功:", ip);
          return { ip };
        }
      }
      console.warn("⚠️ 方法 3 失败: 无法解析 IP");
    } catch (error) {
      console.warn("⚠️ 方法 3 失败:", error);
    }

    // 所有方法都失败
    console.error("❌ 所有 IP 获取方法都失败了");
    console.error("请检查网络连接和 Cloudflare Pages 配置");
    throw new Error("获取 IP 失败：所有方法都不可用");
  }
}

export const ipService = new IPService();
