// Version: 2.0.0 - 完全移除 ipify 依赖
import { useQuery } from "@tanstack/react-query";
import { ipSignal } from "@/signals/ipSignal";
import { ipService } from "@/services/ipService";
import type { IPResponse } from "@/services/ipService";

export default function useIP() {
  console.log("🔄 useIP Hook v2.0.0 初始化");
  
  const IPQuery = useQuery<IPResponse, Error>({
    queryKey: ["ip", "v2"],
    queryFn: async () => {
      console.log("🚀 IP 请求发起 (v2.0.0)");
      console.log("请求时间:", new Date().toISOString());
      
      try {
        const response = await ipService.fetchIP();
        console.log("✅ IP 获取成功:", response.ip);
        ipSignal.value = response.ip;
        return response;
      } catch (error) {
        console.error("❌ IP 获取失败:", error);
        throw error;
      }
    },
    refetchOnWindowFocus: false, // 在窗口重新聚焦时不要重新获取数据
    staleTime: 0, // 立即过期，确保每次都获取最新数据
    gcTime: 0, // 不缓存
  });

  return {
    isLoading: IPQuery.isLoading,
    error: IPQuery.error,
  };
}
