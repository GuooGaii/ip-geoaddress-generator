import { useQuery } from "@tanstack/react-query";
import { addressService } from "@/services/addressService";
import { addressSignal, coordinatesSignal } from "@/signals/addressSignal";
import type { Coordinates, Address } from "@/app/types";

export default function useAddress(ip: string | null) {
  // 获取坐标的查询
  const coordinatesQuery = useQuery<Coordinates | null, Error>({
    queryKey: ["coordinates", ip],
    queryFn: async () => {
      console.log("获取坐标请求发起");
      if (!ip) return null;
      const response = await addressService.getIPCoordinates(ip);
      coordinatesSignal.value = response;
      return response;
    },
    enabled: ip !== null && ip !== "", // 只有当 ip 有值且不为空字符串时才启用
    refetchOnWindowFocus: false,
  });

  // 获取地址的查询
  const addressQuery = useQuery<Address | null, Error>({
    queryKey: ["address", coordinatesSignal.value],
    queryFn: async () => {
      console.log("获取地址请求发起");
      if (coordinatesSignal.value) {
        const response = await addressService.getRandomAddress(
          coordinatesSignal.value
        );
        addressSignal.value = response;
        return response;
      }
      return null;
    },
    enabled: coordinatesQuery.data !== null, // 只有当有坐标数据时才启用
    refetchOnWindowFocus: false,
  });

  return {
    isLoading: coordinatesQuery.isLoading || addressQuery.isLoading,
    error: coordinatesQuery.error || addressQuery.error,
    addressRefetch: addressQuery.refetch,
  };
}
