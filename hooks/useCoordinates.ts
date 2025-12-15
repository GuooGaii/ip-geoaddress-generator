import { useQuery } from "@tanstack/react-query";
import { addressService } from "@/services/addressService";
import { coordinatesSignal } from "@/signals/addressSignal";
import type { Coordinates } from "@/app/types";

export default function useCoordinates(ip: string | null) {
  const coordinatesQuery = useQuery<Coordinates | null, Error>({
    queryKey: ["coordinates", ip],
    queryFn: async () => {
      console.log("获取坐标请求发起");
      if (!ip) return null;
      const response = await addressService.getIPCoordinates(ip);
      coordinatesSignal.value = response;
      return response;
    },
    enabled: ip !== null && ip !== "",
    refetchOnWindowFocus: false,
  });

  return coordinatesQuery;
}
