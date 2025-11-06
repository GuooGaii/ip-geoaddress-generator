import axios from "axios";

export interface IPResponse {
  ip: string;
}

class IPService {
  async fetchIP(): Promise<IPResponse> {
    // 调用自己的 API 路由，使用 Cloudflare 提供的请求头获取 IP
    const response = await axios.get<IPResponse>("/api/ip");
    return response.data;
  }
}

export const ipService = new IPService();
