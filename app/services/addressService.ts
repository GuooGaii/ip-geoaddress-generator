import axios from "axios";
import type { User, Address, HistoryRecord } from "../types";

export type ExportFormat = "json" | "csv";

export default class WFDService {
  /**
   * 获取当前用户的IP地址 (v2.0.0)
   * @description 使用本地 API 和降级策略获取 IP 地址
   * @returns {Promise<{ ip: string }>} 包含IP地址的对象
   */
  async getCurrentIP(): Promise<{ ip: string }> {
    console.log("=== addressService v2.0.0: getCurrentIP 开始 ===");
    
    // 方法 1: 使用本地 API
    try {
      console.log("尝试方法 1: 本地 API (/api/ip)");
      const response = await fetch("/api/ip", {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data?.ip) {
          console.log("✅ 方法 1 成功:", data.ip);
          return { ip: data.ip };
        }
      }
      console.warn("⚠️ 方法 1 失败: 响应无效");
    } catch (error) {
      console.warn("⚠️ 方法 1 失败:", error);
    }

    // 方法 2: 使用 Cloudflare 同源 trace
    try {
      console.log("尝试方法 2: Cloudflare 同源 trace (/cdn-cgi/trace)");
      const response = await fetch("/cdn-cgi/trace", { cache: "no-store" });
      
      if (response.ok) {
        const text = await response.text();
        const ipMatch = text.match(/ip=([^\n]+)/);
        if (ipMatch && ipMatch[1]) {
          console.log("✅ 方法 2 成功:", ipMatch[1]);
          return { ip: ipMatch[1] };
        }
      }
      console.warn("⚠️ 方法 2 失败: 无法解析 IP");
    } catch (error) {
      console.warn("⚠️ 方法 2 失败:", error);
    }

    // 方法 3: 使用 Cloudflare 公网 trace
    try {
      console.log("尝试方法 3: Cloudflare 公网 trace (https://1.1.1.1/cdn-cgi/trace)");
      const response = await fetch("https://1.1.1.1/cdn-cgi/trace", {
        cache: "no-store",
      });
      
      if (response.ok) {
        const text = await response.text();
        const ipMatch = text.match(/ip=([^\n]+)/);
        if (ipMatch && ipMatch[1]) {
          console.log("✅ 方法 3 成功:", ipMatch[1]);
          return { ip: ipMatch[1] };
        }
      }
      console.warn("⚠️ 方法 3 失败: 无法解析 IP");
    } catch (error) {
      console.warn("⚠️ 方法 3 失败:", error);
    }

    // 所有方法都失败
    const errorMsg = "所有 IP 获取方法都失败了";
    console.error("❌", errorMsg);
    throw new Error(errorMsg);
  }

  /**
   * 获取IP地址的坐标
   * @param ip IP地址
   * @returns {Promise<{ latitude: number, longitude: number }>} 包含坐标对象
   */
  async getIPCoordinates(
    ip: string
  ): Promise<{ latitude: number; longitude: number }> {
    try {
      const url = `https://ipapi.co/${ip}/json/`;
      const response = await axios.get(url);
      const { latitude, longitude } = response.data;
      return { latitude, longitude };
    } catch (error) {
      if (error instanceof Error) {
        console.error(`获取IP(${ip})坐标失败:`, error.message);
      }
      throw error;
    }
  }

  /**
   * 获取随机用户信息
   * @param country 国家代码
   * @returns {Promise<{ results: User[] }>} 包含用户信息的对象
   */
  async getRandomUser(country: string) {
    try {
      const url = `https://randomuser.me/api/?nat=${country}&inc=name,phone,id`;
      const response = await axios.get<{ results: User[] }>(url);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        console.error(`获取随机用户信息失败(国家: ${country}):`, error.message);
      }
      throw error;
    }
  }

  /**
   * 获取坐标
   * @param country 国家
   * @param state 省份
   * @param city 城市
   * @returns {Promise<{ lat: number, lon: number }>} 包含坐标对象
   */
  async getCoordinates(country: string, state: string, city: string) {
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${city},${state},${country}&format=json&limit=1`;
      const response = await axios.get(url);
      const { lat, lon } = response.data[0];
      return { lat, lon };
    } catch (error) {
      if (error instanceof Error) {
        console.error(
          `获取地理坐标失败(${city}, ${state}, ${country}):`,
          error.message
        );
      }
      throw error;
    }
  }

  /**
   * 生成随机经纬度偏移
   * @param baseLatitude 基准纬度
   * @param baseLongitude 基准经度
   * @returns {{ latitude: number, longitude: number }} 添加随机偏移后的经纬度
   */
  private generateRandomOffset(baseLatitude: number, baseLongitude: number) {
    // 生成大约1-2公里范围内的随机偏移
    const latOffset = (Math.random() - 0.5) * 0.02; // ±0.01度约等于1公里
    const lonOffset = (Math.random() - 0.5) * 0.02;
    return {
      latitude: baseLatitude + latOffset,
      longitude: baseLongitude + lonOffset,
    };
  }

  /**
   * 获取随机地址
   * @param latitude 纬度
   * @param longitude 经度
   * @returns {Promise<Address>} 包含地址对象
   */
  async getRandomAddress(
    latitude: number,
    longitude: number
  ): Promise<Address> {
    try {
      const { latitude: randomLat, longitude: randomLon } =
        this.generateRandomOffset(latitude, longitude);
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${randomLat}&lon=${randomLon}&format=json&accept-language=en`;
      const response = await axios.get(url);
      return response.data.address;
    } catch (error) {
      if (error instanceof Error) {
        console.error(
          `获取随机地址失败(坐标: ${latitude}, ${longitude}):`,
          error.message
        );
      }
      throw error;
    }
  }

  /**
   * 导出历史记录
   * @param history 历史记录数据
   * @param format 导出格式，默认为json
   * @returns {Blob} 导出的文件Blob对象
   */
  exportHistory(history: HistoryRecord[], format: ExportFormat = "json"): Blob {
    switch (format) {
      case "json":
        return new Blob([JSON.stringify(history, null, 2)], {
          type: "application/json",
        });
      // 未来可以在这里添加其他格式的支持
      default:
        throw new Error(`不支持的导出格式: ${format}`);
    }
  }

  /**
   * 获取导出文件名
   * @param format 导出格式
   * @returns {string} 文件名
   */
  getExportFileName(format: ExportFormat = "json"): string {
    const date = new Date().toISOString().split("T")[0];
    return `address-history-${date}.${format}`;
  }

  /**
   * 生成谷歌地图链接
   * @param address 地址对象
   * @returns {string} 谷歌地图链接
   */
  getGoogleMapUrl(address: Address): string {
    const addressString = [
      address.road,
      address.city,
      address.state,
      address.country,
    ]
      .filter(Boolean)
      .join(", ");
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      addressString
    )}`;
  }
}
