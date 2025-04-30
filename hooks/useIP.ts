import { useQuery } from "@tanstack/react-query";
import { ipSignal } from "@/signals/ipSignal";
import { ipService } from "@/services/ipService";
import type { IPResponse } from "@/services/ipService";

export default function useIP() {
  const IPQuery = useQuery<IPResponse, Error>({
    queryKey: ["ip"],
    queryFn: async () => {
      console.log("IP请求发起");
      const response = await ipService.fetchIP();
      ipSignal.value = response.ip;
      return response;
    },
    refetchOnWindowFocus: false, // 在窗口重新聚焦时不要重新获取数据
  });

  return IPQuery;
}
