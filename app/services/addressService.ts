import type { User, Address, HistoryRecord } from "../types";

export type ExportFormat = "json" | "csv";

export default class WFDService {
  /**
   * 带超时的 fetch 请求（增强请求头）
   * @param url 请求URL
   * @param timeout 超时时间（毫秒）
   * @returns Promise<Response>
   */
  private async fetchWithTimeout(url: string, timeout = 10000): Promise<Response> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, { 
        signal: controller.signal,
        headers: { 
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      });
      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      throw error;
    }
  }

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
   * 获取IP地址的坐标（带多API备用）
   * @param ip IP地址
   * @returns {Promise<{ latitude: number, longitude: number }>} 包含坐标对象
   */
  async getIPCoordinates(
    ip: string
  ): Promise<{ latitude: number; longitude: number }> {
    // API 1: ipapi.co
    try {
      console.log(`尝试获取IP坐标 (ipapi.co): ${ip}`);
      const response = await this.fetchWithTimeout(`https://ipapi.co/${ip}/json/`, 8000);
      if (response.ok) {
        const data = await response.json();
        if (data.latitude && data.longitude) {
          console.log("✅ IP坐标获取成功 (ipapi.co)");
          return { latitude: data.latitude, longitude: data.longitude };
        }
      }
      console.warn("⚠️ ipapi.co 返回无效数据");
    } catch (error) {
      console.warn("⚠️ ipapi.co 失败:", error);
    }

    // API 2: ip-api.com (备用)
    try {
      console.log(`尝试备用API (ip-api.com): ${ip}`);
      const response = await this.fetchWithTimeout(`http://ip-api.com/json/${ip}`, 8000);
      if (response.ok) {
        const data = await response.json();
        if (data.status === "success" && data.lat && data.lon) {
          console.log("✅ IP坐标获取成功 (ip-api.com)");
          return { latitude: data.lat, longitude: data.lon };
        }
      }
      console.warn("⚠️ ip-api.com 返回无效数据");
    } catch (error) {
      console.warn("⚠️ ip-api.com 失败:", error);
    }

    // API 3: ipwho.is (备用)
    try {
      console.log(`尝试备用API (ipwho.is): ${ip}`);
      const response = await this.fetchWithTimeout(`https://ipwho.is/${ip}`, 8000);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.latitude && data.longitude) {
          console.log("✅ IP坐标获取成功 (ipwho.is)");
          return { latitude: data.latitude, longitude: data.longitude };
        }
      }
      console.warn("⚠️ ipwho.is 返回无效数据");
    } catch (error) {
      console.warn("⚠️ ipwho.is 失败:", error);
    }

    throw new Error(`所有IP坐标API都失败了 (IP: ${ip})`);
  }

  /**
   * 从 namefake.com 获取用户数据（备用API 1）
   */
  private async fetchFromNamefake(): Promise<{ results: User[] }> {
    const response = await this.fetchWithTimeout("https://api.namefake.com/", 8000);
    if (!response.ok) throw new Error("namefake failed");
    const data = await response.json();
    const nameParts = (data.name || "John Doe").split(' ');
    return {
      results: [{
        name: { 
          first: nameParts[0] || "John", 
          last: nameParts.slice(1).join(' ') || "Doe"
        },
        phone: data.phone_h || data.phone_w || "(555) 123-4567",
        id: { name: "SSN", value: data.pict || "N/A" }
      }]
    };
  }

  /**
   * 从 fakerapi.it 获取用户数据（备用API 2）
   */
  private async fetchFromFakerapi(): Promise<{ results: User[] }> {
    const response = await this.fetchWithTimeout(
      "https://fakerapi.it/api/v1/persons?_quantity=1&_locale=en_US",
      8000
    );
    if (!response.ok) throw new Error("fakerapi failed");
    const data = await response.json();
    const person = data.data?.[0];
    if (!person) throw new Error("No person data");
    return {
      results: [{
        name: { first: person.firstname, last: person.lastname },
        phone: person.phone,
        id: { name: "N/A", value: "N/A" }
      }]
    };
  }

  /**
   * 获取随机用户信息（带超时、多服务商备用API）
   * @returns {Promise<{ results: User[] }>} 包含用户信息的对象
   */
  async getRandomUser(): Promise<{ results: User[] }> {
    // 主API：randomuser.me 多国端点
    const randomuserApis = [
      "https://randomuser.me/api/?nat=US&inc=name,phone,id",
      "https://randomuser.me/api/?nat=GB&inc=name,phone,id",
      "https://randomuser.me/api/?nat=CA&inc=name,phone,id",
    ];
    
    // 尝试 randomuser.me
    for (const apiUrl of randomuserApis) {
      try {
        console.log(`尝试获取用户数据: ${apiUrl}`);
        const response = await this.fetchWithTimeout(apiUrl, 8000);
        
        if (!response.ok) {
          console.warn(`API返回错误状态: ${response.status}`);
          continue;
        }
        
        const data = await response.json() as { results: User[] };
        console.log("✅ 用户数据获取成功 (randomuser.me)");
        return data;
      } catch (error) {
        console.warn(`API调用失败 (${apiUrl}):`, error);
        continue;
      }
    }

    // 备用API 1: namefake.com
    try {
      console.log("尝试备用API: namefake.com");
      const result = await this.fetchFromNamefake();
      console.log("✅ 用户数据获取成功 (namefake.com)");
      return result;
    } catch (error) {
      console.warn("namefake.com 失败:", error);
    }

    // 备用API 2: fakerapi.it
    try {
      console.log("尝试备用API: fakerapi.it");
      const result = await this.fetchFromFakerapi();
      console.log("✅ 用户数据获取成功 (fakerapi.it)");
      return result;
    } catch (error) {
      console.warn("fakerapi.it 失败:", error);
    }
    
    throw new Error("All user APIs failed");
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
      const response = await this.fetchWithTimeout(url, 10000);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const { lat, lon } = data[0];
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
   * 获取随机地址（带多API备用）
   * @param latitude 纬度
   * @param longitude 经度
   * @returns {Promise<Address>} 包含地址对象
   */
  async getRandomAddress(
    latitude: number,
    longitude: number
  ): Promise<Address> {
    const { latitude: randomLat, longitude: randomLon } =
      this.generateRandomOffset(latitude, longitude);

    // API 1: Nominatim (OpenStreetMap)
    try {
      console.log(`尝试获取地址 (Nominatim): ${randomLat}, ${randomLon}`);
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${randomLat}&lon=${randomLon}&format=json&accept-language=en`;
      const response = await this.fetchWithTimeout(url, 10000);
      if (response.ok) {
        const data = await response.json();
        if (data.address) {
          console.log("✅ 地址获取成功 (Nominatim)");
          return data.address;
        }
      }
      console.warn("⚠️ Nominatim 返回无效数据");
    } catch (error) {
      console.warn("⚠️ Nominatim 失败:", error);
    }

    // API 2: BigDataCloud (备用)
    try {
      console.log(`尝试备用API (BigDataCloud): ${randomLat}, ${randomLon}`);
      const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${randomLat}&longitude=${randomLon}&localityLanguage=en`;
      const response = await this.fetchWithTimeout(url, 10000);
      if (response.ok) {
        const data = await response.json();
        if (data.locality || data.city) {
          console.log("✅ 地址获取成功 (BigDataCloud)");
          // 转换为统一格式
          return {
            road: data.locality || "",
            city: data.city || data.locality || "",
            state: data.principalSubdivision || "",
            postcode: data.postcode || "",
            country: data.countryName || "",
            country_code: data.countryCode?.toLowerCase() || "",
          } as Address;
        }
      }
      console.warn("⚠️ BigDataCloud 返回无效数据");
    } catch (error) {
      console.warn("⚠️ BigDataCloud 失败:", error);
    }

    throw new Error(`所有地址API都失败了 (坐标: ${latitude}, ${longitude})`);
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
